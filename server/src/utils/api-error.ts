/** Operational error carrying an HTTP status and a stable machine code. */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(status: number, message: string, code: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }

  static unauthorized(message = "অনুগ্রহ করে আবার লগইন করুন।") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "এই কাজটি করার অনুমতি আপনার নেই।") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message = "কিছু পাওয়া যায়নি।") {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new ApiError(409, message, "CONFLICT");
  }

  static tooMany(message = "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।") {
    return new ApiError(429, message, "RATE_LIMITED");
  }

  static unavailable(message: string) {
    return new ApiError(503, message, "SERVICE_UNAVAILABLE");
  }
}