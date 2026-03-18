import { IoLogOutOutline } from "react-icons/io5";
import { FaHome, FaBook, FaClipboardList } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import MyExams from "../components/Dashboard/MyExams";
import EnrolledExams from "../components/Dashboard/EnrolledExams";
import CreateExam from "../components/Exam/CreateExam";
import ExamDetails from "../components/Exam/ExamDetails";
import ExamAnalytics from "../components/Analytics/ExamAnalytics";
import Navbar from "../components/common/Navbar";

export default function Dashboard() {

  const [Pagerendering,setPageRendering] = useState('Dashboard')
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleNavigation = (page) => {
    setPageRendering(page)
    closeSidebar()
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  }

  return (

    <div className="flex min-h-screen bg-gray-50">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative z-40
        w-64 bg-white h-screen
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        `}
      >

        <div className="flex flex-col h-full pt-6">

          {/* Logo */}
          <div className="px-4 font-[bingo] text-2xl font-bold">
            Kingohub
          </div>

          <div className="px-4 mt-6">
            <hr />
          </div>

          {/* Navigation */}
          <div className="flex flex-col px-3 mt-6 space-y-3 flex-grow">

            <button
              onClick={() => handleNavigation("Dashboard")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                Pagerendering === "Dashboard"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <FaHome className="mr-3"/>
              Dashboard
            </button>

            <button
              onClick={() => handleNavigation("Enrolled Exams")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                Pagerendering === "Enrolled Exams"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <FaClipboardList className="mr-3"/>
              Enrolled Exams
            </button>

            <button
              onClick={() => handleNavigation("My Exams")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                Pagerendering === "My Exams"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <FaBook className="mr-3"/>
              My Exams
            </button>

          </div>

          {/* Logout */}
          <div className="px-4 pb-6">
            <div onClick={handleLogout} className="flex items-center justify-center space-x-2 bg-gray-100 py-2 rounded-lg">
              <span>Logout</span>
              <IoLogOutOutline className="text-red-500"/>
            </div>
          </div>

        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1">

        {/* Mobile Navbar */}
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        <div className="p-4 md:p-6">

          {(() => {
            switch (Pagerendering) {

              case "Dashboard":
                return <ExamAnalytics/>

              case "Enrolled Exams":
                return <EnrolledExams render={setPageRendering}/>

              case "My Exams":
                return <MyExams render={setPageRendering}/>

              case "CreateExam":
                return <CreateExam render={setPageRendering}/>

              case "view":
                return <ExamDetails/>

              default:
                return null

            }
          })()}

        </div>

      </div>

    </div>

  )
}
