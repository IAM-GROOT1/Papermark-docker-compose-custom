import prisma from "@/lib/prisma";

import { SlackClient, getSlackClient } from "./client";
import { getSlackEnv, isSlackConfigured } from "./env";
import { createSlackMessage } from "./templates";
import { SlackEventData, SlackIntegrationServer } from "./types";

export class SlackEventManager {
  // [self-host] Resolved on first use rather than in the constructor.
  //
  // `slackEventManager` at the bottom of this file is instantiated at module
  // scope, and SlackClient's constructor throws without SLACK_CLIENT_ID /
  // SLACK_CLIENT_SECRET. Since `next build` imports every route to collect page
  // data, that made a Slack app mandatory just to build — and made the whole
  // /api/views-dataroom route unloadable at runtime without one.
  //
  // client.ts already exposes a lazy getSlackClient(); this just uses it.
  private _client: SlackClient | null = null;

  private get client(): SlackClient {
    if (!this._client) {
      this._client = getSlackClient();
    }
    return this._client;
  }

  /**
   * Check if the viewer's email domain is in the team's ignored domains list
   */
  private isViewerDomainIgnored(
    viewerEmail: string | undefined,
    ignoredDomains: string[] | null,
  ): boolean {
    if (!viewerEmail || !ignoredDomains || ignoredDomains.length === 0) {
      return false;
    }

    const viewerDomain = viewerEmail.split("@").pop();
    if (!viewerDomain) {
      return false;
    }

    // Normalize ignored domains (remove @ prefix if present)
    const normalizedIgnoredDomains = ignoredDomains.map((d) =>
      d.startsWith("@") ? d.substring(1) : d,
    );

    return normalizedIgnoredDomains.includes(viewerDomain);
  }

  async processEvent(eventData: SlackEventData): Promise<void> {
    // [self-host] Nothing to notify when no Slack app is set up. getSlackEnv()
    // throws in that case, and the catch below turned it into an error log on
    // every document view.
    if (!isSlackConfigured()) {
      return;
    }

    try {
      const env = getSlackEnv();

      // Fetch integration and team's ignored domains in parallel
      const [integration, team] = await Promise.all([
        prisma.installedIntegration.findUnique({
          where: {
            teamId_integrationId: {
              teamId: eventData.teamId,
              integrationId: env.SLACK_INTEGRATION_ID,
            },
          },
          select: {
            enabled: true,
            credentials: true,
            configuration: true,
          },
        }),
        prisma.team.findUnique({
          where: { id: eventData.teamId },
          select: { ignoredDomains: true },
        }),
      ]);

      if (!integration || !integration.enabled) {
        return;
      }

      // Check if the viewer's email domain is in the ignored domains list
      if (
        this.isViewerDomainIgnored(eventData.viewerEmail, team?.ignoredDomains ?? null)
      ) {
        // Log only the domain to avoid persisting PII
        const redactedDomain = eventData.viewerEmail?.split("@").pop() ?? "unknown-domain";
        console.log(
          `Slack notification skipped for ignored domain: ${redactedDomain}`,
        );
        return;
      }

      await this.sendSlackNotification(
        eventData,
        integration as SlackIntegrationServer,
      );
    } catch (error) {
      console.error("Error processing Slack event:", error);
    }
  }

  /**
   * Send slack notification for an event
   */
  private async sendSlackNotification(
    eventData: SlackEventData,
    integration: SlackIntegrationServer,
  ): Promise<void> {
    try {
      const channels = await this.getNotificationChannels(
        eventData,
        integration,
      );

      if (channels.length === 0) {
        return;
      }

      for (const channel of channels) {
        try {
          const message = await createSlackMessage(eventData);
          if (message) {
            const slackMessage = {
              ...message,
              channel: channel.id,
            };
            await this.client.sendMessage(
              integration.credentials.accessToken,
              slackMessage,
            );
          }
        } catch (channelError) {
          console.error(
            `Error sending to channel ${channel.name || channel.id}:`,
            channelError,
          );
        }
      }
    } catch (error) {
      console.error("Error sending instant notification:", error);
    }
  }

  // private async getSlackIntegration(teamId: string) {
  //   const env = getSlackEnv();
  //   return await prisma.installedIntegration.findUnique({
  //     where: {
  //       teamId_integrationId: {
  //         teamId,
  //         integrationId: env.SLACK_INTEGRATION_ID,
  //       },
  //       enabled: true,
  //     },
  //   });
  // }

  // private isEventTypeEnabled(eventType: string, integration: any): boolean {
  //   const notificationTypes = integration.notificationTypes || {};
  //   return notificationTypes[eventType] || false;
  // }

  private async getNotificationChannels(
    eventData: SlackEventData,
    integration: SlackIntegrationServer,
  ): Promise<any[]> {
    const enabledChannels = integration.configuration?.enabledChannels || {};
    return Object.values(enabledChannels)
      .filter((channel: any) => channel.enabled)
      .filter(
        (channel: any) =>
          channel.notificationTypes &&
          channel.notificationTypes.includes(eventData.eventType),
      );
  }
}

export const slackEventManager = new SlackEventManager();

export async function notifyDocumentView(
  data: Omit<SlackEventData, "eventType">,
) {
  await slackEventManager.processEvent({ ...data, eventType: "document_view" });
}

export async function notifyDataroomAccess(
  data: Omit<SlackEventData, "eventType">,
) {
  await slackEventManager.processEvent({
    ...data,
    eventType: "dataroom_access",
  });
}

export async function notifyDocumentDownload(
  data: Omit<SlackEventData, "eventType">,
) {
  await slackEventManager.processEvent({
    ...data,
    eventType: "document_download",
  });
}
