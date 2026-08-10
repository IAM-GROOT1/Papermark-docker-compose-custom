/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports `@/lib/api/errors` but does not ship it — it
 * lives in their private repo, which is why upstream `main` does not build.
 *
 * The error-code vocabulary below is the conventional REST set that the public
 * v1 API surface uses; `unprocessable_entity` is the only one exercised by the
 * shipped code (lib/api/documents/validate-external-url.ts), the rest are here
 * so the type is usable and route handlers can widen without another patch.
 */

export const ERROR_CODES = [
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "unprocessable_entity",
  "rate_limit_exceeded",
  "internal_server_error",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unprocessable_entity: 422,
  rate_limit_exceeded: 429,
  internal_server_error: 500,
};

/**
 * An error carrying an API error code and the HTTP status that goes with it.
 *
 * `code` is also what lib/errorHandler.ts's sanitizer reads when logging, so
 * keeping the property name is deliberate.
 */
export class PapermarkApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "PapermarkApiError";
    this.code = code;
    this.statusCode = STATUS_BY_CODE[code] ?? 500;

    // Keeps `instanceof` working when compiled down to ES5 targets.
    Object.setPrototypeOf(this, PapermarkApiError.prototype);
  }
}
