const GitHubAdapter = require("./github");
const GitLabAdapter = require("./gitlab");
const BitbucketAdapter = require("./bitbucket");
const { log } = require("../utils/log");

/**
 * Create an adapter for the current CI/CD environment
 *
 * @param {Object} [options] - Adapter options
 * @returns {Object|null} Appropriate adapter for the current environment
 */
function createAdapter(options = {}) {
  // Try to detect the CI environment
  const githubAdapter = new GitHubAdapter(options);
  if (githubAdapter.isGitHubActions()) {
    log.debug("Detected GitHub Actions environment");
    return githubAdapter;
  }

  const gitlabAdapter = new GitLabAdapter(options);
  if (gitlabAdapter.isGitLabCI()) {
    log.debug("Detected GitLab CI environment");
    return gitlabAdapter;
  }

  const bitbucketAdapter = new BitbucketAdapter(options);
  if (bitbucketAdapter.isBitbucketPipelines()) {
    log.debug("Detected Bitbucket Pipelines environment");
    return bitbucketAdapter;
  }

  log.debug("No CI environment detected");
  return null;
}

/**
 * Get configuration from the current environment
 *
 * @param {Object} adapter - CI/CD adapter
 * @returns {Object} Configuration from environment variables
 */
function getConfigFromEnv(adapter) {
  if (!adapter) return {};
  return adapter.getConfigFromEnv();
}

module.exports = {
  GitHubAdapter,
  GitLabAdapter,
  BitbucketAdapter,
  createAdapter,
  getConfigFromEnv,
};
