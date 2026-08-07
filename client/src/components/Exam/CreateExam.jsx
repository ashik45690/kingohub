import { useState, useEffect, useRef } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck, 
  FaSave, 
  FaCloudUploadAlt,
  FaClock,
  FaCalendarAlt,
  FaEnvelope,
  FaListOl,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import QuestionForm from '../Question/QuestionForm';
import QuestionLists from '../Question/QuestionLists';
import examService from '../../services/examService';
import { useAuth } from '../../context/AuthContext';

const STEPS = [
  { id: 1, title: 'Basic Details', icon: FaClock },
  { id: 2, title: 'Students', icon: FaEnvelope },
  { id: 3, title: 'Questions', icon: FaListOl },
  { id: 4, title: 'Review', icon: FaCheckCircle },
];



export default function CreateExam({ render }) {
  const { user } = useAuth();
  const bulkEmailsRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bulkEmailText, setBulkEmailText] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCreatedExam, setHasCreatedExam] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({
    isOpen: false,
    type: 'loading',
    message: ''
  });
  const [idempotencyToken] = useState(() => {
    return 'req_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  });

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: '',
    duration: 60, // minutes
    
    // Step 2: Student Emails
    studentEmails: [],
    emailInput: '',
    
    // Step 3: Questions
    questions: [],
    
    // Step 4: Review
    isPublished: false,
  });

  const formatDateInput = (dateValue) => {
    if (!dateValue) return '';
    const dt = new Date(dateValue);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatTimeInput = (dateValue) => {
    if (!dateValue) return '';
    const dt = new Date(dateValue);
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const answerToIndex = (answer) => {
    if (typeof answer === 'number') return answer;
    if (typeof answer === 'string') {
      const upper = answer.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(upper)) {
        return upper.charCodeAt(0) - 65;
      }
      const maybe = Number(answer);
      if (!Number.isNaN(maybe)) return maybe;
    }
    return null;
  };

  const mapQuestionFromApi = (q) => {
    const options = Array.isArray(q.options)
      ? q.options
      : [q.options?.A ?? '', q.options?.B ?? '', q.options?.C ?? '', q.options?.D ?? ''];

    return {
      id: q._id || q.id || Date.now(),
      questionText: q.questionText || '',
      questionType: 'multiple_choice',
      options,
      correctAnswer: answerToIndex(q.correctAnswer),
      points: q.points || 1
    };
  };

  useEffect(() => {
    const examId = localStorage.getItem('editExamId');
    if (!examId) {
      setIsEditMode(false);
      setEditingExamId(null);
      return;
    }

    const loadExam = async () => {
      try {
        const exam = await examService.getExamById(examId);
        if (!exam || exam.status !== 'draft') {
          alert('Only draft exams can be edited.');
          localStorage.removeItem('editExamId');
          if (render) {
            render('My Exams');
          }
          return;
        }

        const questions = await examService.getQuestions(examId);
        const mappedQuestions = Array.isArray(questions) ? questions.map(mapQuestionFromApi) : [];

        setFormData(prev => ({
          ...prev,
          title: exam.title || '',
          description: exam.description || '',
          startDate: formatDateInput(exam.startDate),
          startTime: formatTimeInput(exam.startDate),
          duration: exam.timeLimitMinutes || 60,
          studentEmails: Array.isArray(exam.authorizedEmails) ? exam.authorizedEmails : [],
          questions: mappedQuestions
        }));

        setIsEditMode(true);
        setEditingExamId(examId);
      } catch (error) {
        console.error('Error loading exam for edit:', error);
        alert('Failed to load exam for editing');
        localStorage.removeItem('editExamId');
        if (render) {
          render('My Exams');
        }
      }
    };

    loadExam();
  }, [render]);


  const formatDurationDisplay = (minutes) => {
    if (minutes <= 0) return 'Select valid times';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hourStr = hours === 1 ? '1 hour' : `${hours} hours`;
    if (mins === 0) return hourStr;
    return `${hourStr} ${mins} minutes`;
  };

  useEffect(() => {
    let dateErr = null;
    let timeErr = null;

    if (formData.startDate) {
      const [year, month, day] = formData.startDate.split('-').map(Number);
      const selectedDateOnly = new Date(year, month - 1, day);
      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (selectedDateOnly < todayDateOnly) {
        dateErr = 'Start date cannot be in the past.';
      } else if (selectedDateOnly.getTime() === todayDateOnly.getTime() && formData.startTime) {
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
        if (selectedDateTime.getTime() <= today.getTime()) {
          timeErr = 'Start time cannot be in the past.';
        }
      }
    }

    if (formData.startTime && formData.endTime) {
      const dateToUse = formData.startDate || '2000-01-01';
      const start = new Date(`${dateToUse}T${formData.startTime}`);
      const end = new Date(`${dateToUse}T${formData.endTime}`);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        setFormData(prev => ({ ...prev, duration: diffMins }));
        
        if (diffMins <= 0) {
          setErrors(prev => ({ 
            ...prev, 
            startDate: dateErr,
            startTime: timeErr,
            endTime: 'End time must be greater than start time.',
            duration: 'End time must be greater than start time.'
          }));
        } else {
          setErrors(prev => ({ 
            ...prev, 
            startDate: dateErr,
            startTime: timeErr,
            endTime: null, 
            duration: null 
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          startDate: dateErr,
          startTime: timeErr
        }));
      }
    } else {
      setErrors(prev => ({
        ...prev,
        startDate: dateErr,
        startTime: timeErr
      }));
    }
  }, [formData.startDate, formData.startTime, formData.endTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Step 1: Basic Details Validation
  const validateStep1 = () => {
    const newErrors = {};
    const titleStr = formData.title.trim();
    if (!titleStr) {
      newErrors.title = 'Title is required';
    } else if (/^\d+$/.test(titleStr)) {
      newErrors.title = 'Title cannot contain only numbers';
    } else if (!/[a-zA-Z]/.test(titleStr)) {
      newErrors.title = 'Title must contain valid text';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    let dateErr = null;
    let timeErr = null;
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const [year, month, day] = formData.startDate.split('-').map(Number);
      const selectedDateOnly = new Date(year, month - 1, day);
      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (selectedDateOnly < todayDateOnly) {
        newErrors.startDate = 'Start date cannot be in the past.';
        dateErr = 'Start date cannot be in the past.';
      } else if (selectedDateOnly.getTime() === todayDateOnly.getTime() && formData.startTime) {
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
        if (selectedDateTime.getTime() <= today.getTime()) {
          newErrors.startTime = 'Start time cannot be in the past.';
          timeErr = 'Start time cannot be in the past.';
        }
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.duration <= 0) {
      newErrors.endTime = 'End time must be greater than start time.';
      newErrors.duration = 'End time must be greater than start time.';
    }
    
    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
    return Object.keys(newErrors).length === 0;
  };

  // Step 2: Student Emails Validation
  const validateStep2 = () => {
    const newErrors = {};
    if (formData.studentEmails.length === 0) {
      newErrors.studentEmails = 'At least one student email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3: Questions Validation
  const validateStep3 = () => {
    const newErrors = {};
    if (formData.questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }
    
    // Validate each question
    formData.questions.forEach((q, index) => {
      if (!q.questionText.trim()) {
        newErrors[`question_${index}`] = 'Question text is required';
      }
      if (q.questionType === 'multiple_choice') {
        if (!q.options || q.options.length < 2) {
          newErrors[`question_options_${index}`] = 'Question must have at least 2 options';
        }
        if (q.options && q.options.some(opt => !opt.trim())) {
          newErrors[`question_options_${index}`] = 'All options must be filled';
        }
        if (q.correctAnswer === undefined || q.correctAnswer === null) {
          newErrors[`question_answer_${index}`] = 'Please select a correct answer';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Step 2: Email management
  const addEmail = () => {
    const email = formData.emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const teacherEmail = user?.email?.toLowerCase?.() || '';

    if (!email) {
      setErrors(prev => ({ ...prev, emailInput: 'Please enter an email address' }));
      return;
    }

    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, emailInput: 'Please enter a valid email address' }));
      return;
    }

    if (teacherEmail && email === teacherEmail) {
      setErrors(prev => ({ ...prev, emailInput: 'You cannot assign an exam to your own account.' }));
      return;
    }

    if (formData.studentEmails.includes(email)) {
      setErrors(prev => ({ ...prev, emailInput: 'Email already added' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      studentEmails: [...prev.studentEmails, email],
      emailInput: ''
    }));
    setErrors(prev => ({ ...prev, emailInput: null }));
  };

  const removeEmail = (emailToRemove) => {
    setFormData(prev => ({
      ...prev,
      studentEmails: prev.studentEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  // Step 3: Question management
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: '',
      questionType: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: null,
      points: 1
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const buildExamPayload = () => ({
    title: formData.title,
    description: formData.description,
    startDate: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
    timeLimitMinutes: formData.duration,
    authorizedEmails: formData.studentEmails,
    idempotencyToken,
    questions: formData.questions.map((q, index) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      order: index + 1
    }))
  });

  const handleEditSuccess = (message) => {
    alert(message);
    localStorage.removeItem('editExamId');
    if (render) {
      render('My Exams');
    }
  };

  // Publish exam
  const handlePublish = async () => {
    if (isSubmitting) return;

    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      if (!isStep1Valid) setCurrentStep(1);
      else if (!isStep2Valid) setCurrentStep(2);
      else if (!isStep3Valid) setCurrentStep(3);

      setSubmissionStatus({
        isOpen: true,
        type: 'error',
        message: 'Please resolve all validation errors before publishing.'
      });
      return;
    }

    if (errors.emailInput || errors.bulkEmails) {
      setSubmissionStatus({
        isOpen: true,
        type: 'error',
        message: 'Please remove invalid emails before publishing.'
      });
      return;
    }

    if (!isEditMode && hasCreatedExam) {
      setSubmissionStatus({
        isOpen: true,
        type: 'duplicate',
        message: 'Exam is already created'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus({
      isOpen: true,
      type: 'loading',
      message: 'Creating your exam... Please wait.'
    });

    try {
      const examData = buildExamPayload();

      if (isEditMode && editingExamId) {
        setSubmissionStatus(prev => ({ ...prev, message: 'Updating your exam... Please wait.' }));
        await examService.updateExam(editingExamId, examData);
        await examService.publishExam(editingExamId);

        setIsSubmitting(false);
        setSubmissionStatus({
          isOpen: true,
          type: 'success',
          message: 'Exam updated and published successfully!'
        });
        localStorage.removeItem('editExamId');
        return;
      }

      const createdExam = await examService.createExam(examData);
      const examId = createdExam._id;
      setHasCreatedExam(true);

      setSubmissionStatus(prev => ({ ...prev, message: 'Adding questions... Please wait.' }));
      for (let i = 0; i < formData.questions.length; i++) {
        const q = formData.questions[i];
        await examService.addQuestion({
          examId,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          order: i + 1,
        });
      }

      setSubmissionStatus(prev => ({ ...prev, message: 'Publishing your exam... Please wait.' }));
      await examService.publishExam(examId);

      setIsSubmitting(false);
      setSubmissionStatus({
        isOpen: true,
        type: 'success',
        message: 'Exam created and published successfully!'
      });
    } catch (error) {
      console.error('Error publishing exam:', error);
      setIsSubmitting(false);
      const errMsg = error.response?.data?.message || 'Failed to create exam. Please try again';
      if (errMsg === 'Exam is already created') {
        setHasCreatedExam(true);
        setSubmissionStatus({
          isOpen: true,
          type: 'duplicate',
          message: 'Exam is already created'
        });
      } else {
        setSubmissionStatus({
          isOpen: true,
          type: 'error',
          message: errMsg
        });
      }
    }
  };

  const handleSaveDraft = async () => {
    if (isSubmitting) return;

    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      if (!isStep1Valid) setCurrentStep(1);
      else if (!isStep2Valid) setCurrentStep(2);
      else if (!isStep3Valid) setCurrentStep(3);

      setSubmissionStatus({
        isOpen: true,
        type: 'error',
        message: 'Please resolve all validation errors before saving draft.'
      });
      return;
    }

    if (errors.emailInput || errors.bulkEmails) {
      setSubmissionStatus({
        isOpen: true,
        type: 'error',
        message: 'Please remove invalid emails before saving.'
      });
      return;
    }

    if (!isEditMode && hasCreatedExam) {
      setSubmissionStatus({
        isOpen: true,
        type: 'duplicate',
        message: 'Exam is already created'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus({
      isOpen: true,
      type: 'loading',
      message: 'Saving your draft... Please wait.'
    });

    try {
      const examData = buildExamPayload();

      if (isEditMode && editingExamId) {
        setSubmissionStatus(prev => ({ ...prev, message: 'Updating draft... Please wait.' }));
        await examService.updateExam(editingExamId, examData);

        setIsSubmitting(false);
        setSubmissionStatus({
          isOpen: true,
          type: 'success',
          message: 'Draft updated successfully!'
        });
        localStorage.removeItem('editExamId');
        return;
      }

      const createdExam = await examService.createExam(examData);
      const examId = createdExam._id;
      setHasCreatedExam(true);

      setSubmissionStatus(prev => ({ ...prev, message: 'Adding questions... Please wait.' }));
      for (let i = 0; i < formData.questions.length; i++) {
        const q = formData.questions[i];
        await examService.addQuestion({
          examId,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          order: i + 1,
        });
      }

      setIsSubmitting(false);
      setSubmissionStatus({
        isOpen: true,
        type: 'success',
        message: 'Draft saved successfully!'
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      setIsSubmitting(false);
      const errMsg = error.response?.data?.message || 'Failed to save draft. Please try again';
      if (errMsg === 'Exam is already created') {
        setHasCreatedExam(true);
        setSubmissionStatus({
          isOpen: true,
          type: 'duplicate',
          message: 'Exam is already created'
        });
      } else {
        setSubmissionStatus({
          isOpen: true,
          type: 'error',
          message: errMsg
        });
      }
    }
  };

  // Render error message
  const renderError = (field) => {
    if (errors[field]) {
      return (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <FaExclamationCircle className="w-3 h-3 mr-1" />
          {errors[field]}
        </p>
      );
    }
    return null;
  };

  // Step 1: Basic Details Form
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h2>
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Exam Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter exam title"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {renderError('title')}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          key="description-textarea"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter exam description"
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {renderError('description')}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {renderError('startDate')}
        </div>

        {/* Start Time */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaClock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {renderError('startTime')}
        </div>

        {/* End Time */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            End Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaClock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {renderError('endTime')}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (Auto-calculated)
        </label>
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaClock className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formatDurationDisplay(formData.duration)}
            readOnly
            className={`w-full pl-10 px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 font-medium outline-none transition-colors ${
              formData.duration > 0 ? 'border-gray-200' : 'border-red-200 text-red-500'
            }`}
          />
        </div>
        {renderError('duration')}
      </div>
    </div>
  );

  // Step 2: Student Emails Form
  const renderStep2 = () => {
    const teacherEmail = user?.email?.toLowerCase?.() || '';

    const handleBulkEmailsBlur = (e) => {
      const rawInput = e.target.value;
      if (!rawInput.trim()) return;

      const emails = rawInput.split(/[\n,]/).map(em => em.trim().toLowerCase()).filter(em => em);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const validEmails = [];
      const invalidEmails = [];
      let selfAssignError = false;

      emails.forEach(em => {
        if (!emailRegex.test(em)) {
          invalidEmails.push(em);
        } else if (teacherEmail && em === teacherEmail) {
          selfAssignError = true;
        } else if (!formData.studentEmails.includes(em) && !validEmails.includes(em)) {
          validEmails.push(em);
        }
      });

      if (selfAssignError) {
        setErrors(prev => ({ ...prev, bulkEmails: 'You cannot assign an exam to your own account.' }));
      } else if (invalidEmails.length > 0) {
        setErrors(prev => ({ ...prev, bulkEmails: `Invalid emails: ${invalidEmails.join(', ')}` }));
      } else {
        setErrors(prev => ({ ...prev, bulkEmails: null }));
        setBulkEmailText('');
      }

      if (validEmails.length > 0) {
        setFormData(prev => ({ ...prev, studentEmails: [...prev.studentEmails, ...validEmails] }));
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Students</h2>

        {/* Single Email Input */}
        <div>
          <label htmlFor="emailInput" className="block text-sm font-medium text-gray-700 mb-1">
            Student Email
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="email"
                id="emailInput"
                name="emailInput"
                value={formData.emailInput}
                onChange={handleInputChange}
                onKeyPress={handleEmailKeyPress}
                placeholder="Enter student email and press Enter"
                className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                  errors.emailInput ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={addEmail}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center shrink-0"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>
          {renderError('emailInput')}
        </div>

        {/* Bulk Email Input */}
        <div>
          <label htmlFor="bulkEmails" className="block text-sm font-medium text-gray-700 mb-1">
            Bulk Add Emails
          </label>
          <textarea
            key="bulk-emails-textarea"
            id="bulkEmails"
            ref={bulkEmailsRef}
            value={bulkEmailText}
            onChange={(e) => setBulkEmailText(e.target.value)}
            placeholder="Paste multiple email addresses (one per line or comma-separated)"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none ${
              errors.bulkEmails ? 'border-red-500' : 'border-gray-300'
            }`}
            onBlur={handleBulkEmailsBlur}
          />
          {renderError('bulkEmails')}
          <p className="mt-1 text-sm text-gray-500">
            Paste multiple emails separated by commas or new lines. Invalid emails will not be added.
          </p>
        </div>

        {/* Email List */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Added Students ({formData.studentEmails.length})
          </h3>
          {formData.studentEmails.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FaEnvelope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students added yet</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {formData.studentEmails.map((email, index) => (
                  <li key={index} className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg shadow-sm min-w-0">
                    <span className="text-sm text-gray-700 truncate">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="text-red-500 hover:text-red-700 transition-colors shrink-0 p-1"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {renderError('studentEmails')}
        </div>
      </div>
    );
  };

  // Step 3: Questions Form
  const renderStep3 = () => (
  <div className="space-y-6">
    <QuestionForm
      key={editingQuestion ? editingQuestion.id : 'new-question'}
      initialData={editingQuestion}
      onSave={(questionData) => {
        if (editingQuestionIndex !== null) {
          setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
              idx === editingQuestionIndex ? questionData : q
            )
          }));
          setEditingQuestion(null);
          setEditingQuestionIndex(null);
        } else {
          setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, questionData]
          }));
        }
      }}
      onCancel={() => {
        setEditingQuestion(null);
        setEditingQuestionIndex(null);
      }}
    />

    <QuestionLists
      questions={formData.questions}
      onEdit={(question, index) => {
        setEditingQuestion(question);
        setEditingQuestionIndex(index);
      }}
      onDelete={removeQuestion}
      onReorder={(newQuestions) => {
        setFormData(prev => ({
          ...prev,
          questions: newQuestions
        }));
      }}
      isEditable={true}
    />
  </div>
);

  // Step 4: Review and Publish
  const renderStep4 = () => {
    const totalPoints = formData.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    
    return (
      <div className="space-y-6 flex-1">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Publish</h2>
        
        {/* Exam Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Time</p>
              <p className="font-medium text-gray-900">{formData.startTime || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Time</p>
              <p className="font-medium text-gray-900">{formData.endTime || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">{formData.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-900">
                {formData.startDate || '-'}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium text-gray-900">{formData.description || '-'}</p>
          </div>
        </div>

        {/* Students Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Students</h3>
          <p className="text-gray-700">
            <span className="font-medium">{formData.studentEmails.length}</span> students invited
          </p>
          {formData.studentEmails.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
              <ul className="text-sm text-gray-600 space-y-1">
                {formData.studentEmails.slice(0, 5).map((email, index) => (
                  <li key={index}>{email}</li>
                ))}
                {formData.studentEmails.length > 5 && (
                  <li className="text-gray-500 italic">
                    +{formData.studentEmails.length - 5} more...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Questions Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{formData.questions.length}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{totalPoints}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formData.questions.length}
              </p>
              <p className="text-sm text-gray-600">Multiple Choice</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${
              isSubmitting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaSave className="w-4 h-4 mr-2" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${
              isSubmitting 
                ? 'bg-green-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <FaCloudUploadAlt className="w-4 h-4 mr-2" />
            Publish Exam
          </button>
        </div>
      </div>
    );
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 flex-1 min-w-0 w-full bg-gray-50 min-h-screen">
      {/* Header */}





      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details to create a new exam
        </p>
      </div>




      

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center flex-1 min-w-[70px] sm:min-w-0">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <FaCheck className="w-5 h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <span className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${isActive || isCompleted ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>





{/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        {renderCurrentStep()}
      </div>





      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-lg flex items-center justify-center transition-colors ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {currentStep < STEPS.length && (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            Next
            <FaArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>













      {/* Submission Status Modal */}
      {submissionStatus.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col items-center text-center animate-fade-in border border-gray-100" style={{ animation: 'fade-in 0.2s ease-out, scale-in 0.2s ease-out' }}>
            {submissionStatus.type === 'loading' && (
              <>
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Creating your exam...</h3>
                <p className="text-sm text-gray-500">Please wait...</p>
              </>
            )}
            
            {submissionStatus.type === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <FaCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Exam Created Successfully</h3>
                <p className="text-sm text-gray-500 mb-8">Your exam has been created and published successfully.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionStatus(prev => ({ ...prev, isOpen: false }));
                    if (render) render('My Exams');
                  }}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  Go to My Exams
                </button>
              </>
            )}

            {submissionStatus.type === 'error' && (
              <>
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <FaExclamationCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Error</h3>
                <p className="text-sm text-gray-500 mb-6">{submissionStatus.message || 'Failed to create exam. Please try again'}</p>
                <button
                  type="button"
                  onClick={() => setSubmissionStatus(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  Try Again
                </button>
              </>
            )}

            {submissionStatus.type === 'duplicate' && (
              <>
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                  <FaExclamationCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Already Created</h3>
                <p className="text-sm text-gray-500 mb-6">{submissionStatus.message || 'Exam is already created'}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionStatus(prev => ({ ...prev, isOpen: false }));
                    if (render) render('My Exams');
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  Go to My Exams
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
