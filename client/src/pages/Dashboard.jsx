
import { IoLogOutOutline } from "react-icons/io5";
import MyExams from "../components/Dashboard/MyExams";
import { useState } from "react";
import EnrolledExams from "../components/Dashboard/EnrolledExams";
import CreateExam from "../components/Exam/CreateExam";
import ExamDetails from "../components/Exam/ExamDetails";
import ExamResults from "../components/Exam/ExamResults";

export default function Dashboard() {

    const [Pagerendering,setPageRendering] = useState ('Dashboard')

    return (
        <div className="flex  bg-gray-50">
    
           
            <div className="hidden md:flex md:w-64 lg:flex-col ">
                
                <div className="flex flex-col flex-grow pt-5 overflow-y-auto min-h-screen bg-white">
                    
                    <div className="flex items-center flex-shrink-0 px-4 w-auto"><h1 className="font-[bingo] font-bold text-2xl ">Kingohub</h1></div>

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




                <div className="flex flex-col flex-1   px-3 mt-6">
                    <div  >
                        <nav className="flex-1 space-y-4">
                             <a href="#" title="" onClick={()=>{setPageRendering('Dashboard')}} class="flex items-center px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-indigo-600 rounded-lg group">
                            <svg className="flex-shrink-0 w-5 h-5 mr-4 text-white" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </a>


                        <a onClick={()=>{setPageRendering('Enrolled Exams')}}  title="" className="flex items-center px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-indigo-600 rounded-lg group">
                            Enrolled Exams
                        </a>

                        <a onClick={()=>{setPageRendering('My Exams')}}  title="" className="bg-indigo-600 text-white px-4 py-2.5 flex items-center text-sm font-medium transition-all duration-200  rounded-lg group ">My exams</a>
                        </nav>
                    </div>
                </div>

                


               <div className=" px-4 mt-6">
                 <div  className="flex  mb-6  py-2.5 px-2 text-white rounded-lg items-center  justify-center bg-gray-600/10 space-x-4  group">
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