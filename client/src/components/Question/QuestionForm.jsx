import { useState } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

export default function QuestionForm({ onSave, onCancel, initialData }) {
  // Initialize form state with default values or existing data
  const [formData, setFormData] = useState({
    id: initialData?.id || Date.now(),
    questionText: initialData?.questionText || '',
    questionType: initialData?.questionType || 'multiple_choice',
    options: initialData?.options || ['', '', '', ''],
    correctAnswer: initialData?.correctAnswer ?? null,
    points: initialData?.points || 1
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Handle input change for question text
  const handleQuestionTextChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, questionText: value }));
    // Clear error when user starts typing
    if (errors.questionText) {
      setErrors(prev => ({ ...prev, questionText: null }));
    }
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
    
    // Clear error when user starts typing
    if (errors[`option_${index}`]) {
      setErrors(prev => ({ ...prev, [`option_${index}`]: null }));
    }
  };

  // Handle correct answer selection
  const handleCorrectAnswerChange = (index) => {
    setFormData(prev => ({ ...prev, correctAnswer: index }));
    // Clear error when user selects an answer
    if (errors.correctAnswer) {
      setErrors(prev => ({ ...prev, correctAnswer: null }));
    }
  };

  // Handle points change
  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setFormData(prev => ({ ...prev, points: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Question text is required
    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    // For multiple choice, all options must be filled
    if (formData.questionType === 'multiple_choice') {
      formData.options.forEach((option, index) => {
        if (!option.trim()) {
          newErrors[`option_${index}`] = `Option ${index + 1} is required`;
        }
      });

      // At least one correct answer must be selected
      if (formData.correctAnswer === null) {
        newErrors.correctAnswer = 'Please select the correct answer';
      }
    }

    // Points must be at least 1
    if (formData.points < 1) {
      newErrors.points = 'Points must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Call the onSave callback with the form data
    if (onSave) {
      onSave(formData);
    }
    
    setIsSaving(false);
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Get option labels (A, B, C, D)
  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Edit Question' : 'Add New Question'}
      </h3>

      {/* Question Text Input */}
      <div className="mb-6">
        <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          id="questionText"
          value={formData.questionText}
          onChange={handleQuestionTextChange}
          placeholder="Enter your question here..."
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none ${
            errors.questionText ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.questionText && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="w-3 h-3 mr-1" />
            {errors.questionText}
          </p>
        )}
      </div>

      {/* Points Input */}
      <div className="mb-6">
        <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          id="points"
          value={formData.points}
          onChange={handlePointsChange}
          min="1"
          className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
            errors.points ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.points && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="w-3 h-3 mr-1" />
            {errors.points}
          </p>
        )}
      </div>

      {/* Options for Multiple Choice */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options <span className="text-red-500">*</span>
          <span className="text-gray-500 font-normal ml-2">(Select the correct answer using radio buttons)</span>
        </label>
        
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              {/* Radio button for correct answer */}
              <input
                type="radio"
                name="correctAnswer"
                checked={formData.correctAnswer === index}
                onChange={() => handleCorrectAnswerChange(index)}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                disabled={formData.questionType !== 'multiple_choice'}
              />
              
              {/* Option label (A, B, C, D) */}
              <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {getOptionLabel(index)}
              </span>
              
              {/* Option input */}
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                  errors[`option_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={formData.questionType !== 'multiple_choice'}
              />
              
              {/* Show check icon if this is the correct answer */}
              {formData.correctAnswer === index && (
                <FaCheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          ))}
        </div>
        
        {errors.correctAnswer && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="w-3 h-3 mr-1" />
            {errors.correctAnswer}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <FaTrash className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="w-4 h-4 mr-2" />
              {initialData ? 'Update Question' : 'Add Question'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
