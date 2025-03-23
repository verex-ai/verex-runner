// GitHub adapter tests

const GitLabAdapter = require("../../../src/adapters/gitlab");

describe("GitLabAdapter", () => {
  let adapter;

  beforeEach(() => {
    delete process.env.GITLAB_CI;
    delete process.env.VEREX_API_KEY;
    adapter = new GitLabAdapter();
  });

  describe("isGitLabCI", () => {
    it("should return true when running in GitLab CI", () => {
      process.env.GITLAB_CI = "true";
      expect(adapter.isGitLabCI()).toBe(true);
    });

    it("should return false when not running in GitLab CI", () => {
      expect(adapter.isGitLabCI()).toBe(false);
    });
  });

  describe("setOutput and getOutputs", () => {
    it("should store and retrieve outputs", () => {
      adapter.setOutput("key1", "value1");
      adapter.setOutput("key2", "value2");

      expect(adapter.getOutputs()).toEqual({
        key1: "value1",
        key2: "value2",
      });
    });
  });

  describe("getConfigFromEnv", () => {
    it("should return default values when no env vars set", () => {
      const config = adapter.getConfigFromEnv();
      expect(config).toEqual({
        apiKey: "",
        testSuiteId: "",
        testBaseUrl: "",
        apiBaseUrl: "",
        maxPollAttempts: 60,
        pollIntervalSeconds: 10,
        debug: false,
      });
    });

    it("should return values from environment variables", () => {
      process.env.VEREX_API_KEY = "test-key";
      process.env.VEREX_TEST_SUITE_ID = "test-suite";
      process.env.VEREX_TEST_BASE_URL = "http://test.com";
      process.env.VEREX_API_BASE_URL = "http://api.test.com";
      process.env.VEREX_MAX_POLL_ATTEMPTS = "30";
      process.env.VEREX_POLL_INTERVAL_SECONDS = "5";
      process.env.VEREX_DEBUG = "true";

      const config = adapter.getConfigFromEnv();
      expect(config).toEqual({
        apiKey: "test-key",
        testSuiteId: "test-suite",
        testBaseUrl: "http://test.com",
        apiBaseUrl: "http://api.test.com",
        maxPollAttempts: 30,
        pollIntervalSeconds: 5,
        debug: true,
      });
    });
  });
});
