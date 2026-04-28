import { sqliteTable, text, real, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const servicesTable = sqliteTable(
  "services",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    amount: real("amount").notNull(),
    dueDate: integer("due_date").notNull(),
    category: text("category").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    categoryIdx: index("services_category_idx").on(table.category),
  }),
);

export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;

export const paymentsTable = sqliteTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => servicesTable.id, { onDelete: "cascade" }),
    amount: real("amount").notNull(),
    status: text("status", {
      enum: ["pending", "paid", "overdue"],
    })
      .notNull()
      .default("pending"),
    paymentMethod: text("payment_method"),
    paymentDate: integer("payment_date"),
    dueDate: integer("due_date").notNull(),
    month: text("month").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    serviceIdIdx: index("payments_service_id_idx").on(table.serviceId),
    monthIdx: index("payments_month_idx").on(table.month),
    statusIdx: index("payments_status_idx").on(table.status),
  }),
);

export type Payment = typeof paymentsTable.$inferSelect;
export type NewPayment = typeof paymentsTable.$inferInsert;
