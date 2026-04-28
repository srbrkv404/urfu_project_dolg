import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="container py-5">
      <section className="card border-0 shadow-sm app-card">
        <div className="card-body p-4">
          <h1 className="h4">Страница не найдена</h1>
          <p className="text-secondary">Проверьте адрес или вернитесь на главную.</p>
          <Link className="btn btn-primary btn-sm" to="/">
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
