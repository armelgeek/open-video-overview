# Testing Guide

Comprehensive test suite for the webhook architecture and video generation system.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- tests/webhooks/integration.test.ts
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Open Vitest UI
```bash
npm run test:ui
```

## Test Coverage

### Webhook Tests (`tests/webhooks/`)

**event-store.test.ts** — Event storage and tracking
- Creating and retrieving event records
- Marking events as completed/failed/timeout
- Tracking attempts
- Dead letter queue
- ✅ 6 tests

**client.test.ts** — WebhookClient core functionality
- Event emission
- Callback resolution
- Event status tracking
- Event history
- ✅ 3 tests

**registry.test.ts** — Service registry
- Loading configuration
- Registering handlers
- Unknown service handling
- ✅ 4 tests

**callback-handler.test.ts** — Express callback middleware
- Valid callback handling
- Invalid payload rejection
- ✅ 2 tests

**progress-tracker.test.ts** — Real-time progress tracking
- Emitting progress events
- Event history tracking
- Subscribing to updates
- Unsubscribing
- Tracking active events
- Clear history
- Multiple listeners
- ✅ 7 tests

**progress-utils.test.ts** — Progress calculation utilities
- Progress percentage calculation
- Image progress messages
- Clip progress messages
- Multi-stage progress calculation
- Detailed clip messages
- ✅ 10 tests

**integration.test.ts** — Full webhook flow
- Event emission and response
- Handler error handling
- Event store tracking
- Progress emission during execution
- Timeout handling
- Sequential events
- Dead letter queue
- ✅ 7 tests

**Total: 39 tests**

## Test Structure

All tests use **Vitest** with a consistent structure:

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("Component Name", () => {
  let component: Component;

  beforeEach(() => {
    // Setup
    component = new Component();
  });

  it("should do something", () => {
    // Arrange
    const input = {...};

    // Act
    const result = component.method(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Running Tests in CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Test Scenarios

### Event Emission
```typescript
✓ Event is created with unique ID
✓ Event reaches correct handler
✓ Handler result is returned
✓ Event is tracked in store
```

### Progress Tracking
```typescript
✓ Progress events are emitted
✓ Subscribers receive updates
✓ History is maintained
✓ Active events are tracked
✓ Progress calculations are accurate
```

### Error Handling
```typescript
✓ Timeouts are caught
✓ Handler errors propagate
✓ Failed events go to DLQ
✓ Validation errors are caught
```

### Integration Flow
```typescript
✓ Full request-response cycle works
✓ Progress is emitted during execution
✓ Multiple sequential events succeed
✓ Event history is accurate
```

## Writing New Tests

### Template
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { ComponentUnderTest } from "../../src/path/to/component";

describe("ComponentUnderTest", () => {
  let component: ComponentUnderTest;

  beforeEach(() => {
    component = new ComponentUnderTest();
  });

  it("should [description]", () => {
    // Arrange
    const input = { ... };

    // Act
    const result = component.method(input);

    // Assert
    expect(result).toEqual(expected);
  });

  it("should handle [error case]", () => {
    // Arrange
    const badInput = { ... };

    // Act & Assert
    expect(() => {
      component.method(badInput);
    }).toThrow("Expected error message");
  });
});
```

### Async Tests
```typescript
it("should [description]", async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

### Time-based Tests (with timeout override)
```typescript
it("should timeout after 100ms", async () => {
  const promise = slowOperation();
  
  await expect(promise).rejects.toThrow("timeout");
}, { timeout: 5000 }); // 5s timeout for the test itself
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Check coverage:
```bash
npm test -- --coverage
```

## Debugging Tests

### Run single test
```bash
npm test -- --reporter=verbose tests/webhooks/integration.test.ts
```

### Debug with output
Add console.log in tests:
```typescript
it("should work", () => {
  console.log("Debug info:", value);
  expect(value).toBe(expected);
});
```

Then run:
```bash
npm test -- --reporter=verbose
```

### VS Code Debugger
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test", "--", "--inspect-brk"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Test Best Practices

1. **One assertion per test** (or related assertions)
2. **Clear test names** — describe what should happen
3. **Setup and teardown** — use beforeEach/afterEach
4. **Mock external dependencies** — keep tests isolated
5. **Test edge cases** — not just the happy path
6. **Use meaningful assertions** — `expect(x).toBe(y)` not just truthy

## Continuous Integration

Tests run automatically on:
- Every push to any branch
- Every pull request
- Before publishing (pre-commit hook, if configured)

All tests must pass before merging to main.
