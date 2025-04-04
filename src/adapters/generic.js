const fs = require("fs");
const { log } = require("../utils/log");

class GenericAdapter {
  constructor(options = {}) {
    this.options = options;
    this.outputs = new Map(); // Add storage for outputs
  }

  /**
   * Get configuration from environment variables
   * @returns {Object} Configuration object
   */
  getConfigFromEnv() {
    return {
      // Basic CI environment variables that are commonly available
      branch:
        process.env.CI_BRANCH ||
        process.env.BRANCH_NAME ||
        process.env.GIT_BRANCH,
      commit: process.env.CI_COMMIT_SHA || process.env.GIT_COMMIT,
      repository: process.env.CI_REPOSITORY || process.env.REPOSITORY_URL,
      buildNumber: process.env.BUILD_NUMBER || process.env.CI_BUILD_NUMBER,
      // Verex specific environment variables
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
      ...this.options,
    };
  }

  /**
   * Check if running in a CI environment
   * @returns {boolean}
   */
  isCI() {
    return Boolean(process.env.CI || process.env.BUILD_NUMBER);
  }

  /**
   * Get the current build information
   * @returns {Object} Build information
   */
  getBuildInfo() {
    const config = this.getConfigFromEnv();
    return {
      branch: config.branch,
      commit: config.commit,
      buildNumber: config.buildNumber,
      repository: config.repository,
    };
  }

  /**
   * Set output value
   * @param {string} name Output name
   * @param {string} value Output value
   */
  setOutput(name, value) {
    this.outputs.set(name, value);
    log.debug(`Set output ${name}=${value}`);
  }

  /**
   * Get output value
   * @param {string} name Output name
   * @returns {string|undefined} Output value
   */
  getOutput(name) {
    return this.outputs.get(name);
  }
}

module.exports = GenericAdapter;
