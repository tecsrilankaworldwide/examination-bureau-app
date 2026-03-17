import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { PlusCircle, FileText, Users, LogOut, Edit, CheckCircle, BookOpen } from 'lucide-react';
import ExamCreator from '../components/ExamCreator';
import Paper2Marking from '../components/Paper2Marking';
import LanguageSwitcher from '../components/LanguageSwitcher';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showPaper2Marking, setShowPaper2Marking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const examsRes = await axios.get(`${API}/exams`);
      setExams(examsRes.data.exams || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const publishExam = async (examId) => {
    const examToPublish = exams.find(e => e.id === examId);
    if (!examToPublish) {
      alert('Exam not found');
      return;
    }
    
    // Validate exam has questions
    const questionCount = examToPublish.paper1_questions?.length || 0;
    if (questionCount === 0) {
      alert('Cannot publish exam with 0 questions. Please add questions first.');
      return;
    }
    
    if (questionCount < 60) {
      const proceed = window.confirm(
        `Warning: This exam only has ${questionCount}/60 questions. Do you want to publish it anyway?`
      );
      if (!proceed) return;
    }
    
    try {
      await axios.put(
        `${API}/exams/${examId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Exam published successfully!');
      loadData();
    } catch (error) {
      alert('Failed to publish exam: ' + (error.response?.data?.detail || error.message));
    }
  };

  const publishedExams = exams.filter(e => e.status === 'published').length;
  const draftExams = exams.filter(e => e.status === 'draft').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-[#F59E0B]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:pl-48 xl:pl-60 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{t('dashboard.teacher')}</h1>
                <p className="text-sm md:text-base text-[#6B7280]">{t('dashboard.welcome')}, <span className="font-semibold text-[#F59E0B]">{user.full_name}</span></p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => setShowPaper2Marking(true)}
                className="px-3 md:px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                data-testid="paper2-marking-button"
              >
                <BookOpen className="inline w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('teacher.paper2')}</span>
              </button>
              <button
                onClick={() => setShowCreateExam(true)}
                className="px-3 md:px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                data-testid="create-exam-button"
              >
                <PlusCircle className="inline w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('teacher.createExam')}</span>
              </button>
              <button
                onClick={logout}
                className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                data-testid="logout-btn"
              >
                <LogOut className="inline w-4 h-4 mr-1" />
                <span className="hidden md:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:pl-48 xl:pl-60 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFF7E5] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#F59E0B]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{exams.length}</div>
                <div className="text-xs md:text-sm font-medium text-[#6B7280]">{t('teacher.totalExams')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#10B981]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#10B981]" style={{fontFamily: 'Manrope, sans-serif'}}>{publishedExams}</div>
                <div className="text-xs md:text-sm font-medium text-[#6B7280]">{t('teacher.published')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFF7E5] rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 md:w-6 md:h-6 text-[#F59E0B]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#D97706]" style={{fontFamily: 'Manrope, sans-serif'}}>{draftExams}</div>
                <div className="text-xs md:text-sm font-medium text-[#6B7280]">{t('teacher.drafts')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-[#3B82F6]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#3B82F6]" style={{fontFamily: 'Manrope, sans-serif'}}>-</div>
                <div className="text-xs md:text-sm font-medium text-[#6B7280]">{t('teacher.students')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border-2 border-[#E5E7EB]">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
            {t('teacher.examManagement')}
          </h2>

          {exams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg text-[#6B7280] font-semibold">{t('progress.noData')}</p>
              <button
                onClick={() => setShowCreateExam(true)}
                className="mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                {t('teacher.createExam')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map(exam => (
                <div
                  key={exam.id}
                  className="p-4 md:p-6 bg-gradient-to-r from-[#FFF7E5] to-white border-2 border-[#F5E6B3] rounded-xl hover:shadow-lg transition-all"
                  data-testid={`exam-card-${exam.id}`}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{exam.title}</h3>
                      <p className="text-sm text-[#6B7280] mt-1">
                        Grade: {exam.grade.replace('_', ' ').toUpperCase()} | {t('exam.month')}: {exam.month}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {t('exam.questions')}: {exam.paper1_questions?.length || 0} / 60
                      </p>
                      <div className="mt-2">
                        {exam.status === 'published' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-xs">
                            ✓ {t('teacher.published')}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 font-semibold rounded-full text-xs">
                            ✎ {t('teacher.drafts')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {exam.status === 'draft' && (
                        <button
                          onClick={() => publishExam(exam.id)}
                          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm"
                          data-testid={`publish-exam-${exam.id}`}
                        >
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Publish
                        </button>
                      )}
                      <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm">
                        <Edit className="inline w-4 h-4 mr-1" />
                        {t('common.view')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateExam && (
        <ExamCreator
          onClose={() => setShowCreateExam(false)}
          onCreated={() => {
            setShowCreateExam(false);
            loadData();
          }}
        />
      )}

      {showPaper2Marking && (
        <Paper2Marking onClose={() => setShowPaper2Marking(false)} />
      )}
    </div>
  );  
};

export default TeacherDashboard;
