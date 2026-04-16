/**
 * Operational error: safe to surface a generic message to users; logged at warn.
 */
class AppError extends Error {
  /**
   * @param {string} message — log / internal message
   * @param {{
   *   code?: string;
   *   userMessage?: string;
   *   isOperational?: boolean;
   *   cause?: unknown;
   * }} [opts]
   */
  constructor(message, opts = {}) {
    const {
      code = 'APP_ERROR',
      userMessage,
      isOperational = true,
      cause,
    } = opts;
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

module.exports = { AppError };
