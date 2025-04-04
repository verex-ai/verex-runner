const { log } = require("../utils/log");

/**
 * Bitbucket Pipelines adapter
 */
class BitbucketAdapter {
  /**
   * Create a new Bitbucket Pipelines adapter
   *
   * @param {Object} [options] - Adapter options
   */
  constructor(options = {}) {
    this.outputFile = options.outputFile || process.env.BITBUCKET_OUTPUT;
    log.debug("Bitbucket adapter initialized");
  }

  /**
   * Check if running in Bitbucket Pipelines
   *
   * @returns {boolean} Whether running in Bitbucket Pipelines
   */
  isBitbucketPipelines() {
    return !!process.env.BITBUCKET_BUILD_NUMBER;
  }

  /**
   * Set output (stores in memory for later retrieval)
   *
   * @param {string} name - Output name
   * @param {string} value - Output value
   */
  setOutput(name, value) {
    if (this.outputFile) {
      log.debug(`Setting Bitbucket output ${name}=${value}`);
      fs.appendFileSync(this.outputFile, `${name}=${value}\n`);
    } else {
      log.debug(
        `Would set Bitbucket output ${name}=${value} if config.outputFile or BITBUCKET_OUTPUT was set`
      );
    }
  }

  /**
   * Get configuration from Bitbucket environment variables
   *
   * @returns {Object} Configuration object
   */
  getConfigFromEnv() {
    return {
      apiKey: process.env.VEREX_API_KEY || "",
      testSuiteId: process.env.VEREX_TEST_SUITE_ID || "",
      testBaseUrl: process.env.VEREX_TEST_BASE_URL || "",
      apiBaseUrl: process.env.VEREX_API_BASE_URL || "",
      maxPollAttempts: parseInt(process.env.VEREX_MAX_POLL_ATTEMPTS || "60"),
      pollIntervalSeconds: parseInt(
        process.env.VEREX_POLL_INTERVAL_SECONDS || "10"
      ),
      debug: (process.env.VEREX_DEBUG || "false").toLowerCase() === "true",
      outputFile: process.env.VEREX_OUTPUT_FILE || "",
    };
  }
}

module.exports = BitbucketAdapter;
