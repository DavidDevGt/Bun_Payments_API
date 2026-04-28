import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/errorHandler";
import servicesRoutes from "./routes/services";
import paymentsRoutes from "./routes/payments";

const app = new Hono();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(logger());
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route("/api/v1/services", servicesRoutes);
app.route("/api/v1/payments", paymentsRoutes);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Bun Payments API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      services: "/api/v1/services",
      payments: "/api/v1/payments",
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
    404,
  );
});

// Error handler
app.onError(errorHandler);

// Start server
console.log(`🚀 Server running on http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
