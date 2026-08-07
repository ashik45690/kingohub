import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TakeExam from "./components/Exam/TakeExam";
import ExamResults from "./components/Exam/ExamResults";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Top progress bar shown briefly on every navigation (spinner during page navigation)
function NavigationLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-1 pointer-events-none">
      <div
        className={`h-full bg-indigo-600 transition-all duration-500 ease-out ${
          visible ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
        style={{ width: visible ? "100%" : "0%" }}
      />
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <NavigationLoader />
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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

