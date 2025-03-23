// GitHub adapter tests

const GenericAdapter = require("../../../src/adapters/generic");

describe("GenericAdapter", () => {
  let adapter;

  beforeEach(() => {
    // Clear relevant environment variables
    delete process.env.CI;
    delete process.env.BUILD_NUMBER;
    delete process.env.CI_BRANCH;
    delete process.env.CI_COMMIT_SHA;
    adapter = new GenericAdapter();
  });

  describe("isCI", () => {
    it("should return true when CI env var is set", () => {
      process.env.CI = "true";
      expect(adapter.isCI()).toBe(true);
    });

    it("should return true when BUILD_NUMBER is set", () => {
      process.env.BUILD_NUMBER = "123";
      expect(adapter.isCI()).toBe(true);
    });

    it("should return false when no CI variables are set", () => {
      expect(adapter.isCI()).toBe(false);
    });
  });

  describe("setOutput and getOutput", () => {
    it("should store and retrieve output values", () => {
      adapter.setOutput("key1", "value1");
      adapter.setOutput("key2", "value2");

      expect(adapter.getOutput("key1")).toBe("value1");
      expect(adapter.getOutput("key2")).toBe("value2");
    });

    it("should return undefined for non-existent outputs", () => {
      expect(adapter.getOutput("nonexistent")).toBeUndefined();
    });
  });

  describe("getConfigFromEnv", () => {
    it("should return default values when no env vars set", () => {
      const config = adapter.getConfigFromEnv();
      expect(config).toEqual({
        branch: undefined,
        commit: undefined,
        repository: undefined,
        buildNumber: undefined,
      });
    });

    it("should return values from environment variables", () => {
      process.env.CI_BRANCH = "main";
      process.env.CI_COMMIT_SHA = "abc123";
      process.env.CI_REPOSITORY = "repo/name";
      process.env.BUILD_NUMBER = "123";

      const config = adapter.getConfigFromEnv();
      expect(config).toEqual({
        branch: "main",
        commit: "abc123",
        repository: "repo/name",
        buildNumber: "123",
      });
    });

    it("should merge options with environment variables", () => {
      const adapter = new GenericAdapter({
        customOption: "value",
      });

      const config = adapter.getConfigFromEnv();
      expect(config).toHaveProperty("customOption", "value");
    });
  });

  describe("getBuildInfo", () => {
    it("should return build information from config", () => {
      process.env.CI_BRANCH = "feature";
      process.env.CI_COMMIT_SHA = "def456";
      process.env.CI_REPOSITORY = "test/repo";
      process.env.BUILD_NUMBER = "789";

      const buildInfo = adapter.getBuildInfo();
      expect(buildInfo).toEqual({
        branch: "feature",
        commit: "def456",
        repository: "test/repo",
        buildNumber: "789",
      });
    });
  });
});
