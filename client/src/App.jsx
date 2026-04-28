import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import RequireAuth from "./components/RequireAuth";
import CreateJobPage from "./pages/CreateJobPage";
import EmployerJobsPage from "./pages/EmployerJobsPage";
import JobApplicationsPage from "./pages/JobApplicationsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/employer/jobs"
          element={(
            <RequireAuth role="employer">
              <EmployerJobsPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/employer/jobs/new"
          element={(
            <RequireAuth role="employer">
              <CreateJobPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/employer/jobs/:jobId/applications"
          element={(
            <RequireAuth role="employer">
              <JobApplicationsPage />
            </RequireAuth>
          )}
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
