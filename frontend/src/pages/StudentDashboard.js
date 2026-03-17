import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`${API}/exams`, {
          params: { grade: user?.grade, status: 'published' }
        });
        setExams(response.data.exams || []);
      } catch (err) {
        setError('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };

    if (user?.grade) {
      fetchExams();
    }
  }, [user, token]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const getGradeLabel = (grade) => {
    const labels = {
      'grade_2': { en: 'Grade 2', si: '2 ශ්‍රේණිය', ta: 'தரம் 2' },
      'grade_3': { en: 'Grade 3', si: '3 ශ්‍රේණිය', ta: 'தரம் 3' },
      'grade_4': { en: 'Grade 4', si: '4 ශ්‍රේණිය', ta: 'தரம் 4' },
      'grade_5': { en: 'Grade 5', si: '5 ශ්‍රේණිය', ta: 'தரம் 5' }
    };
    return labels[grade]?.[i18n.language] || labels[grade]?.en || grade;
  };

  const startExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {i18n.language === 'si' ? 'ශිෂ්‍ත්‍රවෘත්ති විභාගය' : 
                   i18n.language === 'ta' ? 'புலமைப்பரிசில் தேர்வு' : 
                   'Scholarship Exam'}
                </h1>
                <p className="text-sm text-gray-500">{getGradeLabel(user?.grade)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                <button 
                  onClick={() => changeLanguage('si')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    i18n.language === 'si' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  සිං
                </button>
                <button 
                  onClick={() => changeLanguage('ta')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    i18n.language === 'ta' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  த
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    i18n.language === 'en' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-800">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.student_id}</p>
              </div>
              
              <button
                onClick={logout}
                data-testid="logout-btn"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {i18n.language === 'si' ? 'පිටවන්න' : 
                 i18n.language === 'ta' ? 'வெளியேறு' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-2">
            {i18n.language === 'si' ? `ආයුබෝවන් ${user?.full_name}!` :
             i18n.language === 'ta' ? `வணக்கம் ${user?.full_name}!` :
             `Welcome, ${user?.full_name}!`}
          </h2>
          <p className="opacity-90">
            {i18n.language === 'si' ? 'ඔබේ මාසික විභාගය සඳහා සුදානම් වන්න' :
             i18n.language === 'ta' ? 'உங்கள் மாதாந்திர தேர்வுக்கு தயாராகுங்கள்' :
             'Get ready for your monthly exam'}
          </p>
        </div>

        {/* Exam Info Card */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-lg border-l-4 border-blue-500">
          <h3 className="font-bold text-gray-800 mb-3">
            {i18n.language === 'si' ? 'විභාග ව්‍යුහය' :
             i18n.language === 'ta' ? 'தேர்வு அமைப்பு' :
             'Exam Structure'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-blue-800">MCQ Paper</p>
                  <p className="text-sm text-blue-600">60 Questions • 60 Minutes</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✏️</span>
                <div>
                  <p className="font-semibold text-green-800">Written Paper</p>
                  <p className="text-sm text-green-600">Essay + Short Answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Exams */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {i18n.language === 'si' ? 'පවතින විභාග' :
           i18n.language === 'ta' ? 'கிடைக்கும் தேர்வுகள்' :
           'Available Exams'}
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <span className="text-6xl">📋</span>
            <h3 className="text-xl font-bold text-gray-800 mt-4">
              {i18n.language === 'si' ? 'දැනට විභාග නොමැත' :
               i18n.language === 'ta' ? 'தற்போது தேர்வுகள் இல்லை' :
               'No Exams Available'}
            </h3>
            <p className="text-gray-600 mt-2">
              {i18n.language === 'si' ? 'නව විභාග සඳහා පසුව පරීක්ෂා කරන්න' :
               i18n.language === 'ta' ? 'புதிய தேர்வுகளுக்கு பின்னர் சரிபார்க்கவும்' :
               'Check back later for new exams'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map(exam => (
              <div 
                key={exam.id} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                data-testid={`exam-card-${exam.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{exam.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        {getGradeLabel(exam.grade)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{exam.month}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>📝 {exam.mcq_total_questions || 60} MCQ</span>
                      <span>⏱️ {exam.mcq_duration_minutes || 60} min</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startExam(exam.id)}
                    data-testid={`start-exam-${exam.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    {i18n.language === 'si' ? 'ආරම්භ කරන්න' :
                     i18n.language === 'ta' ? 'தொடங்கு' :
                     'Start Exam'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
