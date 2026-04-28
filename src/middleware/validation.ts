import type { Context } from "hono";
import { z } from "zod";
import { ValidationError } from "../utils/errors";

export const validateJSON =
  (schema: z.ZodSchema) => async (c: Context, next: () => Promise<void>) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.set("validated", validated);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        }));
        throw new ValidationError("Request validation failed", fieldErrors);
      }
      throw error;
    }
  };

export const validateQuery =
  (schema: z.ZodSchema) => async (c: Context, next: () => Promise<void>) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);
      c.set("validatedQuery", validated);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("Query validation failed");
      }
      throw error;
    }
  };
