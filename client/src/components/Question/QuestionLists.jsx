import { useState } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaGripVertical, 
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaPlus,
  FaSortNumericUp
} from 'react-icons/fa';

export default function QuestionLists({ 
  questions = [], 
  onEdit, 
  onDelete, 
  onReorder,
  isEditable = true 
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Handle drag start
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drop
  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    // Reorder questions
    const newQuestions = [...questions];
    const [draggedItem] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedItem);

    if (onReorder) {
      onReorder(newQuestions);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Get question type icon
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice':
        return <FaCheckCircle className="w-4 h-4 text-blue-500" />;
      case 'true_false':
        return <FaQuestionCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <FaSortNumericUp className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get question type label
  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'short_answer':
        return 'Short Answer';
      default:
        return type;
    }
  };

  // Render empty state
  if (questions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <FaQuestionCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">No questions added yet</p>
        <p className="text-sm text-gray-400">
          Add questions using the form above to build your exam
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Questions ({questions.length})
        </h3>
        <div className="text-sm text-gray-500">
          Total Points: {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={question.id}
            draggable={isEditable}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(index)}
            className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${
              isEditable ? 'cursor-move' : 'cursor-default'
            } ${
              draggedIndex === index 
                ? 'opacity-50 border-indigo-300' 
                : dragOverIndex === index 
                ? 'border-indigo-500 border-dashed' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Drag Handle */}
              {isEditable && (
                <div className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600">
                  <FaGripVertical className="w-5 h-5" />
                </div>
              )}

              {/* Question Number */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                  {index + 1}
                </span>
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                {/* Question Type Badge */}
                <div className="flex items-center gap-2 mb-2">
                  {getQuestionTypeIcon(question.questionType)}
                  <span className="text-xs font-medium text-gray-500">
                    {getQuestionTypeLabel(question.questionType)}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {question.points} point{question.points !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-gray-900 font-medium mb-2">
                  {question.questionText || 'Untitled Question'}
                </p>

                {/* Options Preview */}
                {question.questionType === 'multiple_choice' && question.options && (
                  <div className="space-y-1 mt-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`flex items-center gap-2 text-sm ${
                          question.correctAnswer === optIndex 
                            ? 'text-green-600 font-medium' 
                            : 'text-gray-600'
                        }`}
                      >
                        {question.correctAnswer === optIndex ? (
                          <FaCheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <FaTimesCircle className="w-3 h-3 text-gray-300" />
                        )}
                        <span className="w-5">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span>{option || '(Empty)'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* True/False Preview */}
                {question.questionType === 'true_false' && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`flex items-center gap-1 text-sm ${
                      question.correctAnswer === true ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {question.correctAnswer === true && <FaCheckCircle className="w-3 h-3" />}
                      True
                    </span>
                    <span className={`flex items-center gap-1 text-sm ${
                      question.correctAnswer === false ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {question.correctAnswer === false && <FaCheckCircle className="w-3 h-3" />}
                      False
                    </span>
                  </div>
                )}

                {/* Short Answer Preview */}
                {question.questionType === 'short_answer' && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Expected Answer:</span> {question.correctAnswer || '(None)'}
                  </div>
                )}
              </div>

              {/* Actions */}
              {isEditable && (
                <div className="flex-shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onEdit && onEdit(question, index)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Question"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(question.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Question"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{questions.length}</span> question{questions.length !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{questions.reduce((sum, q) => sum + (q.points || 0), 0)}</span> total points
        </div>
      </div>
    </div>
  );
}
