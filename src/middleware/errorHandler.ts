import type { Context } from "hono";
import { AppError, formatErrorResponse, InternalServerError } from "../utils/errors";

export const errorHandler = async (error: Error, c: Context) => {
  console.error("[ERROR]", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof AppError) {
    return c.json(formatErrorResponse(error), error.statusCode);
  }

  const internalError = new InternalServerError();
  return c.json(formatErrorResponse(internalError), 500);
};
