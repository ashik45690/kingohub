import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

import TakeExam from "./components/Exam/TakeExam";
import ExamResults from "./components/Exam/ExamResults";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path="/" element={<Home/>}></Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
        <Route path="/kingohub/Dashboard" element={<Dashboard/>}></Route>
        <Route path="/exam" element={<TakeExam/>}></Route>
        <Route path="/kingohub/exam" element={<TakeExam/>}></Route>
        <Route path="/examresult" element={<ExamResults/>}></Route>
        <Route path="/kingohub/examresult" element={<ExamResults/>}></Route>
      </Route>

     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
