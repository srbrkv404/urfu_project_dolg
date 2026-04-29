export const defaultApiError = {
  type: "server_error",
  code: "UNKNOWN_ERROR",
  userMessage: "Произошла ошибка при выполнении запроса.",
  developerMessage: "",
  details: [],
  traceId: "",
};

export const extractApiError = (requestError, fallbackMessage) => {
  const apiError = requestError?.response?.data?.error;
  if (apiError) {
    return {
      ...defaultApiError,
      ...apiError,
      userMessage: apiError.userMessage || fallbackMessage || defaultApiError.userMessage,
    };
  }

  return {
    ...defaultApiError,
    userMessage: fallbackMessage || defaultApiError.userMessage,
  };
};

