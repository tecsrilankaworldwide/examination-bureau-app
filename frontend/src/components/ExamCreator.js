import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { X, Plus, Trash2, Save } from 'lucide-react';

const SKILL_AREAS = [
  'mathematical_reasoning',
  'language_proficiency',
  'general_knowledge',
  'comprehension_skills',
  'problem_solving',
  'logical_thinking',
  'spatial_reasoning',
  'memory_recall',
  'analytical_skills',
  'critical_thinking'
];

const ExamCreator = ({ onClose, onCreated }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic Info, 2: Questions
  
  // Exam basic info
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('grade_5');
  const [month, setMonth] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  // Questions
  const [questions, setQuestions] = useState(
    Array(60).fill(null).map((_, idx) => ({
      id: `q${idx + 1}`,
      question_number: idx + 1,
      question_text: '',
      options: [
        { option_id: 'opt_a', text: '', is_correct: false },
        { option_id: 'opt_b', text: '', is_correct: false },
        { option_id: 'opt_c', text: '', is_correct: false },
        { option_id: 'opt_d', text: '', is_correct: false },
        { option_id: 'opt_e', text: '', is_correct: false }
      ],
      correct_option_id: '',
      skill_area: SKILL_AREAS[idx % 10],
      marks: 1
    }))
  );
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = value;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIdx, optionId) => {
    const updated = [...questions];
    updated[qIdx].correct_option_id = optionId;
    updated[qIdx].options = updated[qIdx].options.map(opt => ({
      ...opt,
      is_correct: opt.option_id === optionId
    }));
    setQuestions(updated);
  };

  const handleCreate = async () => {
    // Validate
    if (!title || !grade || !month) {
      alert('Please fill in all basic information');
      return;
    }

    const emptyQuestions = questions.filter(q => !q.question_text || !q.correct_option_id);
    if (emptyQuestions.length > 0) {
      const proceed = window.confirm(
        `Warning: ${emptyQuestions.length} questions are incomplete. Do you want to save as draft?`
      );
      if (!proceed) return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/exams/create`,
        {
          title,
          grade,
          month,
          paper1_questions: questions,
          duration_minutes: durationMinutes,
          total_marks_paper1: 60,
          total_marks_paper2: 40
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('common.success') + '! Exam created as draft.');
      onCreated();
    } catch (error) {
      console.error('Failed to create exam:', error);
      alert(t('common.error') + ': ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-[#E5E7EB] p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
              {t('teacher.createExam')}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">Step {currentStep} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-exam-creator"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Exam Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                  placeholder="e.g., February 2025 - Grade 5 Scholarship Practice Exam"
                  data-testid="exam-title-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">Grade *</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    data-testid="exam-grade-select"
                  >
                    <option value="grade_2">Grade 2</option>
                    <option value="grade_3">Grade 3</option>
                    <option value="grade_4">Grade 4</option>
                    <option value="grade_5">Grade 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">Month (YYYY-MM) *</label>
                  <input
                    type="text"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="2025-02"
                    data-testid="exam-month-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                  min="30"
                  max="120"
                />
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 bg-[#F59E0B] text-white font-bold rounded-lg hover:bg-[#D97706] transition-colors"
                data-testid="next-to-questions-btn"
              >
                Next: Add Questions →
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Question Navigator */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-[#374151]">Question {currentQuestionIndex + 1} of 60</span>
                  <span className="text-xs text-[#6B7280]">
                    Completed: {questions.filter(q => q.question_text && q.correct_option_id).length}/60
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  {questions.map((q, idx) => {
                    const isComplete = q.question_text && q.correct_option_id;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          isCurrent
                            ? 'bg-[#F59E0B] text-white'
                            : isComplete
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Editor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    Question {currentQuestionIndex + 1} Text *
                  </label>
                  <textarea
                    value={currentQuestion.question_text}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'question_text', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] min-h-[100px]"
                    placeholder="Enter the question text..."
                    data-testid="question-text-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">Skill Area</label>
                  <select
                    value={currentQuestion.skill_area}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'skill_area', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    data-testid="skill-area-select"
                  >
                    {SKILL_AREAS.map(skill => (
                      <option key={skill} value={skill}>
                        {t(`skills.${skill}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#374151] mb-2">Options * (Select correct answer)</label>
                  {currentQuestion.options.map((opt, optIdx) => (
                    <div key={opt.option_id} className="flex gap-3 items-center">
                      <input
                        type="radio"
                        name={`correct_${currentQuestionIndex}`}
                        checked={currentQuestion.correct_option_id === opt.option_id}
                        onChange={() => setCorrectAnswer(currentQuestionIndex, opt.option_id)}
                        className="w-5 h-5 text-[#F59E0B]"
                        data-testid={`correct-option-${String.fromCharCode(65 + optIdx)}`}
                      />
                      <span className="font-bold text-[#F59E0B] w-8">{String.fromCharCode(65 + optIdx)}.</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOption(currentQuestionIndex, optIdx, e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        data-testid={`option-${String.fromCharCode(65 + optIdx)}-input`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(59, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === 59}
                  className="px-6 py-3 bg-[#F59E0B] text-white font-semibold rounded-lg hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                >
                  Back to Info
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  data-testid="save-exam-btn"
                >
                  <Save className="w-5 h-5" />
                  {loading ? t('common.loading') : 'Save Exam'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCreator;