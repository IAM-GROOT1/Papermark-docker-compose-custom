/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Per-dataroom analytics page. Analytics depend on Tinybird, which has no self-hosted equivalent here, so the route explains itself instead of erroring.
 */
import AppLayout from "@/components/layouts/app";

export default function DataroomAnalyticsPage() {
  return (
    <AppLayout>
      <main className="p-4 sm:mx-4 sm:mt-4">
        <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">
          <h1 className="text-xl font-semibold">Dataroom analytics</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Detailed dataroom analytics rely on Tinybird, which is not part of
            this self-hosted stack. Visit-level data is still recorded in the
            database and shown on the link and document pages.
          </p>
        </div>
      </main>
    </AppLayout>
  );
}
