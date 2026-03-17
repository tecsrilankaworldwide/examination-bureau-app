import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ExamInterface = () => {
  const { t, i18n } = useTranslation();
  const { examId } = useParams();
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Exam state
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // MCQ state
  const [currentSection, setCurrentSection] = useState('mcq'); // 'mcq' or 'written'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqTimeLeft, setMcqTimeLeft] = useState(3600); // 60 minutes
  const [submittingMCQ, setSubmittingMCQ] = useState(false);
  const [mcqResult, setMcqResult] = useState(null);
  
  // Written state
  const [writtenTimeLeft, setWrittenTimeLeft] = useState(2700); // 45 minutes default
  const [submittingWritten, setSubmittingWritten] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  
  // Timer ref
  const timerRef = useRef(null);

  // Start exam on mount
  useEffect(() => {
    startExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // MCQ Timer
  useEffect(() => {
    if (currentSection !== 'mcq' || !attempt || mcqResult) return;
    
    timerRef.current = setInterval(() => {
      setMcqTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitMCQ(true); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSection, attempt, mcqResult]);

  // Written Timer
  useEffect(() => {
    if (currentSection !== 'written' || examCompleted) return;
    
    timerRef.current = setInterval(() => {
      setWrittenTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitWritten(true); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSection, examCompleted]);

  const startExam = async () => {
    try {
      const response = await axios.post(
        `${API}/exams/${examId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExam(response.data.exam);
      setAttempt(response.data.attempt);
      
      // Resume if needed
      if (response.data.resume) {
        const attemptData = response.data.attempt;
        setMcqAnswers(attemptData.mcq_answers || {});
        
        if (attemptData.status === 'written_in_progress') {
          setCurrentSection('written');
          setMcqResult({ mcq_score: attemptData.mcq_score });
        }
      }
      
      // Set timer based on exam config
      if (response.data.exam) {
        setMcqTimeLeft(response.data.exam.mcq_duration_minutes * 60 || 3600);
        setWrittenTimeLeft(response.data.exam.written_duration_minutes * 60 || 2700);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start exam');
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (questionId, optionId) => {
    const newAnswers = { ...mcqAnswers, [questionId]: optionId };
    setMcqAnswers(newAnswers);
    
    // Auto-save answer
    try {
      await axios.post(
        `${API}/attempts/${attempt.id}/save-mcq`,
        { question_id: questionId, selected_option: optionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save answer');
    }
  };

  const handleSubmitMCQ = async (autoSubmit = false) => {
    if (submittingMCQ) return;
    
    if (!autoSubmit) {
      const confirmed = window.confirm(
        i18n.language === 'si' ? 'MCQ පිළිතුරු යැවීමට අවශ්‍යද?' :
        i18n.language === 'ta' ? 'MCQ பதில்களை சமர்ப்பிக்க வேண்டுமா?' :
        'Submit MCQ answers? You cannot change them after submission.'
      );
      if (!confirmed) return;
    }
    
    setSubmittingMCQ(true);
    
    try {
      const response = await axios.post(
        `${API}/attempts/${attempt.id}/submit-mcq`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMcqResult(response.data);
      setCurrentSection('written');
      setWrittenTimeLeft(response.data.written_duration_minutes * 60 || 2700);
      
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit MCQ');
    } finally {
      setSubmittingMCQ(false);
    }
  };

  const handleSubmitWritten = async (autoSubmit = false) => {
    if (submittingWritten) return;
    
    if (!autoSubmit) {
      const confirmed = window.confirm(
        i18n.language === 'si' ? 'ලිඛිත පත්‍රය යැවීමට අවශ්‍යද? දෙමාපියන්ට ඡායාරූප උඩුගත කිරීමට විනාඩි 5ක් පමණි!' :
        i18n.language === 'ta' ? 'எழுத்துத் தாளை சமர்ப்பிக்க வேண்டுமா? பெற்றோருக்கு புகைப்படங்களை பதிவேற்ற 5 நிமிடங்கள் மட்டுமே!' :
        'Submit written paper? Parent will have only 5 minutes to upload photos!'
      );
      if (!confirmed) return;
    }
    
    setSubmittingWritten(true);
    
    try {
      const response = await axios.post(
        `${API}/attempts/${attempt.id}/submit-written`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExamCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit written paper');
    } finally {
      setSubmittingWritten(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <span className="text-5xl">❌</span>
          <h2 className="text-xl font-bold text-gray-800 mt-4">{error}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Exam Completed - Show success message
  if (examCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-lg text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            {i18n.language === 'si' ? 'විභාගය සම්පූර්ණයි!' :
             i18n.language === 'ta' ? 'தேர்வு முடிந்தது!' :
             'Exam Completed!'}
          </h1>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-lg text-gray-700 mb-2">
              <strong>MCQ Score:</strong> {mcqResult?.mcq_score || 0} / {exam?.mcq_total_questions || 60}
            </p>
            <p className="text-sm text-gray-500">
              Written paper submitted for marking
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 font-medium">
              {i18n.language === 'si' ? '⚠️ දැන් ඔබේ දෙමාපියන් ලොග් වී ලිඛිත පත්‍රයේ ඡායාරූප විනාඩි 5ක් ඇතුළත උඩුගත කළ යුතුයි!' :
               i18n.language === 'ta' ? '⚠️ உங்கள் பெற்றோர் இப்போது உள்நுழைந்து 5 நிமிடங்களுக்குள் எழுத்துத் தாளின் புகைப்படங்களை பதிவேற்ற வேண்டும்!' :
               '⚠️ Your parent must now login and upload photos of written paper within 5 minutes!'}
            </p>
          </div>
          
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            data-testid="logout-for-parent-btn"
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            {i18n.language === 'si' ? 'ලොග් අවුට් වී දෙමාපියන්ට ලොග් වීමට ඉඩ දෙන්න' :
             i18n.language === 'ta' ? 'வெளியேறி பெற்றோரை உள்நுழைய அனுமதிக்கவும்' :
             'Logout & Let Parent Login'}
          </button>
        </div>
      </div>
    );
  }

  // MCQ Section
  if (currentSection === 'mcq') {
    const questions = exam?.mcq_questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    
    if (questions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
            <span className="text-5xl">📝</span>
            <h2 className="text-xl font-bold text-gray-800 mt-4">No MCQ questions available</h2>
            <p className="text-gray-600 mt-2">This exam doesn't have MCQ questions yet.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-md border-b-4 border-orange-400">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{exam?.title}</h1>
                <p className="text-sm text-gray-500">MCQ Section - Question {currentQuestionIndex + 1} / {questions.length}</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timer */}
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                  mcqTimeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
                }`}>
                  ⏱️ {formatTime(mcqTimeLeft)}
                </div>
                
                {/* Submit Button */}
                <button
                  onClick={() => handleSubmitMCQ()}
                  disabled={submittingMCQ}
                  data-testid="submit-mcq-btn"
                  className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {submittingMCQ ? 'Submitting...' : 'Submit MCQ'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-orange-500 h-2 transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <main className="max-w-4xl mx-auto p-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {currentQuestionIndex + 1}. {currentQuestion?.question_text || currentQuestion?.text}
            </h2>
            
            {/* Options */}
            <div className="space-y-3">
              {(currentQuestion?.options || []).map((option, idx) => {
                const optionId = option.option_id || option.id || String.fromCharCode(65 + idx);
                const isSelected = mcqAnswers[currentQuestion?.id] === optionId;
                
                return (
                  <button
                    key={optionId}
                    onClick={() => handleAnswerSelect(currentQuestion?.id, optionId)}
                    data-testid={`option-${optionId}`}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 font-medium' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <span className="font-bold text-orange-500 mr-3">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option.text}
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
              data-testid="prev-btn"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              ← Previous
            </button>
            
            <span className="text-gray-600 font-medium">
              Answered: {Object.keys(mcqAnswers).length} / {questions.length}
            </span>
            
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              data-testid="next-btn"
              className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              Next →
            </button>
          </div>

          {/* Question Navigator */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-gray-700 mb-3">Question Navigator</h3>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = mcqAnswers[q.id];
                const isCurrent = idx === currentQuestionIndex;
                
                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    data-testid={`nav-${idx + 1}`}
                    className={`w-10 h-10 rounded-lg font-medium text-sm ${
                      isCurrent
                        ? 'bg-orange-500 text-white'
                        : isAnswered
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Written Section
  if (currentSection === 'written') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        {/* Header */}
        <header className="bg-white shadow-md border-b-4 border-green-400">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{exam?.title}</h1>
                <p className="text-sm text-gray-500">Written Section</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timer */}
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                  writtenTimeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'
                }`}>
                  ⏱️ {formatTime(writtenTimeLeft)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MCQ Result Banner */}
        {mcqResult && (
          <div className="bg-blue-50 border-b border-blue-200 py-3">
            <div className="max-w-6xl mx-auto px-4">
              <p className="text-blue-700 font-medium">
                ✅ MCQ Submitted! Score: {mcqResult.mcq_score} / {mcqResult.total_mcq || exam?.mcq_total_questions || 60}
              </p>
            </div>
          </div>
        )}

        {/* Written Content */}
        <main className="max-w-4xl mx-auto p-4 mt-6">
          {/* Essay Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">✏️</span> Essay Question
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                {exam?.written_essay_prompt || 
                 (i18n.language === 'si' ? 'ඔබේ පාසලේ ක්‍රීඩා උත්සවය ගැන ඡේද 3-4 කින් ලියන්න.' :
                  i18n.language === 'ta' ? 'உங்கள் பள்ளி விளையாட்டு தினத்தை பற்றி 3-4 பத்திகளில் எழுதுங்கள்.' :
                  'Write 3-4 paragraphs about your school sports day.')}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {i18n.language === 'si' ? 'ඔබේ පිළිතුර පත්‍රයේ ලියන්න. විභාගයෙන් පසු ඔබේ දෙමාපියන් එහි ඡායාරූපයක් උඩුගත කරනු ඇත.' :
               i18n.language === 'ta' ? 'உங்கள் பதிலை தாளில் எழுதுங்கள். தேர்வுக்குப் பிறகு உங்கள் பெற்றோர் அதன் புகைப்படத்தை பதிவேற்றுவார்கள்.' :
               'Write your answer on paper. Your parent will upload a photo of it after the exam.'}
            </p>
          </div>

          {/* Short Answer Questions */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Short Answer Questions
            </h2>
            <div className="space-y-4">
              {(exam?.written_short_questions || [
                'What is the capital of Sri Lanka?',
                'Name three rivers in Sri Lanka.',
                'What is 25 + 37?',
                'Write the Sinhala alphabet vowels.',
                'Name the president of Sri Lanka.'
              ]).map((question, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 font-medium">
                    {idx + 1}. {question}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {i18n.language === 'si' ? 'සියලුම පිළිතුරු ඔබේ පිළිතුරු පත්‍රයේ ලියන්න.' :
               i18n.language === 'ta' ? 'அனைத்து பதில்களையும் உங்கள் பதில் தாளில் எழுதுங்கள்.' :
               'Write all answers on your answer sheet.'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-amber-800 mb-2">
              {i18n.language === 'si' ? '⚠️ වැදගත්:' :
               i18n.language === 'ta' ? '⚠️ முக்கியம்:' :
               '⚠️ Important:'}
            </h3>
            <ul className="text-amber-700 space-y-1 text-sm mb-4">
              <li>• {i18n.language === 'si' ? 'ඔබ යැවීමෙන් පසු, ඔබේ දෙමාපියන්ට ලොග් වීමට විනාඩි 5ක් පමණක් ඇත' :
                      i18n.language === 'ta' ? 'நீங்கள் சமர்ப்பித்த பிறகு, உங்கள் பெற்றோருக்கு உள்நுழைய 5 நிமிடங்கள் மட்டுமே உள்ளது' :
                      'After you submit, your parent has only 5 minutes to login'}</li>
              <li>• {i18n.language === 'si' ? 'දෙමාපියන් ඔබේ ලිඛිත පත්‍රයේ ඡායාරූප උඩුගත කළ යුතුයි' :
                      i18n.language === 'ta' ? 'பெற்றோர் உங்கள் எழுத்துத் தாளின் புகைப்படங்களை பதிவேற்ற வேண்டும்' :
                      'Parent must upload photos of your written paper'}</li>
              <li>• {i18n.language === 'si' ? 'ඡායාරූප උඩුගත නොකළහොත්, ලිඛිත පත්‍රය ලකුණු නොකරනු ඇත' :
                      i18n.language === 'ta' ? 'புகைப்படங்கள் பதிவேற்றப்படாவிட்டால், எழுத்துத் தாள் மதிப்பிடப்படாது' :
                      'If photos are not uploaded, written paper will not be marked'}</li>
            </ul>
          </div>

          <button
            onClick={() => handleSubmitWritten()}
            disabled={submittingWritten}
            data-testid="submit-written-btn"
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl text-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 shadow-lg"
          >
            {submittingWritten ? 'Submitting...' : 
             (i18n.language === 'si' ? 'ලිඛිත පත්‍රය යවන්න' :
              i18n.language === 'ta' ? 'எழுத்துத் தாளை சமர்ப்பிக்கவும்' :
              'Submit Written Paper')}
          </button>
        </main>
      </div>
    );
  }

  return null;
};

export default ExamInterface;
