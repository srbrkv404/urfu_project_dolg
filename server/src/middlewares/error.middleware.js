const TYPE_BY_STATUS = {
  400: "validation_error",
  401: "auth_error",
  403: "auth_error",
  404: "not_found_error",
  409: "conflict_error",
};

const CODE_BY_STATUS = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  500: "INTERNAL_SERVER_ERROR",
};

const errorHandler = (error, req, res, _next) => {
  const status = error.status || 500;
  const traceId = req.headers["x-trace-id"] || `trace-${Date.now()}`;
  const fallbackMessage = status === 500 ? "Внутренняя ошибка сервера." : "Ошибка запроса.";
  const message = error.message || fallbackMessage;
  const type = error.type || TYPE_BY_STATUS[status] || "server_error";
  const code = error.code || CODE_BY_STATUS[status] || "INTERNAL_SERVER_ERROR";

  return res.status(status).json({
    error: {
      type,
      code,
      userMessage: error.userMessage || message,
      developerMessage: error.developerMessage || message,
      details: Array.isArray(error.details) ? error.details : [],
      traceId,
    },
  });
};

module.exports = errorHandler;
