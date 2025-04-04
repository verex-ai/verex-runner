// GitHub adapter tests

const GitHubAdapter = require("../../../src/adapters/github");
const fs = require("fs");

// Mock fs module
jest.mock("fs", () => ({
  appendFileSync: jest.fn(),
}));

describe("GitHubAdapter", () => {
  let adapter;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GITHUB_ACTIONS;
    delete process.env.GITHUB_OUTPUT;
    // delete all env vars that start with VEREX_
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("VEREX_")) {
        delete process.env[key];
      }
    });
    adapter = new GitHubAdapter();
  });

  describe("isGitHubActions", () => {
    it("should return true when running in GitHub Actions", () => {
      process.env.GITHUB_ACTIONS = "true";
      expect(adapter.isGitHubActions()).toBe(true);
    });

    it("should return false when not running in GitHub Actions", () => {
      expect(adapter.isGitHubActions()).toBe(false);
    });
  });

  describe("setOutput", () => {
    it("should write to GITHUB_OUTPUT file when available", () => {
      process.env.GITHUB_OUTPUT = "/path/to/output";
      adapter = new GitHubAdapter();

      adapter.setOutput("key", "value");

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        "/path/to/output",
        "key=value\n"
      );
    });

    it("should not write when GITHUB_OUTPUT is not set", () => {
      adapter.setOutput("key", "value");
      expect(fs.appendFileSync).not.toHaveBeenCalled();
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
        outputFile: "",
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
      process.env.VEREX_OUTPUT_FILE = "test-output.txt";

      const config = adapter.getConfigFromEnv();
      expect(config).toEqual({
        apiKey: "test-key",
        testSuiteId: "test-suite",
        testBaseUrl: "http://test.com",
        apiBaseUrl: "http://api.test.com",
        maxPollAttempts: 30,
        pollIntervalSeconds: 5,
        debug: true,
        outputFile: "test-output.txt",
      });
    });
  });
});
