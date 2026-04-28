import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { servicesTable } from "../db/schema";
import type { CreateServiceInput, UpdateServiceInput } from "../models/validation";
import { NotFoundError, ConflictError } from "../utils/errors";

export const createService = async (c: Context, data: CreateServiceInput) => {
  const existingService = await db.query.servicesTable.findFirst({
    where: eq(servicesTable.name, data.name),
  });

  if (existingService) {
    throw new ConflictError("Service with this name already exists");
  }

  const result = await db
    .insert(servicesTable)
    .values({
      name: data.name,
      amount: data.amount,
      dueDate: data.dueDate,
      category: data.category,
    })
    .returning();

  return c.json(
    {
      success: true,
      message: "Service created successfully",
      data: result[0],
    },
    201
  );
};

export const getAllServices = async (c: Context) => {
  const services = await db.query.servicesTable.findMany();
  return c.json({
    success: true,
    data: services,
    count: services.length,
  });
};

export const getServiceById = async (c: Context) => {
  const paramId = c.req.param("id");
  if (!paramId) throw new NotFoundError("Service");
  const id = parseInt(paramId, 10);

  const service = await db.query.servicesTable.findFirst({
    where: eq(servicesTable.id, id),
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  return c.json({
    success: true,
    data: service,
  });
};

export const updateService = async (c: Context, data: UpdateServiceInput) => {
  const paramId = c.req.param("id");
  if (!paramId) throw new NotFoundError("Service");
  const id = parseInt(paramId, 10);

  const existingService = await db.query.servicesTable.findFirst({
    where: eq(servicesTable.id, id),
  });

  if (!existingService) {
    throw new NotFoundError("Service");
  }

  if (data.name && data.name !== existingService.name) {
    const duplicate = await db.query.servicesTable.findFirst({
      where: eq(servicesTable.name, data.name),
    });
    if (duplicate) {
      throw new ConflictError("Another service with this name exists");
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.category !== undefined) updateData.category = data.category;
  updateData.updatedAt = Math.floor(Date.now() / 1000);

  const result = await db
    .update(servicesTable)
    .set(updateData)
    .where(eq(servicesTable.id, id))
    .returning();

  return c.json({
    success: true,
    message: "Service updated successfully",
    data: result[0],
  });
};

export const deleteService = async (c: Context) => {
  const paramId = c.req.param("id");
  if (!paramId) throw new NotFoundError("Service");
  const id = parseInt(paramId, 10);

  const service = await db.query.servicesTable.findFirst({
    where: eq(servicesTable.id, id),
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  await db.delete(servicesTable).where(eq(servicesTable.id, id));

  return c.json({
    success: true,
    message: "Service deleted successfully",
  });
};
