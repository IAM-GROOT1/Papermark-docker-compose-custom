import { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

import prisma from "@/lib/prisma";
import {
  getSelfHostedPlan,
  isSelfHostedPlanOverrideEnabled,
} from "@/lib/self-host/plan";
import { CustomUser } from "@/lib/types";

/**
 * [self-host] This endpoint does not exist in Papermark's public repo.
 *
 * lib/swr/use-billing.ts fetches /api/teams/:teamId/billing/plan on every page,
 * and the route is simply absent — so the request 404s, usePlan() falls back to
 * "free", and every plan-gated feature is switched off no matter what is in the
 * database. That is why a self-hosted instance shows "Free" and hides the link
 * settings behind an upgrade prompt.
 *
 * Shape matches PlanResponse in lib/swr/use-billing.ts.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { teamId } = req.query as { teamId: string };

  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
      users: { some: { userId: (session.user as CustomUser).id } },
    },
    select: {
      plan: true,
      startsAt: true,
      endsAt: true,
      pausedAt: true,
      pauseStartsAt: true,
      pauseEndsAt: true,
      cancelledAt: true,
      stripeId: true,
      subscriptionId: true,
    },
  });

  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }

  // Without Stripe there is nothing to bill, so report the configured plan.
  // See lib/self-host/plan.ts for why, and how to opt out.
  const plan = isSelfHostedPlanOverrideEnabled() ? getSelfHostedPlan() : team.plan;

  return res.status(200).json({
    plan,
    startsAt: team.startsAt,
    endsAt: team.endsAt,
    pausedAt: team.pausedAt,
    pauseStartsAt: team.pauseStartsAt,
    pauseEndsAt: team.pauseEndsAt,
    isPaused: !!team.pausedAt,
    cancelledAt: team.cancelledAt,
    trialEndsAt: null,
    isCustomer: !!team.stripeId,
    subscriptionCycle: "monthly",
    discount: null,
  });
}
