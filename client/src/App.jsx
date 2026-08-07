import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TakeExam from "./components/Exam/TakeExam";
import ExamResults from "./components/Exam/ExamResults";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route element={<ProtectedRoute />}>
          {/* Canonical routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exam" element={<TakeExam />} />
          <Route path="/examresult" element={<ExamResults />} />

          {/* Legacy /kingohub/* aliases so old links keep working */}
          <Route path="/kingohub/dashboard" element={<Dashboard />} />
          <Route path="/kingohub/exam" element={<TakeExam />} />
          <Route path="/kingohub/examresult" element={<ExamResults />} />
        </Route>

        {/* Catch-all: unknown paths redirect to home instead of a blank error */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

