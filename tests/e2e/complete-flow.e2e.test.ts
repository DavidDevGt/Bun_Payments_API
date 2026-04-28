import { describe, it, expect, beforeAll, afterEach } from "bun:test";
import { Hono } from "hono";
import servicesRoutes from "../../src/routes/services";
import paymentsRoutes from "../../src/routes/payments";
import { setupTestDB, cleanupTestDB } from "../setup";
import { TestClient } from "../helpers/test-client";
import { errorHandler } from "../../src/middleware/errorHandler";

let app: Hono;
let client: TestClient;

beforeAll(async () => {
  await setupTestDB();

  app = new Hono();
  app.route("/api/v1/services", servicesRoutes);
  app.route("/api/v1/payments", paymentsRoutes);
  app.onError(errorHandler);
  client = new TestClient(app);
});

describe("E2E Complete User Flow", () => {
  afterEach(async () => {
    await cleanupTestDB();
  });

  it("should complete full payment management workflow", async () => {
    // Step 1: Create multiple services
    const service1Response = await client.post("/api/v1/services", {
      name: "Internet",
      amount: 49.99,
      dueDate: 10,
      category: "Utilities",
    });
    expect(service1Response.status).toBe(201);
    const service1Id = service1Response.data.data.id;

    const service2Response = await client.post("/api/v1/services", {
      name: "Netflix",
      amount: 12.99,
      dueDate: 5,
      category: "Entertainment",
    });
    expect(service2Response.status).toBe(201);

    // Step 2: Verify services were created
    const listResponse = await client.get("/api/v1/services");
    expect(listResponse.data.count).toBe(2);

    // Step 3: Create monthly payments
    const paymentsResponse = await client.post("/api/v1/payments/monthly", {});
    expect(paymentsResponse.status).toBe(201);
    expect(paymentsResponse.data.data.length).toBe(2);

    // Step 4: Get initial summary
    const summaryResponse = await client.get("/api/v1/payments/summary/month");
    expect(summaryResponse.data.data.totalToPay).toBeCloseTo(62.98);
    expect(summaryResponse.data.data.totalPaid).toBe(0);
    expect(summaryResponse.data.data.totalPending).toBeCloseTo(62.98);
    expect(summaryResponse.data.data.balance).toBeCloseTo(62.98);

    // Step 5: Get payment details
    const monthPaymentsResponse = await client.get("/api/v1/payments/month");
    const firstPaymentId = monthPaymentsResponse.data.data[0].id;

    // Step 6: Mark first payment as paid
    const updatePaymentResponse = await client.put(`/api/v1/payments/${firstPaymentId}/status`, {
      status: "paid",
      paymentMethod: "Credit Card",
    });
    expect(updatePaymentResponse.status).toBe(200);
    expect(updatePaymentResponse.data.data.status).toBe("paid");

    // Step 7: Verify updated summary
    const updatedSummaryResponse = await client.get("/api/v1/payments/summary/month");
    expect(updatedSummaryResponse.data.data.totalPaid).toBeCloseTo(49.99);
    expect(updatedSummaryResponse.data.data.totalPending).toBeCloseTo(12.99);
    expect(updatedSummaryResponse.data.data.balance).toBeCloseTo(12.99);
    expect(updatedSummaryResponse.data.data.paymentsByStatus.paid).toBe(1);
    expect(updatedSummaryResponse.data.data.paymentsByStatus.pending).toBe(1);

    // Step 8: Get service history
    const historyResponse = await client.get(`/api/v1/payments/service/${service1Id}`);
    expect(historyResponse.status).toBe(200);
    expect(historyResponse.data.count).toBe(1);
    expect(historyResponse.data.payments[0].status).toBe("paid");

    // Step 9: Update service
    const updateServiceResponse = await client.put(`/api/v1/services/${service1Id}`, {
      amount: 59.99,
    });
    expect(updateServiceResponse.status).toBe(200);

    // Step 10: Delete a service
    const deleteResponse = await client.delete(`/api/v1/services/${service1Id}`);
    expect(deleteResponse.status).toBe(200);

    // Step 11: Verify service is deleted
    const checkDeleteResponse = await client.get(`/api/v1/services/${service1Id}`);
    expect(checkDeleteResponse.status).toBe(404);
  });

  it("should handle edge cases properly", async () => {
    // Try to create payment without services
    const paymentResponse = await client.post("/api/v1/payments/monthly", {});
    expect(paymentResponse.status).toBe(201);
    expect(paymentResponse.data.data).toEqual([]);

    // Try to get non-existent service
    const getResponse = await client.get("/api/v1/services/999");
    expect(getResponse.status).toBe(404);

    // Try to update non-existent service
    const updateResponse = await client.put("/api/v1/services/999", {
      amount: 100,
    });
    expect(updateResponse.status).toBe(404);

    // Try to delete non-existent service
    const deleteResponse = await client.delete("/api/v1/services/999");
    expect(deleteResponse.status).toBe(404);

    // Try invalid payment status
    const invalidStatusResponse = await client.put("/api/v1/payments/999/status", {
      status: "invalid",
    });
    expect(invalidStatusResponse.status).toBe(400);
  });

  it("should maintain data consistency", async () => {
    // Create service
    const serviceResponse = await client.post("/api/v1/services", {
      name: "Test Service",
      amount: 100,
      dueDate: 20,
      category: "Test",
    });
    // biome-ignore lint/correctness/noUnusedVariables: serviceId captured for potential future use
    const serviceId = serviceResponse.data.data.id;

    // Create payments
    await client.post("/api/v1/payments/monthly", {});

    // Get initial balance
    const initialSummary = await client.get("/api/v1/payments/summary/month");
    const initialBalance = initialSummary.data.data.balance;

    // Get all payments
    const paymentsResponse = await client.get("/api/v1/payments/month");
    const payment = paymentsResponse.data.data[0];

    // Pay the payment
    await client.put(`/api/v1/payments/${payment.id}/status`, {
      status: "paid",
    });

    // Check updated balance
    const updatedSummary = await client.get("/api/v1/payments/summary/month");
    const expectedNewBalance = initialBalance - payment.amount;
    expect(updatedSummary.data.data.balance).toBeCloseTo(expectedNewBalance);

    // Verify total is consistent
    const totalCheck =
      updatedSummary.data.data.totalPaid +
      updatedSummary.data.data.totalPending +
      updatedSummary.data.data.totalOverdue;
    expect(totalCheck).toBe(updatedSummary.data.data.totalToPay);
  });
});
