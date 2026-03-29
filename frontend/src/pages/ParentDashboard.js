import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ParentDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [uploadStatus, setUploadStatus] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check upload status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(
          `${API}/parent/upload-status/${user?.linked_student_id || 'none'}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUploadStatus(response.data);
      } catch (err) {
        console.error('Upload status check failed');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [user, token]);

  // Fetch student progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (user?.linked_student_user_id) {
          const response = await axios.get(
            `${API}/students/${user.linked_student_user_id}/progress`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStudentProgress(response.data);
        }
      } catch (err) {
        console.error('Progress fetch failed');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, token]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">👨‍👩‍👧</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {i18n.language === 'si' ? 'දෙමාපිය පුවරුව' : 
                   i18n.language === 'ta' ? 'பெற்றோர் டாஷ்போர்டு' : 
                   'Parent Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {i18n.language === 'si' ? 'ශිෂ්‍යයාගේ ප්‍රගතිය නිරීක්ෂණය කරන්න' :
                   i18n.language === 'ta' ? 'மாணவர் முன்னேற்றத்தை கண்காணிக்கவும்' :
                   'Monitor student progress'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                <button 
                  onClick={() => changeLanguage('si')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    i18n.language === 'si' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  සිං
                </button>
                <button 
                  onClick={() => changeLanguage('ta')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    i18n.language === 'ta' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  த
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    i18n.language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-800">{user?.full_name}</p>
                <p className="text-xs text-gray-500">Parent</p>
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
        {/* Upload Alert - Only show when upload is available */}
        {uploadStatus?.upload_available && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-8 text-white shadow-xl animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">📸</span>
                <div>
                  <h2 className="text-2xl font-bold">
                    {i18n.language === 'si' ? 'ලිඛිත පත්‍රය උඩුගත කරන්න!' :
                     i18n.language === 'ta' ? 'எழுதப்பட்ட தாளை பதிவேற்றவும்!' :
                     'Upload Written Paper NOW!'}
                  </h2>
                  <p className="opacity-90">
                    {i18n.language === 'si' ? `ඉතිරි කාලය: ${Math.floor(uploadStatus.remaining_seconds / 60)}:${(uploadStatus.remaining_seconds % 60).toString().padStart(2, '0')}` :
                     i18n.language === 'ta' ? `மீதமுள்ள நேரம்: ${Math.floor(uploadStatus.remaining_seconds / 60)}:${(uploadStatus.remaining_seconds % 60).toString().padStart(2, '0')}` :
                     `Time remaining: ${Math.floor(uploadStatus.remaining_seconds / 60)}:${(uploadStatus.remaining_seconds % 60).toString().padStart(2, '0')}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/parent/upload')}
                data-testid="upload-now-btn"
                className="px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                {i18n.language === 'si' ? 'දැන් උඩුගත කරන්න' :
                 i18n.language === 'ta' ? 'இப்போது பதிவேற்றவும்' :
                 'Upload Now'}
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Student Info */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">👨‍🎓</span>
              {i18n.language === 'si' ? 'ශිෂ්‍යයා' :
               i18n.language === 'ta' ? 'மாணவர்' :
               'Student'}
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="text-gray-400">ID:</span> {user?.linked_student_id || 'N/A'}
              </p>
            </div>
          </div>

          {/* Upload Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              {i18n.language === 'si' ? 'උඩුගත කිරීමේ උපදෙස්' :
               i18n.language === 'ta' ? 'பதிவேற்ற வழிமுறைகள்' :
               'Upload Instructions'}
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• {i18n.language === 'si' ? 'ශිෂ්‍යයා ලිඛිත පත්‍රය සම්පූර්ණ කළ පසු' :
                      i18n.language === 'ta' ? 'மாணவர் எழுத்துத் தாளை முடித்த பிறகு' :
                      'After student completes written paper'}</li>
              <li>• {i18n.language === 'si' ? 'ඡායාරූප උඩුගත කිරීමට විනාඩි 5ක් පමණි' :
                      i18n.language === 'ta' ? 'புகைப்படங்களை பதிவேற்ற 5 நிமிடங்கள் மட்டுமே' :
                      'Only 5 minutes to upload photos'}</li>
              <li>• {i18n.language === 'si' ? 'සියලුම පිටු පැහැදිලිව ඡායාරූප ගන්න' :
                      i18n.language === 'ta' ? 'அனைத்து பக்கங்களையும் தெளிவாக புகைப்படம் எடுக்கவும்' :
                      'Take clear photos of all pages'}</li>
              <li>• {i18n.language === 'si' ? 'උපරිම ඡායාරූප 15' :
                      i18n.language === 'ta' ? 'அதிகபட்சம் 15 புகைப்படங்கள்' :
                      'Maximum 15 photos'}</li>
            </ul>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {i18n.language === 'si' ? 'විභාග ප්‍රතිඵල' :
             i18n.language === 'ta' ? 'தேர்வு முடிவுகள்' :
             'Exam Results'}
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : studentProgress?.results?.length > 0 ? (
            <div className="space-y-4">
              {studentProgress.results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{result.exam?.title}</h4>
                      <p className="text-sm text-gray-500">{result.exam?.month}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{result.total_score}</p>
                      <p className="text-xs text-gray-500">
                        MCQ: {result.mcq_score} | Written: {result.written_score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-5xl">📊</span>
              <p className="text-gray-500 mt-4">
                {i18n.language === 'si' ? 'තවම ප්‍රතිඵල නොමැත' :
                 i18n.language === 'ta' ? 'இன்னும் முடிவுகள் இல்லை' :
                 'No results yet'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
