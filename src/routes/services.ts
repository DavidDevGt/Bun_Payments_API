import { Hono } from "hono";
import type { Context } from "hono";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController";
import { validateJSON } from "../middleware/validation";
import { CreateServiceSchema, UpdateServiceSchema } from "../models/validation";

const services = new Hono();

// Create service
services.post("/", validateJSON(CreateServiceSchema), async (c: Context) => {
  const data = c.get("validated");
  return createService(c, data);
});

// Get all services
services.get("/", getAllServices);

// Get service by ID
services.get("/:id", getServiceById);

// Update service
services.put("/:id", validateJSON(UpdateServiceSchema), async (c: Context) => {
  const data = c.get("validated");
  return updateService(c, data);
});

// Delete service
services.delete("/:id", deleteService);

export default services;
