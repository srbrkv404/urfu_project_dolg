import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../api/http";
import ApiErrorAlert from "../components/ApiErrorAlert";
import { extractApiError } from "../utils/api-error";

const statusOptions = ["REVIEWING", "ACCEPTED", "REJECTED"];
const statusLabels = {
  SUBMITTED: "Отправлен",
  REVIEWING: "На рассмотрении",
  ACCEPTED: "Принят",
  REJECTED: "Отклонен",
};

function JobApplicationsPage() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const { data } = await http.get(`/jobs/${jobId}/applications`);
      setApplications(data);
    } catch (requestError) {
      setError(extractApiError(requestError, "Не удалось загрузить отклики."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const changeStatus = async (applicationId, status) => {
    setError(null);
    try {
      await http.patch(`/applications/${applicationId}/status`, { status });
      await loadApplications();
    } catch (requestError) {
      setError(extractApiError(requestError, "Не удалось обновить статус."));
    }
  };

  return (
    <main className="container py-4 py-md-5">
      <section className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Отклики по вакансии #{jobId}</h1>
        <Link to="/employer/jobs" className="btn btn-outline-secondary btn-sm">
          Назад
        </Link>
      </section>

      {loading && <div className="alert alert-info">Загрузка откликов...</div>}
      <ApiErrorAlert error={error} onClose={() => setError(null)} />

      {!loading && !error && (
        <>
          {applications.length === 0 && (
            <div className="alert alert-light border">
              Пока нет откликов на эту вакансию.
            </div>
          )}

          <div className="table-responsive d-none d-md-block">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Email</th>
                  <th>Текущий статус</th>
                  <th>Изменить</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.studentProfile.user.fullName}</td>
                    <td>{item.studentProfile.user.email}</td>
                    <td>{statusLabels[item.status] || item.status}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={item.status}
                        onChange={(event) => changeStatus(item.id, event.target.value)}
                      >
                        <option value={item.status}>{statusLabels[item.status] || item.status}</option>
                        {statusOptions
                          .filter((status) => status !== item.status)
                          .map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status] || status}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-grid gap-2 d-md-none">
            {applications.map((item) => (
              <article key={item.id} className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="fw-semibold">{item.studentProfile.user.fullName}</div>
                  <div className="text-secondary small mb-2">{item.studentProfile.user.email}</div>
                  <div className="small mb-2">Статус: {statusLabels[item.status] || item.status}</div>
                  <select
                    className="form-select form-select-sm"
                    value={item.status}
                    onChange={(event) => changeStatus(item.id, event.target.value)}
                  >
                    <option value={item.status}>{statusLabels[item.status] || item.status}</option>
                    {statusOptions
                      .filter((status) => status !== item.status)
                      .map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status] || status}
                        </option>
                      ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default JobApplicationsPage;
