import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import ApiErrorAlert from "../components/ApiErrorAlert";
import { extractApiError } from "../utils/api-error";

function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "employer",
    organization: "",
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await http.post("/auth/register", form);
      }

      const { data } = await http.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/employer/jobs");
    } catch (requestError) {
      setError(extractApiError(requestError, "Не удалось выполнить вход."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-4 py-md-5">
      <section className="card shadow-sm border-0 app-card">
        <div className="card-body p-4 p-md-5">
          <h1 className="h4 mb-3">{isRegister ? "Регистрация" : "Вход"}</h1>
          <p className="text-secondary mb-4">
            Войдите как работодатель, чтобы создавать вакансии и работать с откликами.
          </p>

          <ApiErrorAlert error={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            {isRegister && (
              <>
                <input
                  className="form-control"
                  name="fullName"
                  placeholder="ФИО"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <input
                  className="form-control"
                  name="organization"
                  placeholder="Организация"
                  value={form.organization}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Пароль"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Подождите..." : isRegister ? "Зарегистрироваться и войти" : "Войти"}
            </button>
          </form>

          <button
            className="btn btn-link px-0 mt-3"
            type="button"
            onClick={() => setIsRegister((prev) => !prev)}
          >
            {isRegister ? "У меня уже есть аккаунт" : "У меня нет аккаунта"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
