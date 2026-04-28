import { Hono } from "hono";
import type { Context } from "hono";
import {
  createMonthlyPayments,
  getPaymentsByMonth,
  getMonthSummary,
  updatePaymentStatus,
  getServicePaymentHistory,
} from "../controllers/paymentController";
import { validateJSON } from "../middleware/validation";
import { UpdatePaymentStatusSchema } from "../models/validation";

const payments = new Hono();

// Create monthly payments
payments.post("/monthly", createMonthlyPayments);

// Get payments by month
payments.get("/month", getPaymentsByMonth);

// Get month summary
payments.get("/summary/month", getMonthSummary);

// Get service payment history
payments.get("/service/:serviceId", getServicePaymentHistory);

// Update payment status
payments.put("/:id/status", validateJSON(UpdatePaymentStatusSchema), async (c: Context) => {
  const data = c.get("validated");
  return updatePaymentStatus(c, data);
});

export default payments;
