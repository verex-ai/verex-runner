require("dotenv").config();

/**
 * Load configuration from various sources
 *
 * @param {Object} options - Configuration options
 * @param {Object} [options.env] - Environment configuration
 * @param {Object} [options.cli] - CLI arguments configuration
 * @param {Object} [options.file] - File configuration
 * @returns {Object} Merged configuration
 */
function loadConfig(options = {}) {
  const { env = {}, cli = {}, file = {} } = options;

  // Merge configurations with precedence: CLI > Environment > File > Defaults
  return {
    apiKey: cli.apiKey || env.apiKey || file.apiKey || "",
    testSuiteId: cli.testSuiteId || env.testSuiteId || file.testSuiteId || "",
    testBaseUrl: cli.testBaseUrl || env.testBaseUrl || file.testBaseUrl || "",
    apiBaseUrl:
      cli.apiBaseUrl ||
      env.apiBaseUrl ||
      file.apiBaseUrl ||
      "https://verex.ai/api",
    maxPollAttempts: parseInt(
      cli.maxPollAttempts || env.maxPollAttempts || file.maxPollAttempts || "60"
    ),
    pollIntervalSeconds: parseInt(
      cli.pollIntervalSeconds ||
        env.pollIntervalSeconds ||
        file.pollIntervalSeconds ||
        "10"
    ),
    debug:
      (cli.debug || env.debug || file.debug || "false")
        .toString()
        .toLowerCase() === "true",
    outputFile: cli.outputFile || env.outputFile || file.outputFile || "",
  };
}

/**
 * Validate configuration
 *
 * @param {Object} config - Configuration object
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
  const errors = [];

  if (!config.apiKey) {
    errors.push("apiKey is required");
  }

  if (!config.testSuiteId) {
    errors.push("testSuiteId is required");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(", ")}`);
  }
}

module.exports = {
  loadConfig,
  validateConfig,
};
