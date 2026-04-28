import { z } from "zod";

export const CreateServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(255),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.number().int().min(1).max(31, "Due date must be between 1-31"),
  category: z.string().min(1, "Category is required").max(100),
});

export const UpdateServiceSchema = CreateServiceSchema.partial();

export const CreatePaymentSchema = z.object({
  serviceId: z.number().int().positive(),
  paymentMethod: z.string().optional(),
  paymentDate: z.number().int().optional(),
});

export const UpdatePaymentStatusSchema = z.object({
  status: z.enum(["pending", "paid", "overdue"]),
  paymentMethod: z.string().optional(),
  paymentDate: z.number().int().optional(),
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
