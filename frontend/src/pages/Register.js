import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_password: '',
    parent_name: '',
    parent_email: '',
    parent_password: '',
    grade: 'grade_5',
    language: 'si'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API}/register-student-parent`, formData);
      setSuccess(`Registration successful! Student ID: ${response.data.student_id}`);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setFormData({ ...formData, language: lang });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => changeLanguage('si')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            i18n.language === 'si' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-100'
          }`}
        >
          සිංහල
        </button>
        <button 
          onClick={() => changeLanguage('ta')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            i18n.language === 'ta' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-100'
          }`}
        >
          தமிழ்
        </button>
        <button 
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            i18n.language === 'en' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-100'
          }`}
        >
          English
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Grade 5 Scholarship Exam</h1>
          <p className="text-gray-600 mt-2">Student & Parent Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Student Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👨‍🎓</span> Student Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  data-testid="student-name"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="ශිෂ්‍යයාගේ නම / Student Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  required
                  data-testid="student-grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="grade_2">Grade 2 / 2 ශ්‍රේණිය</option>
                  <option value="grade_3">Grade 3 / 3 ශ්‍රේණිය</option>
                  <option value="grade_4">Grade 4 / 4 ශ්‍රේණිය</option>
                  <option value="grade_5">Grade 5 / 5 ශ්‍රේණිය</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                <input
                  type="email"
                  required
                  data-testid="student-email"
                  value={formData.student_email}
                  onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="student@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Password</label>
                <input
                  type="password"
                  required
                  data-testid="student-password"
                  value={formData.student_password}
                  onChange={(e) => setFormData({ ...formData, student_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Parent Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👨‍👩‍👧</span> Parent Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  required
                  data-testid="parent-name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="දෙමාපියාගේ නම / Parent Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language / මාධ්‍යය</label>
                <select
                  required
                  data-testid="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="si">සිංහල / Sinhala</option>
                  <option value="ta">தமிழ் / Tamil</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                <input
                  type="email"
                  required
                  data-testid="parent-email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="parent@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Password</label>
                <input
                  type="password"
                  required
                  data-testid="parent-password"
                  value={formData.parent_password}
                  onChange={(e) => setFormData({ ...formData, parent_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Parent will use their email and password to upload photos of the written paper after the exam.
              The upload window is only open for <strong>5 minutes</strong> after the student completes the written section.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Registering...
              </span>
            ) : (
              'Register / ලියාපදිංචි වන්න'
            )}
          </button>

          <p className="text-center text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
