class Logger {
  static LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }
    this.currentLogLevel = Logger.LOG_LEVELS.INFO;
    Logger.instance = this;
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${message}`;
  }

  setLevel(level) {
    if (Logger.LOG_LEVELS[level] !== undefined) {
      this.currentLogLevel = Logger.LOG_LEVELS[level];
    }
  }

  debug(message) {
    if (this.currentLogLevel <= Logger.LOG_LEVELS.DEBUG) {
      console.log("\x1b[36m%s\x1b[0m", this.formatMessage("DEBUG", message)); // Cyan color
    }
  }

  info(message) {
    if (this.currentLogLevel <= Logger.LOG_LEVELS.INFO) {
      console.log("\x1b[32m%s\x1b[0m", this.formatMessage("INFO", message)); // Green color
    }
  }

  warn(message) {
    if (this.currentLogLevel <= Logger.LOG_LEVELS.WARN) {
      console.log("\x1b[33m%s\x1b[0m", this.formatMessage("WARN", message)); // Yellow color
    }
  }

  error(message) {
    if (this.currentLogLevel <= Logger.LOG_LEVELS.ERROR) {
      console.log("\x1b[31m%s\x1b[0m", this.formatMessage("ERROR", message)); // Red color
    }
  }
}

// Create and export a singleton instance
const singleton = new Logger();

module.exports = {
  log: singleton,
};
