import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { BookOpen, Clock, Award, TrendingUp, LogOut, FileText } from 'lucide-react';
import AcademicLogo from '../components/AcademicLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const examsRes = await axios.get(`${API}/exams?grade=${user.grade}&status=published`);
      setExams(examsRes.data.exams || []);
      setAttempts([]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  const getGradeDisplay = (grade) => {
    const gradeKey = grade?.replace('grade_', 'grade');
    return t(`common.${gradeKey}`) || grade;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-xl font-bold text-[#92400E]">{t('common.loading')}</p>
        </div>
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
                <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{t('dashboard.student')}</h1>
                <p className="text-sm md:text-base text-[#6B7280]">{t('dashboard.welcome')}, <span className="font-semibold text-[#F59E0B]">{user.full_name}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <div className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg font-bold">
                {getGradeDisplay(user.grade)}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:pl-48 xl:pl-60 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FFF7E5] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{exams.length}</div>
                <div className="text-sm font-medium text-[#6B7280]">{t('exam.available')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#10B981]" style={{fontFamily: 'Manrope, sans-serif'}}>{attempts.length}</div>
                <div className="text-sm font-medium text-[#6B7280]">{t('exam.completed')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3B82F6]" style={{fontFamily: 'Manrope, sans-serif'}}>-</div>
                <div className="text-sm font-medium text-[#6B7280]">{t('exam.avgScore')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Section */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border-2 border-[#E5E7EB]">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
            {t('exam.availableExams')}
          </h2>

          {exams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg text-[#6B7280] font-semibold">{t('progress.noData')}</p>
              <p className="text-sm text-[#9CA3AF] mt-2">{t('auth.needHelp')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map(exam => (
                <div
                  key={exam.id}
                  className="bg-gradient-to-br from-[#FFF7E5] to-white rounded-xl p-6 border-2 border-[#F5E6B3] hover:shadow-lg transition-all"
                  data-testid={`exam-card-${exam.id}`}
                >
                  <h3 className="text-xl font-bold mb-3 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{exam.title}</h3>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FCD34D] rounded-full mb-4">
                    <span className="text-sm font-semibold text-[#92400E]">{t('exam.month')}: {exam.month}</span>
                  </div>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Clock className="w-4 h-4" />
                      <span>{exam.duration_minutes} {t('exam.minutes')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <FileText className="w-4 h-4" />
                      <span>{exam.paper1_questions?.length || 60} {t('exam.questions')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/exam/${exam.id}`)}
                    className="w-full py-3 bg-[#F59E0B] text-white font-bold rounded-lg hover:bg-[#D97706] transition-all"
                    style={{fontFamily: 'Manrope, sans-serif'}}
                    data-testid={`start-exam-button-${exam.id}`}
                  >
                    {t('exam.startExam')} →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
