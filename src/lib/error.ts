
export class ForbiddenError extends Error {
  public readonly statuscode = 403;
  constructor(message = "You do not have permission to access this resource") {
    super(message);
    this.name = "ForbiddenError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForbiddenError);
    }
  }
}
