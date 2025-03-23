// Runner tests

const VerexTestRunner = require("../../src/runner");
const { makeApiRequest } = require("../../src/utils/api");
const { log } = require("../../src/utils/log");

// Mock the api module
jest.mock("../../src/utils/api");

// Mock the logger
jest.mock("../../src/utils/log", () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    setLevel: jest.fn(),
  },
}));

describe("VerexTestRunner", () => {
  let runner;
  const mockConfig = {
    apiKey: "test-api-key",
    testSuiteId: "test-suite-123",
    testBaseUrl: "http://test.com",
    maxPollAttempts: 2,
    pollIntervalSeconds: 0.1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    runner = new VerexTestRunner(mockConfig);
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const basicRunner = new VerexTestRunner({
        apiKey: "key",
        testSuiteId: "suite",
      });

      expect(basicRunner.config.apiBaseUrl).toBe("https://verex.ai/api");
      expect(basicRunner.config.maxPollAttempts).toBe(60);
      expect(basicRunner.config.pollIntervalSeconds).toBe(10);
    });

    it("should throw error when required config is missing", async () => {
      const invalidRunner = new VerexTestRunner({});
      await expect(invalidRunner.run()).rejects.toThrow("'apiKey' is not set");
    });
  });

  describe("queueTests", () => {
    it("should queue tests successfully", async () => {
      const mockResponse = {
        testSuiteRun: { id: "run-123" },
      };
      makeApiRequest.mockResolvedValueOnce(mockResponse);

      const response = await runner.queueTests();

      expect(makeApiRequest).toHaveBeenCalledWith({
        method: "POST",
        url: "https://verex.ai/api/apiRunners/runTestSuite/test-suite-123",
        data: { url: "http://test.com" },
        apiKey: "test-api-key",
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe("pollUntilComplete", () => {
    it("should return PASSED when tests complete successfully", async () => {
      makeApiRequest.mockResolvedValueOnce({
        testSuiteRun: { status: VerexTestRunner.STATUS.PASSED },
      });

      const status = await runner.pollUntilComplete("run-123");
      expect(status).toBe(VerexTestRunner.STATUS.PASSED);
    });

    it("should return FAILED when tests fail", async () => {
      makeApiRequest.mockResolvedValueOnce({
        testSuiteRun: { status: VerexTestRunner.STATUS.FAILED },
      });

      const status = await runner.pollUntilComplete("run-123");
      expect(status).toBe(VerexTestRunner.STATUS.FAILED);
    });

    it("should return TIMEOUT when max attempts reached", async () => {
      makeApiRequest.mockResolvedValue({
        testSuiteRun: { status: "RUNNING" },
      });

      const status = await runner.pollUntilComplete("run-123");
      expect(status).toBe(VerexTestRunner.STATUS.TIMEOUT);
    });
  });

  describe("processResults", () => {
    it("should process test results correctly", () => {
      const testSuiteRun = { status: VerexTestRunner.STATUS.PASSED };
      const testRuns = [
        { status: VerexTestRunner.STATUS.PASSED },
        { status: VerexTestRunner.STATUS.FAILED },
        { status: VerexTestRunner.STATUS.SKIPPED },
      ];

      const results = runner.processResults(testSuiteRun, testRuns);

      expect(results).toEqual({
        totalTests: 3,
        passed: 1,
        failed: 1,
        skipped: 1,
        duration: expect.any(Number),
        status: VerexTestRunner.STATUS.PASSED,
      });
    });
  });

  describe("run", () => {
    it("should execute full test flow successfully", async () => {
      // Mock successful test execution
      makeApiRequest
        .mockResolvedValueOnce({ testSuiteRun: { id: "run-123" } }) // queueTests
        .mockResolvedValueOnce({
          testSuiteRun: { status: VerexTestRunner.STATUS.PASSED },
        }) // pollUntilComplete
        .mockResolvedValueOnce({
          // getTestSuiteRun
          testSuiteRun: { status: VerexTestRunner.STATUS.PASSED },
          testRuns: [{ status: VerexTestRunner.STATUS.PASSED }],
        });

      const results = await runner.run();

      expect(results).toEqual({
        totalTests: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
        duration: expect.any(Number),
        status: VerexTestRunner.STATUS.PASSED,
        runId: "run-123",
        testSuiteRunStatus: VerexTestRunner.STATUS.PASSED,
        hasFailed: false,
      });
    });

    it("should handle test failures", async () => {
      makeApiRequest
        .mockResolvedValueOnce({ testSuiteRun: { id: "run-123" } })
        .mockResolvedValueOnce({
          testSuiteRun: { status: VerexTestRunner.STATUS.FAILED },
        })
        .mockResolvedValueOnce({
          testSuiteRun: { status: VerexTestRunner.STATUS.FAILED },
          testRuns: [{ status: VerexTestRunner.STATUS.FAILED }],
        });

      const results = await runner.run();

      expect(results.hasFailed).toBe(true);
      expect(results.testSuiteRunStatus).toBe(VerexTestRunner.STATUS.FAILED);
    });
  });

  describe("logging", () => {
    it("should log debug messages when debug is enabled", () => {
      const debugRunner = new VerexTestRunner({
        ...mockConfig,
        debug: true,
      });

      expect(log.setLevel).toHaveBeenCalledWith("DEBUG");
    });

    it("should log errors when tests fail", async () => {
      makeApiRequest.mockRejectedValueOnce(new Error("API Error"));

      await expect(runner.queueTests()).rejects.toThrow();
      expect(log.error).toHaveBeenCalled();
    });
  });
});
