const recommendationsByType = {
  validation_error: {
    reason: "Часть полей заполнена неверно или не полностью.",
    fix: "Проверьте обязательные поля формы и формат значений.",
  },
  auth_error: {
    reason: "Токен отсутствует, просрочен или у пользователя недостаточно прав.",
    fix: "Войдите заново и повторите действие с нужной ролью.",
  },
  not_found_error: {
    reason: "Запрашиваемая запись не найдена в базе данных.",
    fix: "Проверьте корректность идентификатора или обновите страницу.",
  },
  conflict_error: {
    reason: "Конфликт состояния данных (например, дубль отклика).",
    fix: "Проверьте текущие данные и выполните альтернативное действие.",
  },
  server_error: {
    reason: "Внутренняя ошибка сервера.",
    fix: "Повторите запрос позже и передайте traceId разработчику.",
  },
};

function ApiErrorAlert({ error, onClose }) {
  if (!error) return null;

  const recommendation = recommendationsByType[error.type] || recommendationsByType.server_error;

  return (
    <div className="alert alert-danger border shadow-sm" role="alert">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h2 className="h6 mb-2">Ошибка: {error.userMessage}</h2>
          <div className="small mb-1">
            <strong>Причина:</strong> {recommendation.reason}
          </div>
          <div className="small mb-2">
            <strong>Как исправить:</strong> {recommendation.fix}
          </div>
          <div className="small text-secondary">
            Тип: {error.type} | Код: {error.code}
          </div>
          {error.traceId && <div className="small text-secondary">Trace ID: {error.traceId}</div>}
        </div>
        {onClose && (
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={onClose}>
            Закрыть
          </button>
        )}
      </div>

      {Array.isArray(error.details) && error.details.length > 0 && (
        <div className="mt-2">
          <div className="small fw-semibold mb-1">Детали по полям:</div>
          <ul className="small mb-0">
            {error.details.map((detail, index) => (
              <li key={`${detail.field}-${index}`}>
                {detail.field}: {detail.issue} ({detail.expected})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ApiErrorAlert;

