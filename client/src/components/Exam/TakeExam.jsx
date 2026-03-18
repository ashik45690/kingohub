import { useState, useEffect, useCallback, useRef } from 'react';
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
import examService from '../../services/examService';
import submissionService from '../../services/submissionService';

export default function TakeExam() {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const examId = queryParams.get('examId');

  const [exam, setExam] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [startTime] = useState(new Date().toISOString());
  const answersRef = useRef({});

  useEffect(() => {
    if (!examId) return;
    const fetchExamData = async () => {
      try {
        const examData = await examService.getExamById(examId);
        const questionsData = await examService.getQuestions(examId);
        setExam(examData);
        setTimeRemaining(examData.timeLimitMinutes * 60);
        setShuffledQuestions(questionsData);
      } catch (error) {
        const message = error?.response?.data?.message || '';
        if (message.toLowerCase().includes('already submitted')) {
          navigate(`/kingohub/examresult?examId=${examId}`);
          return;
        }
        console.error('Error fetching exam:', error);
      }
    };
    fetchExamData();
  }, [examId, navigate]);

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

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
      [currentQuestion._id]: optionIndex
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
  const handleSubmit = useCallback(async () => {
    if (isSubmitted || !exam) return;
    setIsSubmitted(true);

    const formattedAnswers = Object.keys(answersRef.current).map(qid => ({
      questionId: qid,
      selectedAnswer: answersRef.current[qid]
    }));

    try {
      await submissionService.submitExam({
        examId: exam._id,
        answers: formattedAnswers,
        startTime,
        status: 'completed'
      });
      alert('Exam submitted successfully!');
      navigate(`/kingohub/examresult?examId=${exam._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to submit exam');
    }
  }, [exam, isSubmitted, navigate, startTime]);

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
  const allAnswered = shuffledQuestions.every(q => answers[q._id] !== undefined);

  if (!exam || shuffledQuestions.length === 0) {
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
              key={q._id}
              onClick={() => handleGoToQuestion(index)}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-indigo-600 text-white'
                  : answers[q._id] !== undefined
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
                answers[currentQuestion._id] === index
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question_${currentQuestion._id}`}
                checked={answers[currentQuestion._id] === index}
                onChange={() => handleAnswerSelect(index)}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm font-medium text-gray-700">
                {getOptionLabel(index)}
              </span>
              <span className="text-gray-700">{option}</span>
              {answers[currentQuestion._id] === index && (
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
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
