import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { Clock, Flag, CheckCircle, AlertCircle, BookOpen, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import dayjs from 'dayjs';

const ExamInterface = () => {
  const { t } = useTranslation();
  const { examId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [flagged, setFlagged] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    startOrResumeExam();
    
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!exam || result || !attempt) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        localStorage.setItem(`exam_${examId}_time`, newTime);
        
        if (newTime <= 0) {
          handleSubmit();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, result, attempt]);

  // Auto-save answers every 10 seconds
  useEffect(() => {
    if (!attempt || result) return;
    
    saveTimerRef.current = setTimeout(() => {
      saveCurrentAnswers();
    }, 10000);
    
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [answers, attempt, result]);

  const startOrResumeExam = async () => {
    try {
      const response = await axios.post(
        `${API}/exams/${examId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const examData = response.data.exam;
      const attemptData = response.data.attempt;
      const isResume = response.data.resume;
      
      setExam(examData);
      setAttempt(attemptData);
      setAnswers(attemptData.answers || {});
      
      // Calculate time left
      if (isResume && attemptData.started_at) {
        const startTime = dayjs(attemptData.started_at);
        const elapsed = dayjs().diff(startTime, 'second');
        const totalTime = examData.duration_minutes * 60;
        const remaining = Math.max(0, totalTime - elapsed);
        setTimeLeft(remaining);
        localStorage.setItem(`exam_${examId}_time`, remaining);
      } else {
        const totalTime = examData.duration_minutes * 60;
        setTimeLeft(totalTime);
        localStorage.setItem(`exam_${examId}_time`, totalTime);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to start exam:', error);
      alert(t('common.error') + ': ' + (error.response?.data?.detail || error.message));
      navigate('/dashboard');
    }
  };

  const saveCurrentAnswers = async () => {
    if (!attempt || Object.keys(answers).length === 0 || saving) return;
    
    setSaving(true);
    try {
      // Save each answer
      for (const [questionId, selectedOption] of Object.entries(answers)) {
        await axios.post(
          `${API}/attempts/${attempt.id}/save`,
          { question_id: questionId, selected_option: selectedOption },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
    } catch (error) {
      console.error('Failed to auto-save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerSelect = async (questionId, option) => {
    const newAnswers = {
      ...answers,
      [questionId]: option
    };
    setAnswers(newAnswers);
    localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(newAnswers));
    
    // Save immediately on answer selection
    try {
      await axios.post(
        `${API}/attempts/${attempt.id}/save`,
        { question_id: questionId, selected_option: option },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    const questions = exam.paper1_questions || exam.questions || [];
    const confirmed = window.confirm(
      `${t('exam.submit')}?\n\n${t('exam.question')} ${t('exam.questions')}: ${Object.keys(answers).length}/${questions.length}`
    );
    
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API}/attempts/${attempt.id}/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
      localStorage.removeItem(`exam_${examId}_time`);
      localStorage.removeItem(`exam_${examId}_answers`);
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert(t('common.error') + ': ' + (error.response?.data?.detail || error.message));
      setSubmitting(false);
    }
  };

  const toggleFlag = (questionId) => {
    setFlagged(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-[#92400E]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border-2 border-[#10B981]">
            <div className="text-center mb-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-green-600" style={{fontFamily: 'Manrope, sans-serif'}}>Exam Submitted Successfully!</h1>
              <p className="text-base md:text-lg text-[#6B7280]">Great job completing the exam!</p>
            </div>

            {/* Score Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 md:p-8 mb-6 border-2 border-[#E5E7EB]">
              <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-green-600" style={{fontFamily: 'Manrope, sans-serif'}}>{result.score}</div>
                  <div className="text-xs md:text-sm font-semibold text-[#6B7280]">Your Score</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-[#92400E]" style={{fontFamily: 'Manrope, sans-serif'}}>{result.total}</div>
                  <div className="text-xs md:text-sm font-semibold text-[#6B7280]">Total Marks</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-[#F59E0B]" style={{fontFamily: 'Manrope, sans-serif'}}>{result.percentage}%</div>
                  <div className="text-xs md:text-sm font-semibold text-[#6B7280]">Percentage</div>
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>Performance by Skill</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.skill_percentages || {}).map(([skill, percentage]) => (
                  <div key={skill} className="bg-white border-2 border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-[#374151] capitalize">
                        {t(`skills.${skill}`) || skill.replace(/_/g, ' ')}
                      </span>
                      <span className="text-lg md:text-xl font-bold" style={{color: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444'}}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{
                          width: `${percentage}%`,
                          background: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 bg-[#F59E0B] text-white font-bold rounded-lg hover:bg-[#D97706] transition-all text-base md:text-lg"
              style={{fontFamily: 'Manrope, sans-serif'}}
              data-testid="back-to-dashboard-btn"
            >
              {t('common.backToDashboard')} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = exam.paper1_questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Handle empty exam case
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md text-center border-2 border-[#EF4444]">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-4" style={{fontFamily: 'Manrope, sans-serif'}}>
            Exam Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            This exam does not have any questions yet. Please contact your teacher or try a different exam.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-[#F59E0B] text-white font-bold rounded-lg hover:bg-[#D97706] transition-all"
            style={{fontFamily: 'Manrope, sans-serif'}}
            data-testid="back-to-dashboard-btn"
          >
            {t('common.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-[#92400E]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      {/* Header with Timer */}
      <div className="bg-white shadow-md border-b-4 border-[#F59E0B]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{exam.title}</h1>
                <p className="text-xs md:text-sm text-[#6B7280]">{t('exam.question')} {currentQuestionIndex + 1} / {questions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {saving && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Save className="w-4 h-4 animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg" data-testid="exam-timer">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                data-testid="submit-exam-btn"
              >
                {submitting ? t('common.loading') : t('exam.submit')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-2">
        <div 
          className="bg-[#F59E0B] h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 border-2 border-[#E5E7EB]">
          {/* Question */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] flex-1" style={{fontFamily: 'Manrope, sans-serif'}}>
              {currentQuestion.question_number}. {currentQuestion.question_text}
            </h2>
            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`ml-4 p-2 rounded-lg transition-colors ${
                flagged.has(currentQuestion.id) 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              data-testid="flag-question-btn"
            >
              <Flag className="w-5 h-5" fill={flagged.has(currentQuestion.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((opt, idx) => {
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D, E
              const isSelected = answers[currentQuestion.id] === opt.option_id;
              
              return (
                <button
                  key={opt.option_id}
                  onClick={() => handleAnswerSelect(currentQuestion.id, opt.option_id)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-[#F59E0B] bg-[#FFF7E5] font-semibold'
                      : 'border-[#E5E7EB] hover:border-[#F59E0B] hover:bg-[#FFFBF0]'
                  }`}
                  style={{fontFamily: 'Figtree, sans-serif'}}
                  data-testid={`option-${optionLetter}`}
                >
                  <span className="font-bold text-[#F59E0B] mr-3">{optionLetter}.</span>
                  <span className="text-[#1F2937]">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="prev-question-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('exam.previous')}
          </button>
          
          <div className="text-center">
            <p className="text-sm text-[#6B7280] font-semibold">
              Answered: {answeredCount} / {questions.length}
            </p>
          </div>
          
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-white font-semibold rounded-lg hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="next-question-btn"
          >
            {t('exam.next')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Question Palette */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4 border-2 border-[#E5E7EB]">
          <h3 className="text-sm font-bold text-[#1F2937] mb-3" style={{fontFamily: 'Manrope, sans-serif'}}>Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id];
              const isFlagged = flagged.has(q.id);
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                    isCurrent
                      ? 'bg-[#F59E0B] text-white border-2 border-[#D97706]'
                      : isAnswered
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : isFlagged
                          ? 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                  }`}
                  data-testid={`nav-question-${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
              <span>Flagged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;