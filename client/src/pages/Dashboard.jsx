import { IoLogOutOutline } from "react-icons/io5";
import { FaHome, FaBook, FaClipboardList, FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, user } = useAuth();
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

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate("/");
  }

  // Prevent body scroll while the drawer is open (mobile/tablet)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Close the drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (

    <div className="flex min-h-screen bg-gray-50">

      {/* Mobile & Tablet Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — drawer on mobile/tablet, fixed on desktop */}
      <div
        className={`
        fixed lg:sticky lg:top-0 lg:self-start z-40
        w-64 bg-white min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        overflow-y-auto
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
          <div className="flex flex-col px-3 mt-6 space-y-4 flex-grow pb-6">

            <button
              onClick={() => handleNavigation("Dashboard")}
              className={`flex items-center px-4 py-2.5 rounded-lg ${
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
              className={`flex items-center px-4 py-2.5 rounded-lg ${
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
              className={`flex items-center px-4 py-2.5 rounded-lg ${
                Pagerendering === "My Exams"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <FaBook className="mr-3"/>
              My Exams
            </button>

          </div>

          {/* User Profile — pushed to the bottom with breathing room */}
          <div className="px-4 pt-6 mt-auto border-t border-gray-100">
            <div className="flex items-center space-x-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 transition-all hover:bg-indigo-50">
               <div className="relative">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shadow-sm" 
                    />
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-indigo-400" style={{fontSize: '2.5rem'}}/>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
               </div>
               <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-gray-800 truncate text-sm">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] font-medium text-green-600 flex items-center tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    Online
                  </span>
               </div>
            </div>
          </div>

          {/* Logout — breathing space below profile card */}
          <div className="px-4 pt-4 pb-8">
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="w-full flex items-center justify-center space-x-2 bg-gray-50 border border-gray-200 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all group"
            >
              <span className="font-medium">Logout</span>
              <IoLogOutOutline className="text-gray-400 group-hover:text-red-500 text-xl transition-colors"/>
            </button>
          </div>

        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">

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

{/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto flex flex-col items-center text-center border border-gray-100 animate-scale-in">
            {/* Icon */}
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <IoLogOutOutline className="text-red-500 text-2xl" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">Logout</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to logout?</p>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  )
}
