import { useState, useEffect, useCallback } from 'react';
import { 
  FaClock, 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck, 
  FaExclamationTriangle,
  FaFlagCheckered,
  FaHome
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

// Mock exam data (in real app, fetch from API)
const mockExam = {
  id: 1,
  title: 'Mathematics Quiz - Chapter 1',
  timeLimit: 60, // minutes
  questions: [
    {
      id: 1,
      questionText: 'What is the value of x in the equation 2x + 5 = 15?',
      options: ['x = 5', 'x = 10', 'x = 7', 'x = 4'],
      correctAnswer: 0,
      points: 2
    },
    {
      id: 2,
      questionText: 'Which of the following is a prime number?',
      options: ['4', '6', '7', '9'],
      correctAnswer: 2,
      points: 2
    },
    {
      id: 3,
      questionText: 'What is the square root of 144?',
      options: ['10', '11', '12', '14'],
      correctAnswer: 2,
      points: 2
    },
    {
      id: 4,
      questionText: 'Simplify: 3(x + 4) - 2(x - 3)',
      options: ['x + 18', 'x + 6', '5x + 6', '5x + 18'],
      correctAnswer: 0,
      points: 3
    },
    {
      id: 5,
      questionText: 'What is the area of a circle with radius 7? (Use π = 22/7)',
      options: ['154', '144', '132', '168'],
      correctAnswer: 0,
      points: 2
    }
  ]
};

export default function TakeExam() {
  const [exam] = useState(mockExam);
  const [timeRemaining, setTimeRemaining] = useState(exam.timeLimit * 60); // in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const navigate = useNavigate()

  // Shuffle questions on mount
  useEffect(() => {
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    setShuffledQuestions(shuffleArray(exam.questions));
  }, [exam.questions]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  // Show warning at 5 minutes
  useEffect(() => {
    if (timeRemaining === 300 && !isSubmitted) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    }
  }, [timeRemaining, isSubmitted]);

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current question
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  // Handle navigation
  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    shuffledQuestions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passingScore = 50;
    const passed = percentage >= passingScore;

    // Store results
    const results = {
      examId: exam.id,
      examTitle: exam.title,
      totalQuestions: shuffledQuestions.length,
      correctAnswers,
      earnedPoints,
      totalPoints,
      percentage,
      passingScore,
      passed,
      timeTaken: (exam.timeLimit * 60) - timeRemaining,
      timeLimit: exam.timeLimit,
      answers
    };

    console.log('Exam submitted:', results);
    setIsSubmitted(true);
    
    // In a real app, navigate to results page with the results
    // For now, just show an alert
    alert(`Exam submitted!\n\nScore: ${earnedPoints}/${totalPoints} (${percentage}%)\nPassed: ${passed ? 'Yes' : 'No'}`);
  }, [answers, shuffledQuestions, timeRemaining, exam, isSubmitted]);

  // Handle confirm submit
  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(false);
    handleSubmit();
  };

  // Get option label (A, B, C, D)
  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  // Check if all questions are answered
  const allAnswered = shuffledQuestions.every(q => answers[q.id] !== undefined);

  if (shuffledQuestions.length === 0) {
    return (
      <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            </p>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining <= 300 ? 'bg-red-100 text-red-600' : 
            timeRemaining <= 600 ? 'bg-yellow-100 text-yellow-600' : 
            'bg-blue-100 text-blue-600'
          }`}>
            <FaClock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          {shuffledQuestions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => handleGoToQuestion(index)}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-indigo-600 text-white'
                  : answers[q.id] !== undefined
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {Object.keys(answers).length} of {shuffledQuestions.length} answered
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* Question Text */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mb-3">
            {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
          </span>
          <h2 className="text-lg font-semibold text-gray-900">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestion.id] === index
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question_${currentQuestion.id}`}
                checked={answers[currentQuestion.id] === index}
                onChange={() => handleAnswerSelect(index)}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm font-medium text-gray-700">
                {getOptionLabel(index)}
              </span>
              <span className="text-gray-700">{option}</span>
              {answers[currentQuestion.id] === index && (
                <FaCheck className="w-5 h-5 text-indigo-600 ml-auto" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <div className="flex items-center gap-4">
          {currentQuestionIndex < shuffledQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next
              <FaArrowRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaFlagCheckered className="w-5 h-5 mr-2" />
              Submit Exam
            </button>
          )}
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 animate-pulse">
            <div className="flex items-center gap-4 text-yellow-600">
              <FaExclamationTriangle className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold">5 Minutes Remaining!</h3>
                <p className="text-sm text-gray-600">You have only 5 minutes left to complete the exam.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Exam?</h3>
            <div className="text-sm text-gray-600 mb-6">
              <p className="mb-2">You have answered {Object.keys(answers).length} out of {shuffledQuestions.length} questions.</p>
              {Object.keys(answers).length < shuffledQuestions.length && (
                <p className="text-yellow-600">
                  <FaExclamationTriangle className="inline w-4 h-4 mr-1" />
                  Warning: {shuffledQuestions.length - Object.keys(answers).length} questions are unanswered!
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <a onClick={()=>navigate('/kingohub/examresult')}>Submit Now</a>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
