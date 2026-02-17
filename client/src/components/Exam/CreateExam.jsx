import { useState, useEffect, useCallback } from 'react';
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

const STEPS = [
  { id: 1, title: 'Basic Details', icon: FaClock },
  { id: 2, title: 'Students', icon: FaEnvelope },
  { id: 3, title: 'Questions', icon: FaListOl },
  { id: 4, title: 'Review', icon: FaCheckCircle },
];

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'exam_draft';

export default function CreateExam() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
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

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        setLastSaved(new Date(parsed.lastSaved));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      saveDraft();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(autoSaveTimer);
  }, [formData]);

  const saveDraft = useCallback(() => {
    setIsSaving(true);
    const dataToSave = { ...formData, lastSaved: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  }, [formData]);

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
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }
    
    // Check if end date/time is after start date/time
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
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
    const email = formData.emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) return;
    
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, emailInput: 'Invalid email format' }));
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

  // Publish exam
  const handlePublish = () => {
    const examData = {
      ...formData,
      isPublished: true,
      createdAt: new Date().toISOString()
    };
    console.log('Publishing exam:', examData);
    alert('Exam published successfully!');
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSaveDraft = () => {
    saveDraft();
    alert('Draft saved successfully!');
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

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {renderError('endDate')}
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
          Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          min="1"
          className={`w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
            errors.duration ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {renderError('duration')}
      </div>
    </div>
  );

  // Step 2: Student Emails Form
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Students</h2>
      
      {/* Email Input */}
      <div>
        <label htmlFor="emailInput" className="block text-sm font-medium text-gray-700 mb-1">
          Student Email
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
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
          id="bulkEmails"
          placeholder="Paste multiple email addresses (one per line or comma-separated)"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
          onBlur={(e) => {
            const emails = e.target.value.split(/[\n,]/).map(email => email.trim()).filter(email => email);
            const uniqueEmails = [...new Set([...formData.studentEmails, ...emails])];
            setFormData(prev => ({ ...prev, studentEmails: uniqueEmails }));
          }}
        />
        <p className="mt-1 text-sm text-gray-500">
          Paste multiple emails separated by commas or new lines
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
                <li key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-red-500 hover:text-red-700 transition-colors"
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

  // Step 3: Questions Form
  const renderStep3 = () => (
  <div className="space-y-6">
    <QuestionForm
      onSave={(questionData) => {
        setFormData(prev => ({
          ...prev,
          questions: [...prev.questions, questionData]
        }));
      }}
      onCancel={() => {
        // Optional: handle cancel if needed
      }}
    />

    <QuestionLists
      questions={formData.questions}
      onEdit={(question, index) => {
        // Handle edit - could open the form with existing data
        console.log('Edit question:', question, index);
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
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-medium text-gray-900">{formData.title || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">{formData.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date & Time</p>
              <p className="font-medium text-gray-900">
                {formData.startDate && formData.startTime 
                  ? `${formData.startDate} at ${formData.startTime}` 
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date & Time</p>
              <p className="font-medium text-gray-900">
                {formData.endDate && formData.endTime 
                  ? `${formData.endDate} at ${formData.endTime}` 
                  : '-'}
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
                {formData.questions.filter(q => q.questionType === 'multiple_choice').length}
              </p>
              <p className="text-sm text-gray-600">Multiple Choice</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {formData.questions.filter(q => q.questionType === 'true_false').length}
              </p>
              <p className="text-sm text-gray-600">True/False</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <FaSave className="w-4 h-4 mr-2" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
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
    <div className="p-6 flex-1 bg-gray-50 min-h-screen">
      {/* Header */}





      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details to create a new exam
        </p>
      </div>




      

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <FaCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>





      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderCurrentStep()}
      </div>





      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg flex items-center transition-colors ${
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
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            Next
            <FaArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>













      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      )}
    </div>
  );
}
