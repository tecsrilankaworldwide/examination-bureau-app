import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { TrendingUp, Award, Target, BookOpen, LogOut, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import AcademicLogo from '../components/AcademicLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ParentDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      // Assuming linked student ID is stored in user.linked_student_id
      const studentId = user.linked_student_id || 'student_g5_001'; // Default for demo
      const response = await axios.get(
        `${API}/students/${studentId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgressData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load progress:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-xl font-bold text-[#92400E]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyChartData = progressData?.monthly_progress?.map(month => ({
    month: month.month,
    paper1: month.paper1_score,
    paper2: month.paper2_score,
    total: month.total_score
  })) || [];

  // Prepare skills radar data
  const latestSkills = progressData?.monthly_progress?.[progressData.monthly_progress.length - 1]?.skill_percentages || {};
  const radarData = Object.entries(latestSkills).map(([skill, percentage]) => ({
    skill: t(`skills.${skill}`).substring(0, 12),
    value: percentage
  }));

  const strengths = progressData?.strengths || [];
  const weaknesses = progressData?.weaknesses || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-[#F59E0B]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:pl-48 xl:pl-60 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{t('dashboard.parent')}</h1>
                <p className="text-sm md:text-base text-[#6B7280]">{t('dashboard.welcome')}, <span className="font-semibold text-[#F59E0B]">{user.full_name}</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <LanguageSwitcher />
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
        {!progressData || progressData.total_exams_taken === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center border-2 border-[#E5E7EB]">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2" style={{fontFamily: 'Manrope, sans-serif'}}>
              {t('progress.noData')}
            </h2>
            <p className="text-gray-600">{t('progress.noDataDesc')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FFF7E5] rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{progressData.total_exams_taken}</div>
                    <div className="text-xs font-medium text-[#6B7280]">{t('parent.completedExams')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#10B981]" style={{fontFamily: 'Manrope, sans-serif'}}>
                      {progressData.monthly_progress?.length > 0
                        ? Math.round((progressData.monthly_progress[progressData.monthly_progress.length - 1].total_score / 100) * 100)
                        : '-'}%
                    </div>
                    <div className="text-xs font-medium text-[#6B7280]">{t('parent.avgProgress')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#3B82F6]" style={{fontFamily: 'Manrope, sans-serif'}}>{strengths.length}</div>
                    <div className="text-xs font-medium text-[#6B7280]">{t('progress.strong')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#EF4444]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#EF4444]" style={{fontFamily: 'Manrope, sans-serif'}}>{weaknesses.length}</div>
                    <div className="text-xs font-medium text-[#6B7280]">{t('progress.needsImprovement')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Progress Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E5E7EB]">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
                {t('progress.monthlyProgress')}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="paper1" stroke="#F59E0B" strokeWidth={3} name="Paper 1" />
                  <Line type="monotone" dataKey="paper2" stroke="#3B82F6" strokeWidth={3} name="Paper 2" />
                  <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Skills Radar */}
            {radarData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E5E7EB]">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
                  {t('progress.currentSnapshot')}
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Skills" dataKey="value" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E5E7EB]">
                <h3 className="text-lg font-bold mb-4 text-green-600 flex items-center gap-2" style={{fontFamily: 'Manrope, sans-serif'}}>
                  <Award className="w-5 h-5" />
                  {t('progress.strong')} Skills
                </h3>
                {strengths.length > 0 ? (
                  <div className="space-y-3">
                    {strengths.map(([skill, percentage], idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#374151]">
                          {t(`skills.${skill}`)}
                        </span>
                        <span className="text-lg font-bold text-green-600">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No data available yet.</p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E5E7EB]">
                <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2" style={{fontFamily: 'Manrope, sans-serif'}}>
                  <Target className="w-5 h-5" />
                  {t('progress.needsImprovement')}
                </h3>
                {weaknesses.length > 0 ? (
                  <div className="space-y-3">
                    {weaknesses.map(([skill, percentage], idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#374151]">
                          {t(`skills.${skill}`)}
                        </span>
                        <span className="text-lg font-bold text-red-600">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No data available yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;