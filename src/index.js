const VerexTestRunner = require("./runner");
const adapters = require("./adapters");
const { validateConfig } = require("./utils/config");
const { log } = require("./utils/log");

/**
 * Run Verex tests with the provided configuration
 *
 * @param {Object} config - Configuration object
 * @param {Object} [adapter] - CI/CD platform adapter
 * @returns {Promise<Object>} Test results
 */
async function runTests(config, adapter) {
  try {
    validateConfig(config);
    const runner = new VerexTestRunner(config, adapter);
    return await runner.run();
  } catch (error) {
    log.error(`Error running tests: ${error.message}`);
    throw error;
  }
}

/**
 * Run tests with automatic environment detection
 *
 * @param {Object} [options] - Configuration options to override environment
 * @returns {Promise<Object>} Test results
 */
async function runTestsWithAutoDetection(options = {}) {
  // Auto-detect environment and create adapter
  const adapter = adapters.createAdapter();

  // Get config from environment and merge with provided options
  const envConfig = adapter ? adapters.getConfigFromEnv(adapter) : {};
  const config = { ...envConfig, ...options };

  return runTests(config, adapter);
}

module.exports = {
  VerexTestRunner,
  adapters,
  runTests,
  runTestsWithAutoDetection,
};
