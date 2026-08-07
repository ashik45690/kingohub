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
import RegistrationForm from './RegistrationForm';
import { PageLoader, FadeIn } from '../common/Loaders';

export default function TakeExam() {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const examId = queryParams.get('examId');

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(null);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(new Date().toISOString());

  const answersRef = useRef({});

  // 1. Define handleSubmit BEFORE it's used in any useEffect or callback
  const handleSubmit = useCallback(async () => {
    if (isSubmitted || !exam) return;
    
    // Use ref to get most recent answers
    const currentAnswers = answersRef.current;
    const formattedAnswers = Object.keys(currentAnswers).map(qid => ({
      questionId: qid,
      selectedAnswer: currentAnswers[qid]
    }));

    if (formattedAnswers.length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    setIsSubmitted(true);

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
      alert(err?.response?.data?.message || 'Failed to submit exam');
      setIsSubmitted(false); // Allow re-submission if failed
    }
  }, [exam, isSubmitted, navigate, startTime]);

  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(false);
    handleSubmit();
  };

  // 2. Define fetchInitialData
  const fetchInitialData = useCallback(async () => {
    if (!examId) {
      setError('Exam ID is missing from URL');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const regCheck = await examService.checkRegistration(examId);
      setIsRegistered(!!regCheck?.isRegistered);

      const examData = await examService.getExamById(examId);
      if (!examData) throw new Error('Exam data not found');
      setExam(examData);

      // Handle registration status
      const now = new Date();
      const startDate = examData.startDate ? new Date(examData.startDate) : null;
      
      if (startDate) {
        const closingDate = examData.registrationClosingDate 
          ? new Date(examData.registrationClosingDate) 
          : startDate;

        if (now >= closingDate) {
          setRegistrationClosed(true);
        }

        // Check if there's an ongoing attempt
        if (regCheck?.isRegistered) {
          try {
            const response = await examService.getQuestions(examId);
            const qList = Array.isArray(response) ? response : (response?.questions || response?.data || []);
            
            if (qList && qList.length > 0) {
              setShuffledQuestions(qList);
              const endDate = new Date(startDate.getTime() + (examData.timeLimitMinutes || 0) * 60000);
              if (now >= startDate && now <= endDate) {
                 setTimeRemaining(Math.max((examData.timeLimitMinutes || 60) * 60, 0));
                 setExamStarted(true);
              }
            }
          } catch (qErr) {
            // Question fetch failed on initial load — likely not started yet, silently skip
          }
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load exam data');
      setLoading(false);
    }
  }, [examId]);

  // 3. Effects in order of dependency
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!examStarted || isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted, examStarted, handleSubmit]);

  useEffect(() => {
    if (examStarted && timeRemaining === 300 && !isSubmitted) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    }
  }, [timeRemaining, isSubmitted, examStarted]);

  // Callbacks for events
  const handleStartExam = async () => {
    try {
      setLoading(true);
      const startData = await examService.startExam(examId);
      
      const response = await examService.getQuestions(examId);
      const qList = Array.isArray(response) ? response : (response?.questions || response?.data || []);
      
      if (!qList || qList.length === 0) {
        throw new Error("No questions found for this exam.");
      }

      setShuffledQuestions(qList);
      setTimeRemaining((exam?.timeLimitMinutes || 60) * 60);
      setStartTime(startData?.data?.startTime || new Date().toISOString());
      setExamStarted(true);
      setLoading(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to start exam';
      alert(msg);
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = async () => {
    setIsRegistered(true);
    fetchInitialData();
  };

  const getOptionLabel = (index) => String.fromCharCode(65 + index);
  const formatTime = (seconds) => {
    if (seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

if (loading) {
    return <PageLoader label="Loading exam data..." />;
  }

  if (error) {
    return (
      <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-100">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const examStartDate = exam.startDate ? new Date(exam.startDate) : null;
  const now = new Date();

  // 1. Not registered logic
  if (!isRegistered) {
    if (registrationClosed || (examStartDate && now >= examStartDate)) {
      return (
        <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-100">
            <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Closed</h2>
            <p className="text-gray-600 mb-6">The registration for this exam is no longer available as the exam has already begun or registration period passed.</p>
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
              <FaHome className="mr-2" /> Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <RegistrationForm 
          examId={examId} 
          examTitle={exam.title} 
          onRegistrationSuccess={handleRegistrationSuccess} 
        />
      </div>
    );
  }

  // 2. Registered but not started logic
  if (!examStarted) {
    const isPastStart = examStartDate && now >= examStartDate;
    const endDate = new Date(examStartDate.getTime() + (exam.timeLimitMinutes || 0) * 60000);
    const isPastEnd = now > endDate;

    if (isPastEnd) {
      return (
        <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-100">
            <FaExclamationTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Ended</h2>
            <p className="text-gray-600 mb-6">This exam has already concluded on {endDate.toLocaleString()}.</p>
            <button onClick={() => navigate('/dashboard')} className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-bold">
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    if (!isPastStart) {
      return (
        <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-100">
            <FaClock className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Started</h2>
            <p className="text-gray-600 mb-6">This exam will be available to take on {examStartDate?.toLocaleString()}.</p>
            <button onClick={() => navigate('/dashboard')} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Is ongoing - show Start Button
    return (
      <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-100">
          <FaFlagCheckered className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Attend?</h2>
          <p className="text-gray-600 mb-6 font-medium">Exam: {exam.title}</p>
          <div className="text-sm text-gray-500 mb-8 border-l-4 border-indigo-500 pl-4 text-left space-y-2">
            <p>â€¢ Duration: <span className="font-bold text-gray-700">{exam.timeLimitMinutes} minutes</span></p>
            <p>â€¢ Total Questions: <span className="font-bold text-gray-700">{exam.questions?.length || 0}</span></p>
            <p className="text-red-500 font-semibold italic">â€¢ Important: The timer will start immediately.</p>
          </div>
          <button
            onClick={handleStartExam}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 transform hover:scale-[1.02]"
          >
            Start Exam Now
          </button>
        </div>
      </div>
    );
  }

  // 3. Exam Ongoing
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
         <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
           <FaExclamationTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
           <p className="text-gray-600 mb-4 font-medium">Wait! We couldn't load any questions for this exam.</p>
           <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
             Back to Dashboard
           </button>
         </div>
      </div>
    );
  }

return (
    <FadeIn className="p-4 md:p-6 flex-1 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 sticky top-0 md:top-4 z-10 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-500 font-medium">
              Progress: <span className="text-indigo-600">{currentQuestionIndex + 1}</span> of {shuffledQuestions.length} questions
            </p>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl transition-all shadow-sm ${
            timeRemaining <= 300 ? 'bg-red-50 text-red-600 animate-pulse' : 
            'bg-indigo-50 text-indigo-700'
          }`}>
            <FaClock className="w-5 h-5" />
            <span className="font-mono font-black text-xl tracking-tighter">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress navigation */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide md:flex-wrap">
          {shuffledQuestions.map((q, index) => (
            <button
              key={q._id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                index === currentQuestionIndex
                  ? 'ring-4 ring-indigo-100 bg-indigo-600 text-white'
                  : answers[q._id] !== undefined
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {index + 1}
            </button>  
          ))}
        </div>
        <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-500" 
            style={{ width: `${(Object.keys(answers).length / shuffledQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12 mb-8 transition-all duration-300">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <span className="inline-flex items-center px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
              Multiple Choice
            </span>
            <span className="text-sm font-black text-gray-300">
              +{currentQuestion?.points || 0} PTS
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
            {currentQuestion?.questionText}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(currentQuestion?.options || []).map((option, index) => (
            <label
              key={index}
              className={`flex items-center gap-4 sm:gap-6 p-4 sm:p-6 min-w-0 border-3 rounded-[1.5rem] cursor-pointer transition-all duration-200 group relative ${
                answers[currentQuestion._id] === index
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-50 transform scale-[1.01]'
                  : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
              }`}
            >
              <input
                type="radio"
                name={`question_${currentQuestion._id}`}
                checked={answers[currentQuestion._id] === index}
                onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion._id]: index }))}
                className="hidden"
              />
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xl font-black transition-all ${
                answers[currentQuestion._id] === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-400 group-hover:text-gray-600 shadow-sm border border-gray-100'
              }`}>
                {getOptionLabel(index)}
              </div>
<span className={`text-base sm:text-lg transition-colors flex-1 min-w-0 break-words ${
                answers[currentQuestion._id] === index ? 'text-indigo-900 font-black' : 'text-gray-600 font-medium'
              }`}>
                {option}
              </span>
              {answers[currentQuestion._id] === index && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                   <FaCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-20">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className={`w-full md:w-auto flex items-center justify-center px-10 py-5 rounded-2xl font-black transition-all ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
          }`}
        >
          <FaArrowLeft className="mr-4" /> PREVIOUS
        </button>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {currentQuestionIndex < shuffledQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="w-full md:w-auto flex items-center justify-center px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transform hover:scale-[1.02] transition-all"
            >
              NEXT QUESTION <FaArrowRight className="ml-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="w-full md:w-auto flex items-center justify-center px-12 py-5 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 shadow-2xl shadow-green-100 transform hover:scale-[1.02] transition-all"
            >
              <FaFlagCheckered className="mr-4" /> FINISH & SUBMIT
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
<div className="bg-white rounded-3xl p-6 sm:p-10 max-w-sm w-full animate-bounce shadow-2xl border-t-8 border-red-500 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <FaClock className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-gray-900 mb-2">5 MINUTES!</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Hurry up, time is running out</p>
            </div>
          </div>
        </div>
      )}

      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] max-h-[90vh] overflow-y-auto w-full max-w-md shadow-2xl relative p-6 sm:p-10">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-400 to-green-600"></div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 sm:mb-8 mt-4">Submit Exam?</h3>
            
            <div className="space-y-4 mb-8 sm:mb-10">
              <div className="flex items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-[1.5rem] gap-4">
                 <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Completed</span>
                 <span className="font-black text-indigo-600 text-3xl whitespace-nowrap">{Object.keys(answers).length} <span className="text-sm font-medium text-gray-400">/ {shuffledQuestions.length}</span></span>
              </div>
              
              {Object.keys(answers).length < shuffledQuestions.length && (
                <div className="p-4 sm:p-6 bg-red-50 border border-red-100 rounded-[1.5rem] flex items-center gap-4 text-red-800">
                  <FaExclamationTriangle className="w-8 h-8 shrink-0 animate-pulse" />
                  <p className="text-sm font-black leading-tight uppercase">
                    Careful! You still have {shuffledQuestions.length - Object.keys(answers).length} questions left.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={() => setShowConfirmSubmit(false)} className="w-full py-4 sm:py-5 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-colors">
                GO BACK & CHECK
              </button>
<button onClick={handleConfirmSubmit} className="w-full py-4 sm:py-5 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 shadow-xl transition-all transform hover:scale-[1.02]">
                YES, SUBMIT NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
