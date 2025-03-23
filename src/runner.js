const { makeApiRequest } = require("./utils/api");
const { log } = require("./utils/log");

/**
 * VerexTestRunner class to handle test execution
 */
class VerexTestRunner {
  /**
   * Create a new test runner instance
   *
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - Verex API key
   * @param {string} config.testSuiteId - Test suite ID to run
   * @param {string} [config.testBaseUrl] - Base URL for tests
   * @param {string} [config.apiBaseUrl] - Verex API base URL
   * @param {number} [config.maxPollAttempts] - Maximum number of polling attempts
   * @param {number} [config.pollIntervalSeconds] - Interval between polling attempts in seconds
   * @param {boolean} [config.debug] - Enable debug logging
   * @param {Object} adapter - CI/CD platform adapter
   */
  constructor(config, adapter) {
    this.config = {
      apiKey: config.apiKey,
      testSuiteId: config.testSuiteId,
      testBaseUrl: config.testBaseUrl,
      apiBaseUrl: config.apiBaseUrl || "https://verex.ai/api",
      maxPollAttempts: config.maxPollAttempts || 60,
      pollIntervalSeconds: config.pollIntervalSeconds || 10,
      debug: config.debug || false,
    };

    this.adapter = adapter;
    this.startTime = Date.now();

    if (this.config.debug) {
      log.setLevel("DEBUG");
    }
    log.debug("Initialized VerexTestRunner with config:", {
      ...this.config,
      apiKey: "***", // Don't log the API key
    });
  }

  /**
   * Queue tests for execution
   *
   * @returns {Promise<Object>} Response from the API
   */
  async queueTests() {
    try {
      log.info(`Starting test suite: ${this.config.testSuiteId}`);

      const data = {};
      if (this.config.testBaseUrl) {
        data.url = this.config.testBaseUrl;
      }

      log.debug(`Queueing tests with data: ${JSON.stringify(data)}`);

      const apiUrl = `${this.config.apiBaseUrl}/apiRunners/runTestSuite/${this.config.testSuiteId}`;
      log.debug(`Queueing tests using API: ${apiUrl}`);

      const response = await makeApiRequest({
        method: "POST",
        url: apiUrl,
        data,
        apiKey: this.config.apiKey,
      });

      // Record start time for duration calculation
      this.startTime = Date.now();
      if (this.adapter) {
        this.adapter.setOutput("start_time", this.startTime.toString());
      }

      return response;
    } catch (error) {
      log.error(
        `Failed to queue tests: ${error.response?.data || error.message}`
      );
      throw error;
    }
  }

  /**
   * Get the test suite run details
   *
   * @param {string} runId - ID of the test suite run
   * @param {boolean} includeTestRuns - Whether to include individual test runs
   * @returns {Promise<Object>} Test suite run details
   */
  async getTestSuiteRun(runId, includeTestRuns = false) {
    try {
      const apiUrl = `${
        this.config.apiBaseUrl
      }/apiRunners/testSuiteRun/${runId}?includeTestRuns=${
        includeTestRuns ? "true" : "false"
      }`;

      log.debug(`Checking test status using API: ${apiUrl}`);

      const response = await makeApiRequest({
        method: "GET",
        url: apiUrl,
        apiKey: this.config.apiKey,
      });

      return response;
    } catch (error) {
      log.error(
        `Failed to check test status: ${error.response?.data || error.message}`
      );
      throw error;
    }
  }

  /**
   * Sleep function to wait between polling attempts
   *
   * @param {number} seconds - Seconds to sleep
   * @returns {Promise<void>}
   */
  sleep(seconds) {
    log.debug(`Sleeping for ${seconds} seconds`);
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  /**
   * Poll until tests complete or timeout
   *
   * @param {string} runId - ID of the test suite run
   * @returns {Promise<string>} Final status of the test suite run
   */
  async pollUntilComplete(runId) {
    log.info(`Polling for test completion: ${runId}`);

    let attempts = 0;

    while (attempts < this.config.maxPollAttempts) {
      attempts++;

      const testSuiteRunResponse = await this.getTestSuiteRun(runId, false);
      const status = testSuiteRunResponse.testSuiteRun.status;
      log.info(
        `Poll attempt ${attempts}/${this.config.maxPollAttempts}: Status - ${status}`
      );

      if (status === "PASSED") {
        log.debug(`Tests completed: ${status}`);
        return status;
      } else if (status === "FAILED" || status === "ERROR") {
        log.error(`Tests failed or encountered an error: ${status}`);
        return status;
      }

      await this.sleep(this.config.pollIntervalSeconds);
    }

    log.error(`Timed out after ${attempts} attempts`);
    return "TIMEOUT";
  }

  /**
   * Process the test results
   *
   * @param {Object} testSuiteRun - Test suite run object
   * @param {Array} testRuns - Array of test runs
   * @returns {Object} Processed results
   */
  processResults(testSuiteRun, testRuns) {
    const totalTests = testRuns.length;
    const passed = testRuns.filter(
      (testRun) => testRun.status === "PASSED"
    ).length;
    const failed = testRuns.filter(
      (testRun) => testRun.status === "FAILED"
    ).length;
    const skipped = testRuns.filter(
      (testRun) => testRun.status === "SKIPPED"
    ).length;

    log.info("\n============ TEST RESULTS ============");
    log.info(`Total Tests: ${totalTests}`);
    log.info(`Passed: ${passed}`);
    log.info(`Failed: ${failed}`);
    log.info(`Skipped: ${skipped}`);
    log.info("======================================\n");

    // Calculate test duration
    const endTime = Date.now();
    const duration = Math.floor((endTime - this.startTime) / 1000);

    const results = {
      totalTests,
      passed,
      failed,
      skipped,
      duration,
      status: testSuiteRun.status,
    };

    // Set output variables if adapter is available
    if (this.adapter) {
      this.adapter.setOutput("total_tests", totalTests.toString());
      this.adapter.setOutput("passed_tests", passed.toString());
      this.adapter.setOutput("failed_tests", failed.toString());
      this.adapter.setOutput("test_duration", duration.toString());
      this.adapter.setOutput("test_status", testSuiteRun.status);
    }

    return results;
  }

  /**
   * Validate required configuration
   *
   * @throws {Error} If required configuration is missing
   */
  validateConfig() {
    log.debug(`Validating inputs`);

    if (!this.config.apiKey) {
      throw new Error("'apiKey' is not set");
    }

    if (!this.config.testSuiteId) {
      throw new Error("'testSuiteId' is not set");
    }

    log.debug(`Inputs validated`);
  }

  /**
   * Run the test suite and return results
   *
   * @returns {Promise<Object>} Test results
   */
  async run() {
    try {
      this.validateConfig();

      const runTestSuiteResponse = await this.queueTests();
      const runId = runTestSuiteResponse.testSuiteRun.id;
      log.debug(`Test suite run ID: ${runId}`);

      // Step 2: Poll until completion or timeout
      const testSuiteRunStatus = await this.pollUntilComplete(runId);

      // Step 3: Get final results
      const results = await this.getTestSuiteRun(runId, true);
      const processedResults = this.processResults(
        results.testSuiteRun,
        results.testRuns
      );

      if (testSuiteRunStatus === "PASSED") {
        if (this.adapter) {
          this.adapter.setOutput("test_status", "COMPLETED");
        }
        log.info("All tests passed successfully");
      } else {
        log.error(
          `Tests failed or encountered an error: ${testSuiteRunStatus}`
        );
        if (this.adapter) {
          this.adapter.setOutput("test_status", testSuiteRunStatus || "FAILED");
        }
        // Don't throw here, let the caller decide what to do based on the results
      }

      return {
        ...processedResults,
        runId,
        testSuiteRunStatus,
        hasFailed:
          processedResults.failed > 0 || testSuiteRunStatus !== "PASSED",
      };
    } catch (error) {
      log.error(`Error executing tests: ${error}`);
      if (this.adapter) {
        this.adapter.setOutput("test_status", "ERROR");
      }
      throw error;
    }
  }
}

module.exports = VerexTestRunner;
