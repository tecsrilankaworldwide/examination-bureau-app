import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertCircle, ArrowLeft, Activity } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ProgressReport = () => {
  const { t } = useTranslation();
  const { studentId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await axios.get(
        `${API}/students/${studentId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load progress:', error);
      setLoading(false);
    }
  };

  const getSkillLabel = (skill) => {
    return t(`skills.${skill}`) || skill;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-[#92400E]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!progress || progress.monthly_progress.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] p-6">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-[#6B7280] hover:text-[#F59E0B] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">{t('common.back')}</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-[#E5E7EB]">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2" style={{fontFamily: 'Manrope, sans-serif'}}>{t('progress.noData')}</h2>
            <p className="text-[#6B7280]">{t('progress.noDataDesc')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for line chart
  const lineChartData = progress.monthly_progress.map(month => {
    const data = { month: month.month.substring(5) };
    Object.entries(month.skill_percentages || {}).forEach(([skill, percentage]) => {
      data[getSkillLabel(skill)] = percentage;
    });
    return data;
  });

  // Prepare data for radar chart
  const latestMonth = progress.monthly_progress[progress.monthly_progress.length - 1];
  const radarData = Object.entries(latestMonth.skill_percentages || {}).map(([skill, percentage]) => ({
    skill: getSkillLabel(skill),
    percentage: percentage
  }));

  const skillColors = [
    '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] p-4 md:p-6">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#6B7280] hover:text-[#F59E0B] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">{t('common.backToDashboard')}</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border-2 border-[#F59E0B]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FFF7E5] rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
                {t('progress.title')}
              </h1>
              <p className="text-base md:text-lg text-[#6B7280] font-semibold">{t('progress.skillAnalysis')}</p>
              <p className="text-sm text-[#9CA3AF] mt-1">{t('progress.skillsTracked')}: 10</p>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-[#F59E0B]" />
              <div>
                <div className="text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
                  {progress.overall_average}%
                </div>
                <div className="text-sm font-medium text-[#6B7280]">{t('progress.overallAverage')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-3xl font-bold text-green-600" style={{fontFamily: 'Manrope, sans-serif'}}>
                  {progress.monthly_progress.length}
                </div>
                <div className="text-sm font-medium text-[#6B7280]">{t('progress.examsCompleted')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-[#3B82F6]" />
              <div>
                <div className="text-3xl font-bold text-[#3B82F6]" style={{fontFamily: 'Manrope, sans-serif'}}>
                  10
                </div>
                <div className="text-sm font-medium text-[#6B7280]">{t('progress.skillsTracked')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Radar Chart - Current Skills */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border-2 border-[#E5E7EB]">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
            {t('progress.currentSnapshot')}
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skill %" dataKey="percentage" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Monthly Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border-2 border-[#E5E7EB]">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
            {t('progress.monthlyProgress')}
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {Object.keys(latestMonth.skill_percentages || {}).map((skill, index) => (
                  <Line
                    key={skill}
                    type="monotone"
                    dataKey={getSkillLabel(skill)}
                    stroke={skillColors[index % skillColors.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-[#E5E7EB]">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
            {t('progress.detailedAnalysis')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(latestMonth.skill_percentages || {}).map(([skill, percentage], index) => (
              <div
                key={skill}
                className="p-4 bg-gradient-to-r from-[#FFF7E5] to-white rounded-lg border-2 border-[#F5E6B3]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[#1F2937]">{getSkillLabel(skill)}</span>
                  <span className={`font-bold ${
                    percentage >= 75 ? 'text-green-600' :
                    percentage >= 50 ? 'text-[#F59E0B]' : 'text-red-600'
                  }`}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      percentage >= 75 ? 'bg-green-500' :
                      percentage >= 50 ? 'bg-[#F59E0B]' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#6B7280] mt-2">
                  {percentage >= 75 ? t('progress.strong') :
                   percentage >= 50 ? t('progress.average') : t('progress.needsImprovement')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-[#6B7280]">
          <p>{t('app.copyright')}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressReport;
