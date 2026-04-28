import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";

function CreateJobPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
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
    setError("");

    try {
      await http.post("/jobs", form);
      navigate("/employer/jobs");
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.userMessage || "Не удалось создать вакансию.");
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

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <input
              className="form-control"
              name="title"
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
              rows={4}
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
                  <option value="PART_TIME">PART_TIME</option>
                  <option value="TEMPORARY">TEMPORARY</option>
                  <option value="INTERNSHIP">INTERNSHIP</option>
                  <option value="PROJECT">PROJECT</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <select className="form-select" name="workMode" value={form.workMode} onChange={handleChange}>
                  <option value="ONSITE">ONSITE</option>
                  <option value="REMOTE">REMOTE</option>
                  <option value="HYBRID">HYBRID</option>
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
