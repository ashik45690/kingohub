import { useState } from 'react';
import { FaUserCheck, FaEnvelope, FaSpinner, FaShieldAlt } from 'react-icons/fa';
import examService from '../../services/examService';
import { useAuth } from '../../context/AuthContext';

/**
 * RegistrationForm — private exam join confirmation.
 * Students are already authenticated. No form fields are needed.
 * The backend auto-registers using the session profile.
 */
export default function RegistrationForm({ examId, onRegistrationSuccess, examTitle }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await examService.registerForExam(examId, {});
      onRegistrationSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 sm:p-8 max-w-2xl my-8 mx-4 sm:mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mx-auto mb-4">
          <FaShieldAlt className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">Exam Registration</h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          You are registering for:{' '}
          <span className="font-semibold text-indigo-600">{examTitle}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg break-words">
          {error}
        </div>
      )}

      {/* Read-only student identity from session */}
      <div className="bg-gray-50 rounded-lg p-5 sm:p-6 mb-6 space-y-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Your registered identity
        </p>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FaUserCheck className="text-indigo-600 w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Full Name</p>
            <p className="text-sm font-semibold text-gray-800 break-words">{user?.name || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FaEnvelope className="text-indigo-600 w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Email Address</p>
            <p className="text-sm font-semibold text-gray-800 break-words">{user?.email || '—'}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleConfirm}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <div className="flex items-center">
            <FaSpinner className="animate-spin mr-2" />
            <span>Registering...</span>
          </div>
        ) : (
          'Confirm & Join Exam'
        )}
      </button>

      <p className="text-xs text-center text-gray-400 mt-4">
        Your identity is taken from your logged-in Google account.
      </p>
    </div>
  );
}
