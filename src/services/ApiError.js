/**
 * @file ApiError.js
 * @description Typed error thrown by every api.js call, plus the shared logic
 * for parsing the backend's error envelope. The backend returns `detail` in
 * three different shapes depending on the code path:
 *   1. A plain string (raw FastAPI HTTPException, e.g. "Chat session not found")
 *   2. An object {status, message, details?} (the custom raise_api_error() envelope)
 *   3. An array of {loc, msg, type} (default Pydantic 422 validation errors)
 */

export class ApiError extends Error {
  constructor({ status, message, fieldErrors = null, rawDetail = null, isNetworkError = false }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.rawDetail = rawDetail;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Parses a backend error response body into a normalized {message, fieldErrors} shape.
 * @param {any} body - The parsed JSON response body (or {} if parsing failed).
 * @param {number} status - The HTTP status code.
 */
export function parseErrorBody(body, status) {
  const detail = body?.detail;

  // Shape 1: plain string detail
  if (typeof detail === 'string') {
    return { message: detail, fieldErrors: null };
  }

  // Shape 3: Pydantic validation array
  if (Array.isArray(detail)) {
    const fieldErrors = {};
    const parts = [];
    for (const item of detail) {
      const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : 'field';
      const msg = item?.msg || 'Invalid value';
      fieldErrors[field] = msg;
      parts.push(`${field}: ${msg}`);
    }
    return {
      message: parts.length ? parts.join('; ') : `Validation failed (${status})`,
      fieldErrors,
    };
  }

  // Shape 2: custom {status, message, details?} envelope
  if (detail && typeof detail === 'object' && typeof detail.message === 'string') {
    return { message: detail.message, fieldErrors: null };
  }

  // Unrecognized / missing body
  return { message: `API Error: ${status}`, fieldErrors: null };
}
