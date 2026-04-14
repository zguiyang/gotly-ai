# Test Utilities (`server/test-utils/`)

Shared test infrastructure for consistent, reproducible tests.

## Directory Structure

```
server/test-utils/
├── factories/       # Data factory functions for creating test fixtures
├── mocks/           # Mock implementations of services
├── setup/           # Test setup utilities (clock, helpers)
└── README.md        # This file
```

## Usage Conventions

### When to Use Factories

Use factories (`*.factory.ts`) when you need:
- Create test data with sensible defaults
- Override specific fields for test scenarios
- Generate multiple variations of the same data type

**DO:** `const user = createUserFixture({ email: 'test@example.com' })`
**DON'T:** Create inline objects like `{ id: '123', email: 'test@example.com' }` in tests

### When to Use Mocks

Use mocks (`*.mock.ts`) when you need to:
- Isolate the unit under test from dependencies
- Simulate specific failure scenarios
- Control test outcomes deterministically

**DO:** `const mockAiRunner = aiRunnerMocks.success({ type: 'note' })`
**DON'T:** Mock functions inline within test files

### When to Use Setup Utilities

Use setup utilities (`setup/*.ts`) for:
- Time-dependent tests (use `TestClock`)
- Global state management during tests
- Repeated test setup patterns

### Cross-Domain Rules

**FORBIDDEN:**
- Copying fixtures between domains (e.g., `server/assets/__tests__/fixtures.ts` → `server/notes/__tests__/`)
- Creating domain-specific mocks that duplicate `test-utils/` mocks
- Hardcoding test data in test files instead of using factories

**REQUIRED:**
- All shared fixtures go in `server/test-utils/factories/`
- All shared mocks go in `server/test-utils/mocks/`
- Update this README when adding new utilities

## Examples

### Factory Usage

```typescript
import { createAssetFixture, assetFixtures } from '@/server/test-utils/factories/asset.factory'
import { createUserFixture } from '@/server/test-utils/factories/user.factory'

// Create with defaults
const asset = assetFixtures.note()

// Create with overrides
const link = createAssetFixture({
  type: 'link',
  url: 'https://example.com',
  originalText: 'Example'
})
```

### Mock Usage

```typescript
import { aiRunnerMocks } from '@/server/test-utils/mocks/ai-runner.mock'
import { searchServiceMocks } from '@/server/test-utils/mocks/search-service.mock'

// Happy path
const successfulAi = aiRunnerMocks.success({ type: 'note' })

// Error path
const failedAi = aiRunnerMocks.failure('AI provider unavailable')

// Empty search
const emptySearch = searchServiceMocks.empty()
```

### Test Clock Usage

```typescript
import { createTestClock } from '@/server/test-utils/setup/test-clock'

test('逾期待办', () => {
  const clock = createTestClock(new Date('2024-01-15'))
  clock.install()
  
  try {
    // Test time-dependent logic
    const isOverdue = checkTodoOverdue(dueAt)
    expect(isOverdue).toBe(true)
  } finally {
    clock.uninstall()
  }
})
```
