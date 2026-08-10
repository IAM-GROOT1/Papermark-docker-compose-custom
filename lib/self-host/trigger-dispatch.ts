/**
 * [self-host] Makes Trigger.dev optional.
 *
 * Papermark dispatches document conversion to Trigger.dev from inside the
 * upload request. With no TRIGGER_SECRET_KEY the SDK throws, which fails the
 * whole upload — even though the document row has already been written, and the
 * self-hosted worker (see pages/api/self-host/process-pending.ts) is perfectly
 * capable of rendering it a few seconds later.
 *
 * Guarding each dispatch on this keeps upstream behaviour identical whenever
 * Trigger.dev *is* configured.
 */

export const isTriggerConfigured = () => !!process.env.TRIGGER_SECRET_KEY;

/**
 * Conversions with no self-hosted equivalent (Office/Keynote → PDF, video
 * transcoding) are silently dropped without Trigger.dev. Say so, once, rather
 * than leaving someone staring at a document that never processes.
 */
export const logSkippedConversion = (type: string) => {
  console.log(
    `[self-host] Trigger.dev is not configured — "${type}" documents cannot be converted. ` +
      `The file is stored and downloadable, but will not render in the viewer. Upload a PDF instead.`,
  );
};
