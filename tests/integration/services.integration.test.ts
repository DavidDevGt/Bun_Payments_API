import { describe, it, expect, beforeAll, afterEach } from "bun:test";
import { Hono } from "hono";
import servicesRoutes from "../../src/routes/services";
import { setupTestDB, cleanupTestDB, seedTestData } from "../setup";
import { TestClient } from "../helpers/test-client";
import { errorHandler } from "../../src/middleware/errorHandler";
import { isValidService, isValidErrorResponse } from "../utils/test-data";

let app: Hono;
let client: TestClient;

beforeAll(async () => {
  await setupTestDB();

  app = new Hono();
  app.route("/api/v1/services", servicesRoutes);
  app.onError(errorHandler);
  client = new TestClient(app);
});

describe("Services Integration Tests", () => {
  afterEach(async () => {
    await cleanupTestDB();
  });

  describe("POST /api/v1/services", () => {
    it("should create a service successfully", async () => {
      const response = await client.post("/api/v1/services", {
        name: "Internet",
        amount: 49.99,
        dueDate: 10,
        category: "Utilities",
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain("created successfully");
      expect(isValidService(response.data.data)).toBe(true);
      expect(response.data.data.name).toBe("Internet");
    });

    it("should reject service with invalid data", async () => {
      const response = await client.post("/api/v1/services", {
        name: "",
        amount: -10,
        dueDate: 32,
        category: "",
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(isValidErrorResponse(response.data)).toBe(true);
    });

    it("should reject duplicate service name", async () => {
      await client.post("/api/v1/services", {
        name: "Netflix",
        amount: 12.99,
        dueDate: 5,
        category: "Entertainment",
      });

      const response = await client.post("/api/v1/services", {
        name: "Netflix",
        amount: 15.99,
        dueDate: 5,
        category: "Entertainment",
      });

      expect(response.status).toBe(409);
      expect(response.data.code).toBe("CONFLICT");
    });
  });

  describe("GET /api/v1/services", () => {
    it("should list all services", async () => {
      await seedTestData();

      const response = await client.get("/api/v1/services");

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.count).toBeGreaterThan(0);
    });

    it("should return empty list when no services exist", async () => {
      const response = await client.get("/api/v1/services");

      expect(response.status).toBe(200);
      expect(response.data.data).toEqual([]);
      expect(response.data.count).toBe(0);
    });
  });

  describe("GET /api/v1/services/:id", () => {
    it("should get service by ID", async () => {
      const { services } = await seedTestData();
      const serviceId = services[0].id;

      const response = await client.get(`/api/v1/services/${serviceId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(serviceId);
      expect(isValidService(response.data.data)).toBe(true);
    });

    it("should return 404 for non-existent service", async () => {
      const response = await client.get("/api/v1/services/999");

      expect(response.status).toBe(404);
      expect(response.data.code).toBe("NOT_FOUND");
    });
  });

  describe("PUT /api/v1/services/:id", () => {
    it("should update service successfully", async () => {
      const { services } = await seedTestData();
      const serviceId = services[0].id;

      const response = await client.put(`/api/v1/services/${serviceId}`, {
        amount: 59.99,
        dueDate: 15,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.amount).toBe(59.99);
      expect(response.data.data.dueDate).toBe(15);
    });

    it("should allow partial updates", async () => {
      const { services } = await seedTestData();
      const serviceId = services[0].id;

      const response = await client.put(`/api/v1/services/${serviceId}`, {
        amount: 79.99,
      });

      expect(response.status).toBe(200);
      expect(response.data.data.amount).toBe(79.99);
    });

    it("should return 404 for non-existent service", async () => {
      const response = await client.put("/api/v1/services/999", {
        amount: 100,
      });

      expect(response.status).toBe(404);
    });

    it("should prevent name duplication on update", async () => {
      const { services } = await seedTestData();

      const response = await client.put(`/api/v1/services/${services[0].id}`, {
        name: services[1].name,
      });

      expect(response.status).toBe(409);
      expect(response.data.code).toBe("CONFLICT");
    });
  });

  describe("DELETE /api/v1/services/:id", () => {
    it("should delete service successfully", async () => {
      const { services } = await seedTestData();
      const serviceId = services[0].id;

      const response = await client.delete(`/api/v1/services/${serviceId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain("deleted successfully");

      // Verify it's deleted
      const checkResponse = await client.get(`/api/v1/services/${serviceId}`);
      expect(checkResponse.status).toBe(404);
    });

    it("should return 404 for non-existent service", async () => {
      const response = await client.delete("/api/v1/services/999");

      expect(response.status).toBe(404);
    });
  });
});
