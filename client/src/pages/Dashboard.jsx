
import { IoLogOutOutline } from "react-icons/io5";
import { FaBars, FaTimes, FaHome, FaBook, FaClipboardList } from "react-icons/fa";
import MyExams from "../components/Dashboard/MyExams";
import { useState } from "react";
import EnrolledExams from "../components/Dashboard/EnrolledExams";
import CreateExam from "../components/Exam/CreateExam";
import ExamDetails from "../components/Exam/ExamDetails";



export default function Dashboard() {

    const [Pagerendering,setPageRendering] = useState ('Dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleNavigation = (page) => {
        setPageRendering(page);
        closeSidebar();
    };

    return (
        <div className="flex bg-gray-50">
    
            {/* Mobile Hamburger Menu Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
            >
                {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-transparent bg-opacity-50 z-30"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:relative z-40
                w-64 
                bg-white
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:flex md:w-64 lg:flex-col
            `}>
                
                <div className="flex flex-col flex-grow pt-5 overflow-y-auto min-h-screen bg-white">
                    
                    <div className="flex items-center flex-shrink-0 px-4 w-auto">
                        <h1 className="font-[bingo] font-bold text-2xl ">Kingohub</h1>
                    </div>

                <div className="px-4 mt-8">
                <label htmlFor="" className="sr-only">Search</label>
                <div className="relative">
                     <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input type="search" name="" id="" className="block w-full py-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm" placeholder="Search here" />
                </div>
                </div>

                <div className="px-4 mt-6">
                    <hr className="border-gray-200" />
                </div>




                <div className="flex flex-col flex-1 px-3 mt-6">
                    <div>
                        <nav className="flex-1 space-y-4">
                             <a 
                                href="#" 
                                title="" 
                                onClick={() => handleNavigation('Dashboard')}
                                className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
                                    Pagerendering === 'Dashboard' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <FaHome className="flex-shrink-0 w-5 h-5 mr-4" />
                                Dashboard
                            </a>


                            <a 
                                onClick={() => handleNavigation('Enrolled Exams')}  
                                title="" 
                                className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
                                    Pagerendering === 'Enrolled Exams' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <FaClipboardList className="flex-shrink-0 w-5 h-5 mr-4" />
                                Enrolled Exams
                            </a>

                            <a 
                                onClick={() => handleNavigation('My Exams')}  
                                title="" 
                                className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
                                    Pagerendering === 'My Exams' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <FaBook className="flex-shrink-0 w-5 h-5 mr-4" />
                                My Exams
                            </a>
                        </nav>
                    </div>
                </div>

                


               <div className="px-4 mt-6">
                 <div className="flex mb-6 py-2.5 px-2 text-white rounded-lg items-center justify-center bg-gray-600/10 space-x-4 group">
                   <a href="#" className="text-black font-medium">
                    Logout
                   </a>
                   <span>
                    <IoLogOutOutline className="text-red-500 text-lg font-bold"/>
                   </span>
                </div>
               </div>


                </div>

            
            </div>
            {/* Page Rendering Part */}
            
           
{
  (() => {
    switch (Pagerendering) {
      case "Dashboard":
        return <h1 className="font-bold text-8xl m-28">Welcome Dashboard</h1>;

      case "Enrolled Exams":
        return <EnrolledExams  render ={setPageRendering}/>;

      case "My Exams":
        return <MyExams render={setPageRendering} />;
       
       case "CreateExam" :

       return <CreateExam/>

       case "view":

       return <ExamDetails/>


      default:
        return null;
    }
  })()
}

           
          
        </div>

        
    )
}