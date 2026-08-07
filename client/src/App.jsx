import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exam" element={<TakeExam />} />
          <Route path="/examresult" element={<ExamResults />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;