import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../api/http";

const statusOptions = ["REVIEWING", "ACCEPTED", "REJECTED"];

function JobApplicationsPage() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const { data } = await http.get(`/jobs/${jobId}/applications`);
      setApplications(data);
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.userMessage || "Не удалось загрузить отклики.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const changeStatus = async (applicationId, status) => {
    setError("");
    try {
      await http.patch(`/applications/${applicationId}/status`, { status });
      await loadApplications();
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.userMessage || "Не удалось обновить статус.");
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

      {loading && <div className="alert alert-info">Загрузка...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
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
                  <td>{item.status}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.status}
                      onChange={(event) => changeStatus(item.id, event.target.value)}
                    >
                      <option value={item.status}>{item.status}</option>
                      {statusOptions
                        .filter((status) => status !== item.status)
                        .map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default JobApplicationsPage;
