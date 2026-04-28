import { describe, it, expect } from "bun:test";
import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  formatErrorResponse,
} from "../../src/utils/errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create AppError with correct properties", () => {
      const error = new AppError(400, "Bad request", "BAD_REQUEST");

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request");
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.name).toBe("AppError");
    });
  });

  describe("ValidationError", () => {
    it("should create ValidationError with 400 status", () => {
      const error = new ValidationError("Invalid input");

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("ValidationError");
    });

    it("should include details in ValidationError", () => {
      const details = [{ field: "name", message: "Required" }];
      const error = new ValidationError("Invalid input", details);

      expect(error.details).toEqual(details);
    });
  });

  describe("NotFoundError", () => {
    it("should create NotFoundError with 404 status", () => {
      const error = new NotFoundError("Service");

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Service not found");
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("ConflictError", () => {
    it("should create ConflictError with 409 status", () => {
      const error = new ConflictError("Service already exists");

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Service already exists");
      expect(error.code).toBe("CONFLICT");
    });
  });

  describe("InternalServerError", () => {
    it("should create InternalServerError with 500 status", () => {
      const error = new InternalServerError();

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should allow custom message", () => {
      const error = new InternalServerError("Custom error");

      expect(error.message).toBe("Custom error");
    });
  });
});

describe("formatErrorResponse", () => {
  it("should format AppError correctly", () => {
    const error = new ValidationError("Test error", []);
    const response = formatErrorResponse(error);

    expect(response.success).toBe(false);
    expect(response.code).toBe("VALIDATION_ERROR");
    expect(response.message).toBe("Test error");
    expect(Array.isArray(response.details)).toBe(true);
  });

  it("should format NotFoundError correctly", () => {
    const error = new NotFoundError("Service");
    const response = formatErrorResponse(error);

    expect(response.success).toBe(false);
    expect(response.code).toBe("NOT_FOUND");
    expect(response.message).toBe("Service not found");
  });

  it("should format generic Error correctly", () => {
    const error = new Error("Generic error");
    const response = formatErrorResponse(error);

    expect(response.success).toBe(false);
    expect(response.code).toBe("INTERNAL_SERVER_ERROR");
    expect(response.message).toBe("Generic error");
  });

  it("should handle unknown error type", () => {
    const response = formatErrorResponse("unknown");

    expect(response.success).toBe(false);
    expect(response.code).toBe("UNKNOWN_ERROR");
  });
});
