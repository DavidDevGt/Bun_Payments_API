import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { paymentsTable, servicesTable } from "../db/schema";
import type { UpdatePaymentStatusInput } from "../models/validation";
import { NotFoundError } from "../utils/errors";

const getMonthKey = (date: Date = new Date()): string => {
  return date.toISOString().slice(0, 7);
};

export const createMonthlyPayments = async (c: Context) => {
  const month = c.req.query("month") || getMonthKey();
  const services = await db.query.servicesTable.findMany();

  const existingPayments = await db.query.paymentsTable.findMany({
    where: eq(paymentsTable.month, month),
  });

  if (existingPayments.length > 0) {
    return c.json({
      success: true,
      message: "Payments already exist for this month",
      data: existingPayments,
    });
  }

  const monthDate = new Date(`${month}-01`);
  const dueTimestamp = Math.floor(
    new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getTime() / 1000,
  );

  const newPayments = await Promise.all(
    services.map((service) =>
      db
        .insert(paymentsTable)
        .values({
          serviceId: service.id,
          amount: service.amount,
          status: "pending",
          dueDate: dueTimestamp,
          month,
        })
        .returning(),
    ),
  );

  return c.json(
    {
      success: true,
      message: "Monthly payments created successfully",
      data: newPayments.map((p) => p[0]),
    },
    201
  );
};

export const getPaymentsByMonth = async (c: Context) => {
  const month = c.req.query("month") || getMonthKey();

  const payments = await db.query.paymentsTable.findMany({
    where: eq(paymentsTable.month, month),
  });

  return c.json({
    success: true,
    data: payments,
    count: payments.length,
  });
};

export const getMonthSummary = async (c: Context) => {
  const month = c.req.query("month") || getMonthKey();

  const payments = await db.query.paymentsTable.findMany({
    where: eq(paymentsTable.month, month),
  });

  const summary = {
    month,
    totalToPay: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    balance: 0,
    paymentsByStatus: {
      paid: 0,
      pending: 0,
      overdue: 0,
    },
  };

  payments.forEach((payment) => {
    summary.totalToPay += payment.amount;

    switch (payment.status) {
      case "paid":
        summary.totalPaid += payment.amount;
        summary.paymentsByStatus.paid++;
        break;
      case "pending":
        summary.totalPending += payment.amount;
        summary.paymentsByStatus.pending++;
        break;
      case "overdue":
        summary.totalOverdue += payment.amount;
        summary.paymentsByStatus.overdue++;
        break;
    }
  });

  summary.balance = summary.totalToPay - summary.totalPaid;

  return c.json({
    success: true,
    data: summary,
  });
};

export const updatePaymentStatus = async (c: Context, data: UpdatePaymentStatusInput) => {
  const paramId = c.req.param("id");
  if (!paramId) throw new NotFoundError("Payment");
  const id = parseInt(paramId, 10);

  const payment = await db.query.paymentsTable.findFirst({
    where: eq(paymentsTable.id, id),
  });

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  const updateData: Record<string, unknown> = {
    status: data.status,
    updatedAt: Math.floor(Date.now() / 1000),
  };

  if (data.status === "paid") {
    updateData.paymentDate = data.paymentDate || Math.floor(Date.now() / 1000);
    if (data.paymentMethod) {
      updateData.paymentMethod = data.paymentMethod;
    }
  }

  const result = await db
    .update(paymentsTable)
    .set(updateData)
    .where(eq(paymentsTable.id, id))
    .returning();

  return c.json({
    success: true,
    message: "Payment status updated successfully",
    data: result[0],
  });
};

export const getServicePaymentHistory = async (c: Context) => {
  const paramServiceId = c.req.param("serviceId");
  if (!paramServiceId) throw new NotFoundError("Service");
  const serviceId = parseInt(paramServiceId, 10);

  const service = await db.query.servicesTable.findFirst({
    where: eq(servicesTable.id, serviceId),
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  const payments = await db.query.paymentsTable.findMany({
    where: eq(paymentsTable.serviceId, serviceId),
  });

  return c.json({
    success: true,
    service,
    payments,
    count: payments.length,
  });
};
