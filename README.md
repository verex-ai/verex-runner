# Verex Test Runner

[![npm version](https://img.shields.io/npm/v/@verex/runner)](https://www.npmjs.com/package/@verex/runner)
[![Tests](https://github.com/verex-ai/verex-runner/actions/workflows/tests.yml/badge.svg)](https://github.com/verex-ai/verex-runner/actions/workflows/tests.yml)
[![License](https://img.shields.io/github/license/verex-ai/verex-runner)](https://github.com/verex-ai/verex-runner/blob/main/LICENSE)

A flexible NPM package for running Verex.ai test suites from any CI/CD pipeline, including GitHub Actions, GitLab CI, and Bitbucket Pipelines.

## Features

- Compatible with multiple CI/CD platforms (GitHub Actions, GitLab CI, Bitbucket Pipelines)
- Automatic environment detection
- Configuration via environment variables, CLI arguments, or code
- Real-time test status updates
- Detailed test result reporting

## Installation

### Global Installation (recommended for CLI usage)

```bash
npm install -g @verex/runner
```

This allows you to run `verex-runner` directly from anywhere.

### Local Installation

```bash
npm install @verex/runner
```

## Usage

### Command Line Interface

If installed globally:

```bash
# Basic usage
verex-runner --api-key YOUR_API_KEY --test-suite-id YOUR_TEST_SUITE_ID

# With additional options
verex-runner \
  --api-key YOUR_API_KEY \
  --test-suite-id YOUR_TEST_SUITE_ID \
  --test-base-url https://your-app-domain.com \
  --max-poll-attempts 120 \
  --poll-interval-seconds 5 \
  --debug
```

### In Node.js

```javascript
const { runTests, runTestsWithAutoDetection } = require('@verex/runner');

// Auto-detect CI environment and run tests
async function runMyTests() {
  try {
    const results = await runTestsWithAutoDetection({
      apiKey: 'YOUR_API_KEY',
      testSuiteId: 'YOUR_TEST_SUITE_ID',
      testBaseUrl: 'https://your-app-domain.com'
    });
    
    console.log('Tests completed with status:', results.status);
    console.log(`${results.passed}/${results.totalTests} tests passed`);
    
    // Exit with error code if any tests failed
    if (results.hasFailed) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

runMyTests();
```

### GitHub Actions

```yaml
name: Verex Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
      
      - name: Run Verex Tests
        run: npx @verex/runner
        env:
          API_KEY: ${{ secrets.VEREX_API_KEY }}
          TEST_SUITE_ID: ${{ secrets.VEREX_TEST_SUITE_ID }}
          TEST_BASE_URL: https://staging.your-app.com
          DEBUG: true
```

### GitLab CI

```yaml
stages:
  - test

verex-tests:
  stage: test
  image: node:16-alpine
  script:
    - npm install -g @verex/runner
    - verex-runner
  variables:
    VEREX_API_KEY: $VEREX_API_KEY
    VEREX_TEST_SUITE_ID: $VEREX_TEST_SUITE_ID
    VEREX_TEST_BASE_URL: https://staging.your-app.com
    VEREX_DEBUG: "true"
```

### Bitbucket Pipelines

```yaml
pipelines:
  default:
    - step:
        name: Run Verex Tests
        image: node:16-alpine
        script:
          - npm install -g @verex/runner
          - verex-runner
        variables:
          VEREX_API_KEY: $VEREX_API_KEY
          VEREX_TEST_SUITE_ID: $VEREX_TEST_SUITE_ID
          VEREX_TEST_BASE_URL: https://staging.your-app.com
          VEREX_DEBUG: "true"
```

## Configuration Options

| Option | Environment Variable | CLI Argument | Description |
|--------|---------------------|--------------|-------------|
| API Key | `API_KEY` (GitHub)<br>`VEREX_API_KEY` (others) | `--api-key` | Verex API key |
| Test Suite ID | `TEST_SUITE_ID` (GitHub)<br>`VEREX_TEST_SUITE_ID` (others) | `--test-suite-id` | Test suite ID to run |
| Test Base URL | `TEST_BASE_URL` (GitHub)<br>`VEREX_TEST_BASE_URL` (others) | `--test-base-url` | Base URL for tests |
| API Base URL | `API_BASE_URL` (GitHub)<br>`VEREX_API_BASE_URL` (others) | `--api-base-url` | Verex API base URL |
| Max Poll Attempts | `MAX_POLL_ATTEMPTS` (GitHub)<br>`VEREX_MAX_POLL_ATTEMPTS` (others) | `--max-poll-attempts` | Maximum number of polling attempts |
| Poll Interval | `POLL_INTERVAL_SECONDS` (GitHub)<br>`VEREX_POLL_INTERVAL_SECONDS` (others) | `--poll-interval-seconds` | Interval between polling attempts in seconds |
| Debug Mode | `DEBUG` (GitHub)<br>`VEREX_DEBUG` (others) | `--debug` | Enable debug logging |

## License

MIT