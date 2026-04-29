import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import ApiErrorAlert from "../components/ApiErrorAlert";
import { extractApiError } from "../utils/api-error";

const employmentTypeOptions = [
  { value: "PART_TIME", label: "Частичная занятость" },
  { value: "TEMPORARY", label: "Временная работа" },
  { value: "INTERNSHIP", label: "Стажировка" },
  { value: "PROJECT", label: "Проектная занятость" },
];

const workModeOptions = [
  { value: "ONSITE", label: "Офис" },
  { value: "REMOTE", label: "Удаленно" },
  { value: "HYBRID", label: "Гибрид" },
];

function CreateJobPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    employmentType: "PART_TIME",
    workMode: "ONSITE",
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      await http.post("/jobs", form);
      navigate("/employer/jobs");
    } catch (requestError) {
      setError(extractApiError(requestError, "Не удалось создать вакансию."));
    }
  };

  return (
    <main className="container py-4 py-md-5">
      <section className="card shadow-sm border-0 app-card">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h5 mb-0">Создание вакансии</h1>
            <Link to="/employer/jobs" className="btn btn-outline-secondary btn-sm">
              Назад
            </Link>
          </div>

          <ApiErrorAlert error={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <input
              className="form-control"
              name="title"
              maxLength={120}
              placeholder="Название вакансии"
              value={form.title}
              onChange={handleChange}
              required
            />
            <textarea
              className="form-control"
              name="description"
              placeholder="Описание"
              value={form.description}
              onChange={handleChange}
              rows={5}
              maxLength={1200}
              required
            />
            <input
              className="form-control"
              name="location"
              placeholder="Локация"
              value={form.location}
              onChange={handleChange}
            />
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <select
                  className="form-select"
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                >
                  {employmentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <select className="form-select" name="workMode" value={form.workMode} onChange={handleChange}>
                  {workModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">
              Сохранить
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default CreateJobPage;
