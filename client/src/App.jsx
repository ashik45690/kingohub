import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { useNavigate } from "react-router-dom";
import TakeExam from "./components/Exam/TakeExam";
import ExamResults from "./components/Exam/ExamResults";
import ExamAnalytics from "./components/Analytics/ExamAnalytics";

function App() {
  

  return (
    <>
      
     <BrowserRouter>
     <Routes>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/kingohub/Dashboard" element={<Dashboard/>}></Route>
      <Route path="/kingohub/exam" element={<TakeExam/>}></Route>
      <Route path="/kingohub/examresult" element={<ExamResults/>}></Route>
     
     </Routes>
     </BrowserRouter>
      
    </>
  )
}

export default App
