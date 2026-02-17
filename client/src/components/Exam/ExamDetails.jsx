import { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaKey, 
  FaPlay, 
  FaCheckCircle, 
  FaLock, 
  FaHourglassHalf,
  FaExclamationTriangle,
  FaArrowLeft,
  FaChartLine
} from 'react-icons/fa';


// Mock exam data (in real app, fetch from API)
const mockExam = {
  id: 1,
  title: 'Mathematics Quiz - Chapter 1',
  accessCode: 'MATH2024',
  status: 'ongoing',
  schedule: '2024-01-20T09:00:00',
  endTime: '2024-01-20T17:00:00',
  timeLimit: 60, // minutes
  description: 'Complete the math quiz covering algebra and geometry. This exam contains 50 multiple choice questions covering all topics from Chapter 1.',
  instructions: '• You must complete the exam within the time limit\n• Each question carries 2 marks\n• No negative marking\n• Do not refresh the page during the exam',
  passingScore: 50,
};

export default function ExamDetails() {
  const [exam] = useState(mockExam);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [eligibility, setEligibility] = useState({
    canTake: false,
    reason: '',
    status: 'unknown'
  });


  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Check eligibility when exam or currentTime changes
  useEffect(() => {
    checkEligibility();
  }, [exam, currentTime]);

  const checkEligibility = () => {
    const now = new Date();
    const startTime = new Date(exam.schedule);
    const endTime = new Date(exam.endTime);

    // Exam is completed
    if (exam.status === 'completed') {
      setEligibility({
        canTake: false,
        reason: 'You have already completed this exam.',
        status: 'completed'
      });
      return;
    }

    // Exam is upcoming
    if (exam.status === 'upcoming' || now < startTime) {
      const timeUntilStart = startTime - now;
      const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
      const minutesUntilStart = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
      
      setEligibility({
        canTake: false,
        reason: `Exam starts in ${hoursUntilStart}h ${minutesUntilStart}m`,
        status: 'upcoming'
      });
      return;
    }

    // Exam has ended
    if (now > endTime) {
      setEligibility({
        canTake: false,
        reason: 'The exam window has closed. You can no longer take this exam.',
        status: 'expired'
      });
      return;
    }

    // Exam is ongoing and within time window
    if (exam.status === 'ongoing' || (now >= startTime && now <= endTime)) {
      const timeRemaining = endTime - now;
      const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
      
      setEligibility({
        canTake: true,
        reason: `${minutesRemaining} minutes remaining`,
        status: 'ongoing'
      });
      return;
    }

    // Default: not eligible
    setEligibility({
      canTake: false,
      reason: 'You are not eligible to take this exam.',
      status: 'ineligible'
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format time limit
  const formatTimeLimit = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} hour ${mins} minutes` : `${hours} hour`;
    }
    return `${minutes} minutes`;
  };

  // Get status badge
  const getStatusBadge = () => {
    const statusConfig = {
      ongoing: { color: 'bg-blue-100 text-blue-800', label: 'Ongoing', icon: FaHourglassHalf },
      upcoming: { color: 'bg-yellow-100 text-yellow-800', label: 'Upcoming', icon: FaClock },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: FaCheckCircle },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expired', icon: FaLock },
    };

    const config = statusConfig[eligibility.status] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </span>
    );
  };

  // Handle start exam
  const handleStartExam = () => {
    if (eligibility.canTake) {
      console.log('Starting exam:', exam.id);
      // Navigate to exam taking page
      alert(`Starting exam: ${exam.title}`);
    }
  };

  // Handle go back
  const handleGoBack = () => {
    console.log('Go back');
    // Navigate back

  };

  return (
    <div className="p-6 flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back to Exams
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Exam Details & Information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Exam Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Exam Status</h2>
              {getStatusBadge()}
            </div>
            
            {eligibility.canTake ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaCheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">You are eligible to take this exam</p>
                    <p className="text-sm text-green-600">{eligibility.reason}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`border rounded-lg p-4 ${
                eligibility.status === 'completed' ? 'bg-gray-50 border-gray-200' :
                eligibility.status === 'expired' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center">
                  {eligibility.status === 'completed' ? (
                    <FaCheckCircle className="w-5 h-5 text-gray-600 mr-3" />
                  ) : eligibility.status === 'expired' ? (
                    <FaLock className="w-5 h-5 text-red-600 mr-3" />
                  ) : (
                    <FaHourglassHalf className="w-5 h-5 text-yellow-600 mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{eligibility.reason}</p>
                    {eligibility.status === 'upcoming' && (
                      <p className="text-sm text-gray-600">
                        Available from: {formatDate(exam.schedule)} at {formatTime(exam.schedule)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exam Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <FaKey className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Access Code</p>
                  <p className="font-medium text-gray-900">{exam.accessCode}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCalendarAlt className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Schedule</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(exam.schedule)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(exam.schedule)} - {formatTime(exam.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaClock className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time Limit</p>
                  <p className="font-medium text-gray-900">{formatTimeLimit(exam.timeLimit)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Description</p>
              <p className="text-gray-700">{exam.description}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
            <ul className="space-y-2">
              {exam.instructions.split('\n').map((instruction, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {instruction.replace('• ', '')}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar - Action Card */}
        <div className="space-y-6">
          {/* Start Exam Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Access</h2>
            
            {eligibility.canTake ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <FaHourglassHalf className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-blue-800">{eligibility.reason}</p>
                </div>
                
                <button
                  onClick={handleStartExam}
                  className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <FaPlay className="w-5 h-5 mr-2" />
                  Start Exam
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Make sure you have a stable internet connection before starting.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-lg p-4 text-center ${
                  eligibility.status === 'completed' ? 'bg-gray-100' :
                  eligibility.status === 'expired' ? 'bg-red-100' :
                  'bg-yellow-100'
                }`}>
                  {eligibility.status === 'completed' ? (
                    <>
                      <FaCheckCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-800">Exam Completed</p>
                    </>
                  ) : eligibility.status === 'expired' ? (
                    <>
                      <FaLock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="font-medium text-red-800">Exam Expired</p>
                    </>
                  ) : (
                    <>
                      <FaHourglassHalf className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="font-medium text-yellow-800">Not Yet Available</p>
                    </>
                  )}
                </div>
                
                <button
                  disabled
                  className="w-full flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                >
                  <FaLock className="w-5 h-5 mr-2" />
                  Start Exam
                </button>
              </div>
            )}
          </div>

          {/* Score Card (for completed exams) */}
          {exam.status === 'completed' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Score</h2>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <svg className="w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={exam.score >= exam.passingScore ? '#10b981' : '#ef4444'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(exam.score / 100) * 352} 352`}
                      strokeLinecap="round"
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{exam.score}%</span>
                  </div>
                </div>
                
                <p className={`mt-4 font-medium ${
                  exam.score >= exam.passingScore ? 'text-green-600' : 'text-red-600'
                }`}>
                  {exam.score >= exam.passingScore ? 'Passed!' : 'Not Passed'}
                </p>
                <p className="text-sm text-gray-500">
                  Passing score: {exam.passingScore}%
                </p>
                
                <button className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <FaChartLine className="w-4 h-4 mr-2" />
                  View Detailed Results
                </button>
              </div>
            </div>
          )}

          {/* Access Restrictions Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Access code is required to start the exam
                </p>
              </div>
              <div className="flex items-start">
                <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Once started, the timer cannot be paused
                </p>
              </div>
              <div className="flex items-start">
                <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Ensure stable internet throughout the exam
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
