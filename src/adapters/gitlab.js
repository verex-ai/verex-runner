const { log } = require("../utils/log");

/**
 * GitLab CI adapter
 */
class GitLabAdapter {
  /**
   * Create a new GitLab CI adapter
   *
   * @param {Object} [options] - Adapter options
   */
  constructor(options = {}) {
    this.outputs = {};
    log.debug("GitLab adapter initialized");
  }

  /**
   * Check if running in GitLab CI
   *
   * @returns {boolean} Whether running in GitLab CI
   */
  isGitLabCI() {
    return !!process.env.GITLAB_CI;
  }

  /**
   * Set output as GitLab CI variables
   * GitLab doesn't have a direct equivalent to GitHub's outputs,
   * but we can store them and make them available via the results
   *
   * @param {string} name - Output name
   * @param {string} value - Output value
   */
  setOutput(name, value) {
    this.outputs[name] = value;
    log.debug(`Setting GitLab output ${name}=${value}`);
  }

  /**
   * Get all outputs
   *
   * @returns {Object} All outputs
   */
  getOutputs() {
    return this.outputs;
  }

  /**
   * Get configuration from GitLab environment variables
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
    };
  }
}

module.exports = GitLabAdapter;
