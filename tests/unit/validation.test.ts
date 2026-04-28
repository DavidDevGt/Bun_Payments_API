import { describe, it, expect } from "bun:test";
import {
  CreateServiceSchema,
  UpdateServiceSchema,
  UpdatePaymentStatusSchema,
} from "../../src/models/validation";

describe("Validation Schemas", () => {
  describe("CreateServiceSchema", () => {
    it("should validate a correct service", () => {
      const validService = {
        name: "Internet",
        amount: 49.99,
        dueDate: 10,
        category: "Utilities",
      };

      const result = CreateServiceSchema.safeParse(validService);
      expect(result.success).toBe(true);
    });

    it("should reject service with empty name", () => {
      const invalidService = {
        name: "",
        amount: 49.99,
        dueDate: 10,
        category: "Utilities",
      };

      const result = CreateServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    it("should reject service with negative amount", () => {
      const invalidService = {
        name: "Service",
        amount: -10,
        dueDate: 10,
        category: "Utilities",
      };

      const result = CreateServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    it("should reject service with invalid dueDate", () => {
      const invalidService = {
        name: "Service",
        amount: 49.99,
        dueDate: 32,
        category: "Utilities",
      };

      const result = CreateServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    it("should reject service with invalid dueDate (0)", () => {
      const invalidService = {
        name: "Service",
        amount: 49.99,
        dueDate: 0,
        category: "Utilities",
      };

      const result = CreateServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    it("should require all fields", () => {
      const incompleteService = {
        name: "Service",
        amount: 49.99,
      };

      const result = CreateServiceSchema.safeParse(incompleteService);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateServiceSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate = {
        amount: 59.99,
      };

      const result = UpdateServiceSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should allow empty partial update", () => {
      const emptyUpdate = {};

      const result = UpdateServiceSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });

    it("should validate multiple fields", () => {
      const update = {
        name: "New Name",
        amount: 99.99,
        dueDate: 20,
      };

      const result = UpdateServiceSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });

  describe("UpdatePaymentStatusSchema", () => {
    it("should validate paid status", () => {
      const payment = {
        status: "paid",
        paymentMethod: "Credit Card",
      };

      const result = UpdatePaymentStatusSchema.safeParse(payment);
      expect(result.success).toBe(true);
    });

    it("should validate pending status", () => {
      const payment = {
        status: "pending",
      };

      const result = UpdatePaymentStatusSchema.safeParse(payment);
      expect(result.success).toBe(true);
    });

    it("should validate overdue status", () => {
      const payment = {
        status: "overdue",
      };

      const result = UpdatePaymentStatusSchema.safeParse(payment);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const payment = {
        status: "invalid",
      };

      const result = UpdatePaymentStatusSchema.safeParse(payment);
      expect(result.success).toBe(false);
    });

    it("should reject missing status", () => {
      const payment = {
        paymentMethod: "Credit Card",
      };

      const result = UpdatePaymentStatusSchema.safeParse(payment);
      expect(result.success).toBe(false);
    });
  });
});
