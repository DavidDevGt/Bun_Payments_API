import { describe, it, expect, beforeAll, afterEach } from "bun:test";
import { Hono } from "hono";
import paymentsRoutes from "../../src/routes/payments";
import servicesRoutes from "../../src/routes/services";
import { setupTestDB, cleanupTestDB, seedTestData } from "../setup";
import { TestClient } from "../helpers/test-client";
import { errorHandler } from "../../src/middleware/errorHandler";
import { isValidPayment } from "../utils/test-data";

let app: Hono;
let client: TestClient;

beforeAll(async () => {
  await setupTestDB();

  app = new Hono();
  app.route("/api/v1/payments", paymentsRoutes);
  app.route("/api/v1/services", servicesRoutes);
  app.onError(errorHandler);
  client = new TestClient(app);
});

describe("Payments Integration Tests", () => {
  afterEach(async () => {
    await cleanupTestDB();
  });

  describe("POST /api/v1/payments/monthly", () => {
    it("should create monthly payments successfully", async () => {
      await seedTestData();

      const response = await client.post("/api/v1/payments/monthly", {});

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    it("should create payments for all services", async () => {
      const { services } = await seedTestData();

      const response = await client.post("/api/v1/payments/monthly", {});

      expect(response.data.data.length).toBe(services.length);
    });

    it("should not create duplicate payments for same month", async () => {
      await seedTestData();

      await client.post("/api/v1/payments/monthly", {});
      const response = await client.post("/api/v1/payments/monthly", {});

      expect(response.data.message).toContain("already exist");
    });

    it("should create payments with correct structure", async () => {
      await seedTestData();

      const response = await client.post("/api/v1/payments/monthly", {});

      response.data.data.forEach((payment: unknown) => {
        expect(isValidPayment(payment)).toBe(true);
        if (isValidPayment(payment)) {
          expect(payment.status).toBe("pending");
          expect(payment.amount).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("GET /api/v1/payments/month", () => {
    it("should get payments by month", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const response = await client.get("/api/v1/payments/month");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it("should filter by specific month", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await client.get(`/api/v1/payments/month?month=${currentMonth}`);

      expect(response.status).toBe(200);
      expect(response.data.count).toBeGreaterThan(0);
    });

    it("should return empty for future month", async () => {
      const futureMonth = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

      const response = await client.get(`/api/v1/payments/month?month=${futureMonth}`);

      expect(response.status).toBe(200);
      expect(response.data.data).toEqual([]);
    });
  });

  describe("GET /api/v1/payments/summary/month", () => {
    it("should get monthly summary", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const response = await client.get("/api/v1/payments/summary/month");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.month).toBeDefined();
      expect(response.data.data.totalToPay).toBeGreaterThan(0);
      expect(response.data.data.totalPaid).toBe(0);
      expect(response.data.data.totalPending).toBeGreaterThan(0);
    });

    it("should have correct summary structure", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const response = await client.get("/api/v1/payments/summary/month");
      const summary = response.data.data;

      expect(summary).toHaveProperty("month");
      expect(summary).toHaveProperty("totalToPay");
      expect(summary).toHaveProperty("totalPaid");
      expect(summary).toHaveProperty("totalPending");
      expect(summary).toHaveProperty("totalOverdue");
      expect(summary).toHaveProperty("balance");
      expect(summary).toHaveProperty("paymentsByStatus");
    });

    it("should calculate balance correctly", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const response = await client.get("/api/v1/payments/summary/month");
      const summary = response.data.data;

      const expectedBalance = summary.totalToPay - summary.totalPaid;
      expect(summary.balance).toBe(expectedBalance);
    });
  });

  describe("PUT /api/v1/payments/:id/status", () => {
    it("should update payment status to paid", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const paymentsResponse = await client.get("/api/v1/payments/month");
      const paymentId = paymentsResponse.data.data[0].id;

      const response = await client.put(`/api/v1/payments/${paymentId}/status`, {
        status: "paid",
        paymentMethod: "Credit Card",
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.status).toBe("paid");
      expect(response.data.data.paymentMethod).toBe("Credit Card");
    });

    it("should update status to overdue", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const paymentsResponse = await client.get("/api/v1/payments/month");
      const paymentId = paymentsResponse.data.data[0].id;

      const response = await client.put(`/api/v1/payments/${paymentId}/status`, {
        status: "overdue",
      });

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe("overdue");
    });

    it("should reject invalid status", async () => {
      await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const paymentsResponse = await client.get("/api/v1/payments/month");
      const paymentId = paymentsResponse.data.data[0].id;

      const response = await client.put(`/api/v1/payments/${paymentId}/status`, {
        status: "invalid_status",
      });

      expect(response.status).toBe(400);
    });

    it("should return 404 for non-existent payment", async () => {
      const response = await client.put("/api/v1/payments/999/status", {
        status: "paid",
      });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/payments/service/:serviceId", () => {
    it("should get service payment history", async () => {
      const { services } = await seedTestData();
      await client.post("/api/v1/payments/monthly", {});

      const serviceId = services[0].id;
      const response = await client.get(`/api/v1/payments/service/${serviceId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.payments)).toBe(true);
      expect(response.data.count).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent service", async () => {
      const response = await client.get("/api/v1/payments/service/999");

      expect(response.status).toBe(404);
    });
  });
});
