#!/usr/bin/env node

const { Command } = require("commander");
const { runTestsWithAutoDetection } = require("../src/index");
const packageInfo = require("../package.json");

const program = new Command();

program
  .name("verex-runner")
  .description("Run Verex.ai test suites from any CI/CD pipeline")
  .version(packageInfo.version);

program
  .option("-k, --api-key <key>", "Verex API key")
  .option("-s, --test-suite-id <id>", "Test suite ID to run")
  .option("-u, --test-base-url <url>", "Base URL for tests")
  .option("-a, --api-base-url <url>", "Verex API base URL")
  .option(
    "-m, --max-poll-attempts <number>",
    "Maximum number of polling attempts"
  )
  .option(
    "-p, --poll-interval-seconds <seconds>",
    "Interval between polling attempts in seconds"
  )
  .option("-d, --debug", "Enable debug logging")
  .action(async (options) => {
    try {
      // Convert CLI options to config format, with env var fallbacks
      const config = {
        apiKey: options.apiKey || process.env.API_KEY,
        testSuiteId: options.testSuiteId || process.env.TEST_SUITE_ID,
        testBaseUrl: options.testBaseUrl || process.env.TEST_BASE_URL,
        apiBaseUrl: options.apiBaseUrl || process.env.API_BASE_URL,
        maxPollAttempts:
          options.maxPollAttempts || process.env.MAX_POLL_ATTEMPTS,
        pollIntervalSeconds:
          options.pollIntervalSeconds || process.env.POLL_INTERVAL_SECONDS,
        debug: !!options.debug || process.env.DEBUG === "true",
      };

      // Run tests
      const results = await runTestsWithAutoDetection(config);

      // Exit with appropriate code
      if (results.hasFailed) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();