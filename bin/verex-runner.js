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
      // Convert CLI options to config format
      const config = {
        apiKey: options.apiKey,
        testSuiteId: options.testSuiteId,
        testBaseUrl: options.testBaseUrl,
        apiBaseUrl: options.apiBaseUrl,
        maxPollAttempts: options.maxPollAttempts,
        pollIntervalSeconds: options.pollIntervalSeconds,
        debug: !!options.debug,
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