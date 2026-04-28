export const generateMockService = (overrides = {}) => ({
  name: `Service-${Date.now()}`,
  amount: 49.99,
  dueDate: 10,
  category: "Test Category",
  ...overrides,
});

export const generateMockPayment = (overrides = {}) => ({
  serviceId: 1,
  paymentMethod: "Test Payment",
  paymentDate: Math.floor(Date.now() / 1000),
  ...overrides,
});

export const getMonthKey = (date: Date = new Date()): string => {
  return date.toISOString().slice(0, 7);
};

export const createTestDate = (year: number, month: number, day: number) => {
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
};

export const isValidTimestamp = (timestamp: number): boolean => {
  return typeof timestamp === "number" && timestamp > 0;
};

export const isValidService = (service: unknown): service is {
  id: number;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
} => {
  return (
    typeof service === "object" &&
    service !== null &&
    "id" in service &&
    typeof (service as Record<string, unknown>).id === "number" &&
    "name" in service &&
    typeof (service as Record<string, unknown>).name === "string" &&
    "amount" in service &&
    typeof (service as Record<string, unknown>).amount === "number" &&
    "dueDate" in service &&
    typeof (service as Record<string, unknown>).dueDate === "number" &&
    "category" in service &&
    typeof (service as Record<string, unknown>).category === "string"
  );
};

export const isValidPayment = (payment: unknown): payment is {
  id: number;
  serviceId: number;
  amount: number;
  status: "pending" | "paid" | "overdue";
  dueDate: number;
  month: string;
} => {
  return (
    typeof payment === "object" &&
    payment !== null &&
    "id" in payment &&
    typeof (payment as Record<string, unknown>).id === "number" &&
    "serviceId" in payment &&
    typeof (payment as Record<string, unknown>).serviceId === "number" &&
    "amount" in payment &&
    typeof (payment as Record<string, unknown>).amount === "number" &&
    "status" in payment &&
    ["pending", "paid", "overdue"].includes((payment as Record<string, unknown>).status as string)
  );
};

export const isValidErrorResponse = (response: unknown): boolean => {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as Record<string, unknown>).success === false &&
    "code" in response &&
    typeof (response as Record<string, unknown>).code === "string" &&
    "message" in response &&
    typeof (response as Record<string, unknown>).message === "string"
  );
};

export const isValidSuccessResponse = (response: unknown): boolean => {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as Record<string, unknown>).success === true
  );
};
