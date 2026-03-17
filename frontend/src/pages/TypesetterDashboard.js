import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://139.59.254.77';

const TypesetterDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  
  // New exam form
  const [newExam, setNewExam] = useState({
    title: '',
    grade: 'grade_5',
    month: '',
    duration_minutes: 60,
    total_marks_paper1: 60
  });

  useEffect(() => {
    if (!user || user.role !== 'typesetter') {
      navigate('/login');
      return;
    }
    fetchExams();
  }, [user, navigate]);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${API}/api/exams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to show only PDF-format exams
      const pdfExams = response.data.exams.filter(exam => exam.exam_format === 'pdf');
      setExams(pdfExams);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API}/api/exams/create-pdf`,
        newExam,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Exam created successfully: ${response.data.title}`);
      setShowCreateModal(false);
      setNewExam({
        title: '',
        grade: 'grade_5',
        month: '',
        duration_minutes: 60,
        total_marks_paper1: 60
      });
      fetchExams();
    } catch (error) {
      alert('Failed to create exam: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUploadPDF = async (examId, language, file) => {
    if (!file) return;
    
    setUploadingPDF(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        `${API}/api/exams/${examId}/upload-pdf/${language}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert(`PDF uploaded successfully for ${language.toUpperCase()}`);
      fetchExams(); // Refresh to show updated status
    } catch (error) {
      alert('Failed to upload PDF: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
        <div className="text-xl font-semibold text-[#1F2937]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-[#F59E0B]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]" style={{fontFamily: 'Figtree, sans-serif'}}>
              📝 Typesetter Dashboard
            </h1>
            <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Create New Exam Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#1F2937]">PDF Exams</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#F59E0B] text-white rounded-lg font-semibold hover:bg-[#D97706] transition"
          >
            + Create New Exam
          </button>
        </div>

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No PDF exams created yet.</p>
            <p className="text-gray-400 mt-2">Click "Create New Exam" to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937]">{exam.title}</h3>
                    <p className="text-gray-600">Grade: {exam.grade.replace('grade_', 'Grade ')} | Month: {exam.month}</p>
                    <p className="text-sm text-gray-500">Duration: {exam.duration_minutes} mins | Marks: {exam.total_marks_paper1}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    exam.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {exam.status}
                  </span>
                </div>

                {/* PDF Upload Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Upload Exam PDFs:</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Sinhala */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">සිංහල (Sinhala)</span>
                        {exam.pdf_path_si && <span className="text-green-500">✓</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleUploadPDF(exam.id, 'si', e.target.files[0])}
                        disabled={uploadingPDF}
                        className="text-sm"
                      />
                      {exam.pdf_path_si && (
                        <p className="text-xs text-green-600 mt-1">PDF uploaded</p>
                      )}
                    </div>

                    {/* Tamil */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">தமிழ் (Tamil)</span>
                        {exam.pdf_path_ta && <span className="text-green-500">✓</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleUploadPDF(exam.id, 'ta', e.target.files[0])}
                        disabled={uploadingPDF}
                        className="text-sm"
                      />
                      {exam.pdf_path_ta && (
                        <p className="text-xs text-green-600 mt-1">PDF uploaded</p>
                      )}
                    </div>

                    {/* English */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">English</span>
                        {exam.pdf_path_en && <span className="text-green-500">✓</span>}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleUploadPDF(exam.id, 'en', e.target.files[0])}
                        disabled={uploadingPDF}
                        className="text-sm"
                      />
                      {exam.pdf_path_en && (
                        <p className="text-xs text-green-600 mt-1">PDF uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Create New PDF Exam</h2>
            <form onSubmit={handleCreateExam}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                    placeholder="e.g., January 2025 - Grade 5 Exam"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Grade</label>
                  <select
                    value={newExam.grade}
                    onChange={(e) => setNewExam({...newExam, grade: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="grade_2">Grade 2</option>
                    <option value="grade_3">Grade 3</option>
                    <option value="grade_4">Grade 4</option>
                    <option value="grade_5">Grade 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Month (YYYY-MM)</label>
                  <input
                    type="month"
                    required
                    value={newExam.month}
                    onChange={(e) => setNewExam({...newExam, month: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-semibold mb-2">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      value={newExam.duration_minutes}
                      onChange={(e) => setNewExam({...newExam, duration_minutes: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-semibold mb-2">Total Marks</label>
                    <input
                      type="number"
                      required
                      value={newExam.total_marks_paper1}
                      onChange={(e) => setNewExam({...newExam, total_marks_paper1: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#F59E0B] text-white rounded-lg font-semibold hover:bg-[#D97706] transition"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypesetterDashboard;
