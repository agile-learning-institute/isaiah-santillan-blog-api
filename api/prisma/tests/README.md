# Test Suite

This directory contains comprehensive tests for the blog API.

## Test Structure

```
tests/
├── helpers/          # Test utilities and helpers
│   ├── mockData.js   # Mock data for tests
│   └── testApp.js    # Test app instance
├── routes/           # Route/integration tests
│   ├── auth.test.js
│   ├── posts.test.js
│   └── comments.test.js
├── services/         # Service layer tests
│   ├── AuthService.test.js
│   ├── PostService.test.js
│   └── CommentService.test.js
├── validators/       # Validator tests
│   ├── authValidator.test.js
│   ├── postValidator.test.js
│   └── commentValidator.test.js
├── utils/            # Utility tests
│   └── slugify.test.js
└── setup.js          # Global test setup
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- authValidator.test.js
```

## Test Coverage

The test suite covers:

- **Validators**: Input validation logic
- **Services**: Business logic and operations
- **Routes**: HTTP endpoints and integration
- **Utils**: Utility functions

## Test Approach

- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test route endpoints with mocked services
- **Mocking**: Services and models are mocked to isolate test units

## Notes

- Tests use Jest as the testing framework
- Supertest is used for HTTP endpoint testing
- All external dependencies (Prisma, bcrypt, etc.) are mocked
- Test environment variables are set in `setup.js`

