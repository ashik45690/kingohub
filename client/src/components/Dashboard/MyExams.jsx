import { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaChartBar, FaPlus, FaSearch } from 'react-icons/fa';
import examService from '../../services/examService';

export default function MyExams({render}) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchMyExams = async () => {
    try {
      const res = await examService.getMyExams();
      setExams(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch my exams', err);
    } finally {
      setLoading(false);
    }
  };

  fetchMyExams();
}, []);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter exams based on search term
  const filteredExams = exams.filter((exam) =>
    exam.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get status badge color
  const getStatusBadge = (status) => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Draft
      </span>
    );
  };

  // Handle action button clicks
  const handleEdit = (examId) => {
    localStorage.setItem('editExamId', examId);
    render('CreateExam');
  };

  const handleView = (examId) => {
    localStorage.setItem('selectedExamId', examId);
    render('view');
  };

  const handleAnalyze = (examId) => {
    localStorage.setItem('selectedExamId', examId);
    render('Dashboard');
  };

  return (
    <div className="p-4 sm:p-6 flex-1 min-w-0 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Exams</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view your created exams
          </p>
        </div>
        <button onClick={() => { localStorage.removeItem('editExamId'); render("CreateExam"); }} className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
          <FaPlus className="w-4 h-4 mr-2" />
          Create New Exam
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
          />
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.length > 0 && !loading ? (
                filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {exam.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(exam.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{exam.studentCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exam.averageScore !== null ? `${exam.averageScore}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{exam.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {/* Edit Button - Only for draft exams */}
                        {exam.status === 'draft' && (
                          <button
                            onClick={() => handleEdit(exam._id)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Button - For all exams */}
                        <button
                          onClick={() => handleView(exam._id)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>

                        {/* Analyze Button - Only for published exams */}
                        {exam.status === 'published' && (
                          <button
                            onClick={() => handleAnalyze(exam._id)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Analyze"
                          >
                            <FaChartBar className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Exams</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{exams.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Published</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {exams.filter((e) => e.status === 'published').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Drafts</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {exams.filter((e) => e.status === 'draft').length}
          </div>
        </div>
      </div>
    </div>
  );
}
