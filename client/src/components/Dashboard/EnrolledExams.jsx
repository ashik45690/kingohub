import { useState } from 'react';
import { FaSearch, FaPlay,  FaClock, FaCalendarAlt, FaKey } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Mock data for enrolled exams
const mockEnrolledExams = [
  {
    id: 1,
    title: 'Mathematics Quiz - Chapter 1',
    accessCode: 'MATH2024',
    status: 'ongoing',
    schedule: '2024-01-20 09:00',
    timeLimit: 60, // minutes
    description: 'Complete the math quiz covering algebra and geometry',
  },
  {
    id: 2,
    title: 'Physics Mid-term Exam',
    accessCode: 'PHY2024',
    status: 'upcoming',
    schedule: '2024-01-25 14:00',
    timeLimit: 90, // minutes
    description: 'Physics mid-term covering mechanics and thermodynamics',
  },
  {
    id: 3,
    title: 'Chemistry Laboratory Test',
    accessCode: 'CHEM2024',
    status: 'completed',
    schedule: '2024-01-15 10:00',
    timeLimit: 45, // minutes
    description: 'Chemistry lab practical exam',
    score: 85,
  },
  {
    id: 4,
    title: 'Biology Final Exam',
    accessCode: 'BIO2024',
    status: 'upcoming',
    schedule: '2024-01-30 09:00',
    timeLimit: 120, // minutes
    description: 'Biology final exam covering all chapters',
  },
  {
    id: 5,
    title: 'English Composition',
    accessCode: 'ENG2024',
    status: 'completed',
    schedule: '2024-01-10 11:00',
    timeLimit: 60, // minutes
    description: 'English essay writing exam',
    score: 78,
  },
];

export default function EnrolledExams({render}) {

  const navigate = useNavigate();

  const [exams] = useState(mockEnrolledExams);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter exams based on search term (access code or title)
  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get status badge color
  const getStatusBadge = (status) => {
    if (status === 'ongoing') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Ongoing
        </span>
      );
    }
    if (status === 'upcoming') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Upcoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completed
      </span>
    );
  };

  // Handle action button clicks
  const handleTakeExam = (examId) => {
    console.log('Take exam:', examId);
    // Add your take exam logic here
  };

  const handleViewResults = (examId) => {
    console.log('View results:', examId);
    // Add your view results logic here
  };

  // Format time limit
  const formatTimeLimit = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Format schedule date
  const formatSchedule = (schedule) => {
    const date = new Date(schedule);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 flex-1">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrolled Exams</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and take your enrolled exams
          </p>
        </div>
      </div>

      {/* Search Bar for Access Code */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by exam title or access code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
          />
        </div>
      </div>

      {/* Enrolled Exams Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {exam.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {exam.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaKey className="w-3 h-3 mr-2 text-gray-400" />
                        {exam.accessCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(exam.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="w-3 h-3 mr-2 text-gray-400" />
                        {formatSchedule(exam.schedule)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaClock className="w-3 h-3 mr-2 text-gray-400" />
                        {formatTimeLimit(exam.timeLimit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exam.score !== undefined ? `${exam.score}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {/* Take Exam Button - For upcoming/ongoing exams */}
                        {exam.status !== 'completed' && (
                          <button
                            onClick={() => handleTakeExam(exam.id)}
                            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                          >
                            <FaPlay className="w-3 h-3 mr-1.5" onClick={()=>navigate('/kingohub/exam')} />
                            Take Exam
                          </button>
                        )}

                        {/* View Results Button - For completed exams */}
                        {exam.status === 'completed' && (
                          <button
                            onClick={() => handleViewResults(exam.id)}
                            className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                           
                            View Results
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaSearch className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No exams found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Enrolled</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{exams.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Ongoing</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {exams.filter((e) => e.status === 'ongoing').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Upcoming</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {exams.filter((e) => e.status === 'upcoming').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {exams.filter((e) => e.status === 'completed').length}
          </div>
        </div>
      </div>
    </div>
  );
}
