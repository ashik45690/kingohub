import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlay, FaClock, FaCalendarAlt, FaKey, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import examService from '../../services/examService';

export default function EnrolledExams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState('');
  const [joiningCode, setJoiningCode] = useState('');

  const fetchExams = useCallback(async () => {
  try {
    setLoading(true);
    const res = await examService.getEnrolledExams();
    setExams(Array.isArray(res) ? res : []);
  } catch (err) {
    console.error('Failed to fetch enrolled exams', err);
    setExams([]);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Only try joining by access code when user explicitly submits (Enter key)
  const handleCodeJoin = useCallback(async (code) => {
    if (!code || code.length < 4) return;
    setJoinError('');
    setJoiningCode(code);
    try {
      const res = await examService.getExamByCode(code.toUpperCase());
      const exam = res;
      if (!exam?._id) return;
      await examService.joinExam(exam._id);
      setExams((prev) => {
        const exists = prev.some((e) => e._id === exam._id);
        return exists ? prev : [exam, ...prev];
      });
      setSearchTerm('');
    } catch (err) {
      setJoinError('Invalid access code or not authorized.');
    } finally {
      setJoiningCode('');
    }
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCodeJoin(searchTerm.trim());
    }
  };

  // Filter exams based on search term (title only during typing)
  const filteredExams = exams.filter(
    (exam) =>
      exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.accessCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleTakeExam = async (exam) => {
    if (exam.status !== 'ongoing' && exam.status !== 'upcoming') {
      setJoinError('This exam is not currently active.');
      return;
    }
    try {
      // Logic for joining/moving to exam page
      navigate(`/kingohub/exam?examId=${exam._id}`);
    } catch (err) {
      console.error('Failed to join exam', err);
    }
  };

  const handleViewResults = (examId) => {
    navigate(`/kingohub/examresult?examId=${examId}`);
  };

  const formatTimeLimit = (minutes) => {
    if (!minutes) return '-';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return '-';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrolled Exams</h1>
          <p className="text-sm text-gray-500 mt-1">View and take your enrolled exams</p>
        </div>
      </div>

      {/* Search / Join by Code */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {joiningCode ? (
              <FaSpinner className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : (
              <FaSearch className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search by title, or press Enter with an access code to join..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setJoinError('');
            }}
            onKeyDown={handleSearchKeyDown}
            className="block w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
          />
        </div>
        {joinError && (
          <p className="mt-2 text-sm text-red-600">{joinError}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Tip: Type an access code and press <kbd className="px-1 py-0.5 border border-gray-300 rounded text-xs">Enter</kbd> to join a new exam.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <FaSpinner className="w-8 h-8 text-indigo-400 animate-spin" />
                      <p className="text-sm">Loading your exams...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{exam.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaKey className="w-3 h-3 mr-2 text-gray-400" />
                        {exam.accessCode ?? '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(exam.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="w-3 h-3 mr-2 text-gray-400" />
                        {formatSchedule(exam.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaClock className="w-3 h-3 mr-2 text-gray-400" />
                        {formatTimeLimit(exam.timeLimitMinutes)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exam.score !== undefined && exam.score !== null ? `${exam.score}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {exam.status !== 'completed' && (
                          <button
                            onClick={() => handleTakeExam(exam)}
                            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                          >
                            <FaPlay className="w-3 h-3 mr-1.5" />
                            Take Exam
                          </button>
                        )}
                        {exam.status === 'completed' && (
                          <button
                            onClick={() => handleViewResults(exam._id)}
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
                      <p className="text-sm">Try adjusting your search, or join using an access code</p>
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
