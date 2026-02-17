import { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaArrowLeft,
  FaTrophy,
  FaRedo,
  FaHome,
  FaChartLine
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Mock result data (in real app, this would come from API or navigation state)
const mockResult = {
  examId: 1,
  examTitle: 'Mathematics Quiz - Chapter 1',
  totalQuestions: 50,
  correctAnswers: 38,
  wrongAnswers: 12,
  skippedQuestions: 0,
  totalPoints: 100,
  earnedPoints: 76,
  percentage: 76,
  passingScore: 50,
  passed: true,
  timeTaken: 2340, // in seconds (39 minutes)
  timeLimit: 60, // in minutes
  completedAt: '2024-01-20T14:30:00',
};

export default function ExamResults() {

 const navigate = useNavigate()

  const [result] = useState(mockResult);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  // Calculate percentage
  const calculatePercentage = () => {
    if (result.totalPoints === 0) return 0;
    return Math.round((result.earnedPoints / result.totalPoints) * 100);
  };

  // Format time taken
  const formatTimeTaken = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Get message based on performance
  const getPerformanceMessage = () => {
    const percentage = result.percentage;
    
    if (percentage >= 90) {
      return {
        title: 'Outstanding! 🎉',
        message: 'You have mastered this material! Your exceptional performance demonstrates a thorough understanding of the content.',
        type: 'excellent'
      };
    } else if (percentage >= 75) {
      return {
        title: 'Great Job! 🌟',
        message: 'You have done excellently! Your strong performance shows a solid grasp of the material.',
        type: 'good'
      };
    } else if (percentage >= result.passingScore) {
      return {
        title: 'Congratulations! ✅',
        message: 'You have passed the exam. Keep up the good work and continue learning!',
        type: 'pass'
      };
    } else if (percentage >= result.passingScore - 10) {
      return {
        title: 'Almost There! 💪',
        message: 'You were very close to passing. Review the topics you missed and try again!',
        type: 'near_miss'
      };
    } else {
      return {
        title: 'Keep Trying! 📚',
        message: "Don't give up! Review the material carefully and you'll do better next time.",
        type: 'fail'
      };
    }
  };

  // Get performance color
  const getPerformanceColor = () => {
    const performance = getPerformanceMessage();
    switch (performance.type) {
      case 'excellent':
        return 'text-yellow-500';
      case 'good':
        return 'text-green-500';
      case 'pass':
        return 'text-green-600';
      case 'near_miss':
        return 'text-orange-500';
      case 'fail':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get progress bar color
  const getProgressBarColor = () => {
    const percentage = result.percentage;
    if (percentage >= 90) return 'bg-yellow-400';
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= result.passingScore) return 'bg-green-400';
    return 'bg-red-500';
  };

  const performance = getPerformanceMessage();

  // Handle go back
  const handleGoBack = () => {
    console.log('Go back to exams');
    // Navigate back

    navigate('/kingohub/Dashboard')
  };

  // Handle retake exam
  const handleRetake = () => {
    console.log('Retake exam:', result.examId);
    // Navigate to retake exam
  };

  // Handle go home
  const handleGoHome = () => {
    console.log('Go home');
    // Navigate to home
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
        <h1 className="text-2xl font-bold text-gray-900">{result.examTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Exam Results
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Result Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Performance Message */}
          <div className={`text-center mb-8 ${isAnimating ? 'animate-fade-in' : ''}`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              result.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.passed ? (
                <FaTrophy className={`w-10 h-10 ${getPerformanceColor()}`} />
              ) : (
                <FaChartLine className={`w-10 h-10 ${getPerformanceColor()}`} />
              )}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${getPerformanceColor()}`}>
              {performance.title}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {performance.message}
            </p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={result.passed ? '#10b981' : '#ef4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(result.percentage / 100) * 553} 553`}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-out ${isAnimating ? 'stroke-draw' : ''}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.percentage}%
                </span>
                <span className="text-sm text-gray-500 mt-1">Score</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Total Score */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {result.earnedPoints}/{result.totalPoints}
              </p>
              <p className="text-xs text-gray-500">points</p>
            </div>

            {/* Correct Answers */}
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 mb-1">Correct</p>
              <p className="text-2xl font-bold text-green-600">
                {result.correctAnswers}
              </p>
              <p className="text-xs text-green-500">answers</p>
            </div>

            {/* Wrong Answers */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600 mb-1">Incorrect</p>
              <p className="text-2xl font-bold text-red-600">
                {result.wrongAnswers}
              </p>
              <p className="text-xs text-red-500">answers</p>
            </div>

            {/* Time Taken */}
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600 mb-1">Time Taken</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatTimeTaken(result.timeTaken)}
              </p>
              <p className="text-xs text-blue-500">of {result.timeLimit} min</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Performance</span>
              <span className="text-gray-900 font-medium">
                {result.correctAnswers} of {result.totalQuestions} questions
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressBarColor()} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: isAnimating ? `${result.percentage}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-red-500">Passing: {result.passingScore}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetake}
              className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <FaRedo className="w-5 h-5 mr-2" />
              Retake Exam
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <FaHome className="w-5 h-5 mr-2" />
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Detailed Stats Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <FaCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Correct Answers</span>
              </div>
              <span className="font-medium text-gray-900">{result.correctAnswers}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <FaTimesCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-gray-700">Wrong Answers</span>
              </div>
              <span className="font-medium text-gray-900">{result.wrongAnswers}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <FaClock className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-gray-700">Time Used</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatTimeTaken(result.timeTaken)} / {result.timeLimit} minutes
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <FaChartLine className="w-5 h-5 text-purple-500 mr-3" />
                <span className="text-gray-700">Passing Score</span>
              </div>
              <span className="font-medium text-gray-900">{result.passingScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
