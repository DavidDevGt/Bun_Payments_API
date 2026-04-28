# 🧪 Testing Guide - Bun Payments API

Professional QA Automation Engineering testing suite for comprehensive API coverage.

## 📋 Overview

This project includes comprehensive automated testing:
- **Unit Tests**: Schema validation, error handling
- **Integration Tests**: API endpoints with real database
- **E2E Tests**: Complete user workflows
- **Test Coverage**: Automatic coverage reporting
- **Test Fixtures**: Reusable test data
- **Helper Utilities**: Common testing functions

## 🚀 Quick Start

```bash
# Run all tests with coverage
bun run test:all

# Run tests in watch mode
bun run test:watch

# Run specific test suite
bun run test:unit
bun run test:integration
bun run test:e2e

# Generate coverage report
bun run test:coverage
```

## 📂 Test Structure

```
tests/
├── unit/                          Unit tests
│   ├── validation.test.ts         Zod schema validation
│   └── errors.test.ts             Error handling
│
├── integration/                   Integration tests with DB
│   ├── services.integration.test.ts
│   └── payments.integration.test.ts
│
├── e2e/                           End-to-end workflows
│   └── complete-flow.e2e.test.ts
│
├── fixtures/                      Test data
│   └── services.ts
│
├── helpers/                       Testing utilities
│   └── test-client.ts
│
├── utils/                         Test utilities
│   └── test-data.ts
│
└── setup.ts                       Test configuration & DB setup
```

## 🧬 Unit Tests

Test individual components in isolation.

### Validation Tests (`tests/unit/validation.test.ts`)

```bash
bun run test:unit
```

Tests for Zod schemas:
- ✅ `CreateServiceSchema` validation
- ✅ `UpdateServiceSchema` partial validation
- ✅ `UpdatePaymentStatusSchema` enum validation
- ✅ Error detection for invalid data

**Example:**
```typescript
it("should validate a correct service", () => {
  const validService = {
    name: "Internet",
    amount: 49.99,
    dueDate: 10,
    category: "Utilities",
  };

  const result = CreateServiceSchema.safeParse(validService);
  expect(result.success).toBe(true);
});
```

### Error Tests (`tests/unit/errors.test.ts`)

Tests error handling:
- ✅ AppError creation
- ✅ ValidationError with details
- ✅ NotFoundError (404)
- ✅ ConflictError (409)
- ✅ InternalServerError (500)
- ✅ Error response formatting

## 🔗 Integration Tests

Test API endpoints with real database operations.

### Services Integration Tests

```bash
bun run test:integration -- services.integration.test.ts
```

Tests all service endpoints:
- ✅ **POST** Create service (201)
- ✅ **GET** List all services
- ✅ **GET** Get service by ID (404 handling)
- ✅ **PUT** Update service (partial & full)
- ✅ **DELETE** Delete service
- ✅ Duplicate prevention
- ✅ Validation errors (400)
- ✅ Conflict errors (409)

**Example:**
```typescript
it("should create a service successfully", async () => {
  const response = await client.post("/api/v1/services", {
    name: "Internet",
    amount: 49.99,
    dueDate: 10,
    category: "Utilities",
  });

  expect(response.status).toBe(201);
  expect(response.data.success).toBe(true);
  expect(response.data.data.name).toBe("Internet");
});
```

### Payments Integration Tests

Tests payment endpoints:
- ✅ **POST** Create monthly payments
- ✅ **GET** List payments by month
- ✅ **GET** Monthly summary with calculations
- ✅ **PUT** Update payment status
- ✅ **GET** Service payment history

**Key Features Tested:**
- ✅ Automatic payment generation
- ✅ Status transitions (pending → paid → overdue)
- ✅ Payment method tracking
- ✅ Summary calculations (total, balance, by status)
- ✅ Duplicate prevention per month

## 🎯 E2E Tests

Complete user workflow testing.

### Complete Flow Test

```bash
bun run test:e2e
```

Full workflow covering:
1. Create multiple services
2. List created services
3. Generate monthly payments
4. View initial summary
5. Mark payment as paid
6. Verify updated summary
7. View service history
8. Update service details
9. Delete service
10. Verify deletion

**Example:**
```typescript
it("should complete full payment management workflow", async () => {
  // Step 1: Create services
  const service1 = await client.post("/api/v1/services", {...});
  
  // Step 2: Create payments
  await client.post("/api/v1/payments/monthly", {});
  
  // Step 3: Pay a payment
  await client.put(`/api/v1/payments/${id}/status`, {
    status: "paid"
  });
  
  // Step 4: Verify consistency
  expect(summary.balance).toBe(expectedBalance);
});
```

## 📊 Test Coverage

Generate coverage reports:

```bash
# Generate HTML report
bun run test:coverage

# View coverage
open coverage/index.html
```

**Target Coverage:**
- Controllers: 90%+
- Routes: 90%+
- Models: 100%
- Middleware: 85%+
- Utilities: 95%+

## 🔧 Test Utilities

### TestClient (`tests/helpers/test-client.ts`)

Helper class for making requests:

```typescript
import { TestClient } from "./helpers/test-client";

const client = new TestClient(app);

// GET
const response = await client.get("/api/v1/services");

// POST
const response = await client.post("/api/v1/services", {
  name: "Test",
  amount: 10,
  dueDate: 5,
  category: "Test"
});

// PUT
const response = await client.put("/api/v1/services/1", {
  amount: 20
});

// DELETE
const response = await client.delete("/api/v1/services/1");
```

### Test Data Utilities (`tests/utils/test-data.ts`)

Helper functions:

```typescript
// Data generators
const service = generateMockService({ name: "Custom" });
const payment = generateMockPayment({ serviceId: 1 });

// Validators
isValidService(data)
isValidPayment(data)
isValidErrorResponse(data)
isValidSuccessResponse(data)

// Utilities
getMonthKey() // Current month as YYYY-MM
createTestDate(2026, 4, 28) // Create test timestamp
isValidTimestamp(123456789)
```

### Fixtures (`tests/fixtures/services.ts`)

Pre-built test data:

```typescript
import { validServices, invalidServices } from "./fixtures/services";

// Use in tests
validServices.forEach(service => {
  // Test each valid service
});

invalidServices.forEach(service => {
  // Test invalid data handling
});
```

## 🔄 Test Setup & Teardown

### Setup (`tests/setup.ts`)

```typescript
beforeAll(async () => {
  await setupTestDB(); // Create in-memory SQLite
  // Tables created automatically
});
```

### Cleanup

```typescript
afterEach(async () => {
  await cleanupTestDB(); // Clear tables
});
```

### Seeding Test Data

```typescript
const { services } = await seedTestData();
// Creates 3 sample services for testing
```

## 📋 Test Categories

### ✅ Services Tests (30+ assertions)

- CRUD operations
- Validation
- Duplicate detection
- Status codes (200, 201, 400, 404, 409)
- Error messages

### ✅ Payments Tests (25+ assertions)

- Monthly payment creation
- Status transitions
- Summary calculations
- Balance verification
- History tracking

### ✅ E2E Tests (15+ assertions)

- Complete workflows
- Data consistency
- Edge cases
- Error handling

### ✅ Unit Tests (40+ assertions)

- Schema validation
- Error classes
- Error formatting

## 🎯 Test Patterns

### Testing Validations

```typescript
it("should reject invalid data", () => {
  const result = schema.safeParse(invalidData);
  expect(result.success).toBe(false);
});
```

### Testing API Responses

```typescript
it("should return correct status and data", async () => {
  const response = await client.post("/endpoint", data);
  expect(response.status).toBe(201);
  expect(response.data.success).toBe(true);
  expect(response.data.data).toBeDefined();
});
```

### Testing Edge Cases

```typescript
it("should handle non-existent resource", async () => {
  const response = await client.get("/api/services/999");
  expect(response.status).toBe(404);
  expect(response.data.code).toBe("NOT_FOUND");
});
```

### Testing Data Consistency

```typescript
it("should maintain data consistency", async () => {
  // Create data
  await create();
  
  // Modify
  await update();
  
  // Verify consistency
  const result = await verify();
  expect(result.total).toBe(expected);
});
```

## 🚨 Test Assertions

Common assertions used:

```typescript
// Status codes
expect(response.status).toBe(200);
expect(response.status).toBe(404);

// Response structure
expect(response.data.success).toBe(true);
expect(response.data.code).toBe("EXPECTED_CODE");
expect(Array.isArray(response.data.data)).toBe(true);

// Data validation
expect(isValidService(data)).toBe(true);
expect(data.name).toBe("Expected");
expect(data.amount).toBeGreaterThan(0);

// Arrays
expect(response.data.count).toBe(3);
expect(response.data.data.length).toBeGreaterThan(0);
```

## 🔍 Running Specific Tests

```bash
# Run specific file
bun test tests/unit/validation.test.ts

# Run with pattern
bun test --test-name-pattern "should validate"

# Run with timeout
bun test --timeout 10000

# Watch specific directory
bun test --watch tests/unit/
```

## 📈 Performance Tests

Monitor response times:

```typescript
const start = performance.now();
await client.get("/api/v1/services");
const duration = performance.now() - start;

expect(duration).toBeLessThan(100); // Should be fast
```

## 🐛 Debugging Tests

```typescript
// Add console logs
console.log("Response:", response);

// Use debugger
// breakpoint in IDE and run: bun test --inspect-brk

// Check request details
console.log("Status:", response.status);
console.log("Headers:", response.headers);
console.log("Data:", response.data);
```

## ✅ Test Checklist

Before committing:
- [ ] All tests pass: `bun run test:all`
- [ ] No console errors
- [ ] Coverage maintained above 85%
- [ ] New code has corresponding tests
- [ ] Edge cases covered
- [ ] Error paths tested

## 📚 Best Practices

1. **One Assert Per Test** (when possible)
   ```typescript
   // Good
   it("should return 201 status", async () => {
     expect(response.status).toBe(201);
   });
   ```

2. **Descriptive Test Names**
   ```typescript
   // Good
   it("should reject service with duplicate name");
   
   // Bad
   it("test duplicate");
   ```

3. **Use Fixtures for Common Data**
   ```typescript
   // Good
   validServices.forEach(service => { /* test */ });
   
   // Avoid
   hardcode test data
   ```

4. **Clean Up After Tests**
   ```typescript
   afterEach(async () => {
     await cleanupTestDB();
   });
   ```

5. **Test Error Cases**
   ```typescript
   it("should handle 404", async () => {
     expect(response.status).toBe(404);
   });
   ```

## 🚀 CI/CD Integration

Tests automatically run on:
- Every commit
- Pull requests
- Before deployment

Coverage reports generated and archived.

## 📞 Support

For testing questions or issues:
1. Check existing tests for examples
2. Review test utilities in `tests/utils/`
3. Check test setup in `tests/setup.ts`
4. See fixtures in `tests/fixtures/`

---

**Test Coverage Goal:** 85%+  
**Total Test Cases:** 100+  
**Execution Time:** < 5 seconds  

Happy testing! 🎉
