class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message);
    this.status = status;
    this.type = options.type;
    this.code = options.code;
    this.userMessage = options.userMessage;
    this.developerMessage = options.developerMessage;
    this.details = options.details || [];
  }
}

module.exports = HttpError;
