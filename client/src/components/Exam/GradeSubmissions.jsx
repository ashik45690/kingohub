import { useState, useEffect } from 'react';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import submissionService from '../../services/submissionService';

export default function GradeSubmissions({ examId, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingData, setGradingData] = useState([]); // [{ questionId, marks }]

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await submissionService.getExamSubmissions(examId);
        setSubmissions(data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [examId]);

  const handleSelectSubmission = (sub) => {
    setSelectedSubmission(sub);
    // Initialize grading data for descriptive questions
    const initialGrading = sub.answers
      .filter(a => a.descriptiveAnswer !== undefined && a.descriptiveAnswer !== null)
      .map(a => ({
        questionId: a.questionId._id || a.questionId,
        marks: a.marksAwarded || 0
      }));
    setGradingData(initialGrading);
  };

  const handleMarkChange = (questionId, marks) => {
    setGradingData(prev => prev.map(item => 
      item.questionId === questionId ? { ...item, marks: parseInt(marks) || 0 } : item
    ));
  };

  const submitGrades = async () => {
    try {
      await submissionService.gradeSubmission(selectedSubmission._id, {
        questionGrades: gradingData
      });
      alert('Grades submitted successfully!');
      // Refresh submissions
      const data = await submissionService.getExamSubmissions(examId);
      setSubmissions(data);
      setSelectedSubmission(null);
    } catch (err) {
      console.error('Grading error:', err);
      alert('Failed to submit grades');
    }
  };

  if (loading) return <div className="p-8 text-center text-premium">Loading submissions...</div>;

  if (selectedSubmission) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <button 
          onClick={() => setSelectedSubmission(null)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Submissions
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Grading: {selectedSubmission.userId?.name || 'Candidate'}
        </h2>

        <div className="space-y-8">
          {selectedSubmission.answers.map((answer, index) => {
            const isDescriptive = answer.descriptiveAnswer !== undefined && answer.descriptiveAnswer !== null;
            if (!isDescriptive) return null;

            return (
              <div key={index} className="border-l-4 border-indigo-500 pl-6 py-2 bg-gray-50 rounded-r-lg">
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Question {index + 1}</p>
                <p className="text-lg text-gray-900 font-medium mb-4">{answer.questionId?.questionText}</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 whitespace-pre-wrap text-gray-700">
                  <p className="text-xs text-gray-400 mb-2 font-bold uppercase">Candidate's Answer:</p>
                  {answer.descriptiveAnswer}
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold text-gray-700">Marks Awarded:</label>
                  <input 
                    type="number"
                    min="0"
                    max={answer.questionId?.points || 10}
                    value={gradingData.find(g => g.questionId === (answer.questionId?._id || answer.questionId))?.marks || 0}
                    onChange={(e) => handleMarkChange(answer.questionId?._id || answer.questionId, e.target.value)}
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-gray-500 text-sm">out of {answer.questionId?.points || 10}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={submitGrades}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
          >
            Submit Grades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg text-premium">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Exam Submissions</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium">Back to Exams</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{sub.userId?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{sub.userId?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-600">
                  {sub.isGraded ? `${sub.score}/${sub.totalPoints}` : 'Pending Grading'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sub.isGraded ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" /> Graded
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                      <FaGraduationCap className="mr-1" /> Needs Grading
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleSelectSubmission(sub)}
                    className="text-indigo-600 hover:text-indigo-900 font-bold text-sm"
                  >
                    Grade Now
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
