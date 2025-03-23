const fs = require("fs");
const { log } = require("../utils/log");

/**
 * GitHub Actions adapter
 */
class GitHubAdapter {
  /**
   * Create a new GitHub Actions adapter
   *
   * @param {Object} [options] - Adapter options
   */
  constructor(options = {}) {
    this.outputFile = process.env.GITHUB_OUTPUT;
    log.debug(
      `GitHub adapter initialized. Output file: ${this.outputFile || "not set"}`
    );
  }

  /**
   * Check if running in GitHub Actions
   *
   * @returns {boolean} Whether running in GitHub Actions
   */
  isGitHubActions() {
    return !!process.env.GITHUB_ACTIONS;
  }

  /**
   * Set GitHub Actions output
   *
   * @param {string} name - Output name
   * @param {string} value - Output value
   */
  setOutput(name, value) {
    if (this.outputFile) {
      log.debug(`Setting GitHub output ${name}=${value}`);
      fs.appendFileSync(this.outputFile, `${name}=${value}\n`);
    } else {
      log.debug(
        `Would set GitHub output ${name}=${value} if GITHUB_OUTPUT was set`
      );
    }
  }

  /**
   * Get configuration from GitHub environment variables
   *
   * @returns {Object} Configuration object
   */
  getConfigFromEnv() {
    return {
      apiKey: process.env.API_KEY || "",
      testSuiteId: process.env.TEST_SUITE_ID || "",
      testBaseUrl: process.env.TEST_BASE_URL || "",
      apiBaseUrl: process.env.API_BASE_URL || "",
      maxPollAttempts: parseInt(process.env.MAX_POLL_ATTEMPTS || "60"),
      pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || "10"),
      debug: (process.env.DEBUG || "false").toLowerCase() === "true",
    };
  }
}

module.exports = GitHubAdapter;
