import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import ApiErrorAlert from "../components/ApiErrorAlert";
import { extractApiError } from "../utils/api-error";

const statusLabels = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликована",
  CLOSED: "Закрыта",
};

function EmployerJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await http.get("/jobs/mine");
        setJobs(data);
      } catch (requestError) {
        setError(extractApiError(requestError, "Не удалось загрузить вакансии."));
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <main className="container py-4 py-md-5">
      <section className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
        <h1 className="h4 mb-0">Мои вакансии</h1>
        <div className="d-flex gap-2">
          <Link to="/employer/jobs/new" className="btn btn-primary btn-sm">
            Создать вакансию
          </Link>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout}>
            Выйти
          </button>
        </div>
      </section>

      {loading && <div className="alert alert-info">Загрузка вакансий...</div>}
      <ApiErrorAlert error={error} onClose={() => setError(null)} />

      {!loading && !error && (
        <section className="row g-3">
          {jobs.length === 0 && (
            <div className="alert alert-light border">
              Вакансий пока нет. Нажмите «Создать вакансию», чтобы добавить первую позицию.
            </div>
          )}

          {jobs.map((job) => (
            <article key={job.id} className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h2 className="h6">{job.title}</h2>
                  <p className="text-secondary small mb-2 line-clamp-3">{job.description}</p>
                  <div className="small text-secondary mb-1">Локация: {job.location || "Не указана"}</div>
                  <div className="small mb-3">
                    Статус: <span className="badge text-bg-light">{statusLabels[job.status] || job.status}</span>
                  </div>
                  <Link to={`/employer/jobs/${job.id}/applications`} className="btn btn-outline-primary btn-sm">
                    Отклики
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default EmployerJobsPage;
