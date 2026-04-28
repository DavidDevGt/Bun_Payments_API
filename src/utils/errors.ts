export type HTTPStatus = 200 | 201 | 400 | 404 | 409 | 500;

export class AppError extends Error {
  constructor(
    public statusCode: HTTPStatus,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(500, message, "INTERNAL_SERVER_ERROR");
    this.name = "InternalServerError";
  }
}

export const formatErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      success: false,
      code: error.code,
      message: error.message,
      ...(error instanceof ValidationError && { details: error.details }),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    };
  }

  return {
    success: false,
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  };
};
