import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MarkerDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  
  const [view, setView] = useState('pending'); // pending, marking, payments
  const [pendingPapers, setPendingPapers] = useState([]);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [payments, setPayments] = useState({ payments: [], total_pending: 0, total_paid: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Marking form
  const [marks, setMarks] = useState({
    essay_marks: 0,
    short_answer_marks: [],
    comments: ''
  });

  // Fetch pending papers
  const fetchPendingPapers = async () => {
    try {
      const response = await axios.get(`${API}/marker/pending-papers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingPapers(response.data.papers || []);
    } catch (err) {
      setError('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/marker/my-payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (err) {
      console.error('Failed to fetch payments');
    }
  };

  useEffect(() => {
    fetchPendingPapers();
    fetchPayments();
  }, [token]);

  // Claim paper for marking
  const handleClaimPaper = async (attemptId) => {
    try {
      await axios.post(`${API}/marker/claim-paper/${attemptId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const paper = pendingPapers.find(p => p.id === attemptId);
      setCurrentPaper(paper);
      setView('marking');
      setPendingPapers(prev => prev.filter(p => p.id !== attemptId));
      
      // Initialize marking form
      setMarks({
        essay_marks: 0,
        short_answer_marks: Array(15).fill(0),
        comments: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to claim paper');
    }
  };

  // Submit marks
  const handleSubmitMarks = async () => {
    if (!currentPaper) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${API}/marker/submit-marks/${currentPaper.id}`,
        marks,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(`Marks submitted! Written Score: ${response.data.written_score}`);
      setCurrentPaper(null);
      setView('pending');
      fetchPendingPapers();
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit marks');
    } finally {
      setSubmitting(false);
    }
  };

  // Get grade label
  const gradeLabel = (grade) => {
    const labels = {
      'grade_2': 'Grade 2',
      'grade_3': 'Grade 3',
      'grade_4': 'Grade 4',
      'grade_5': 'Grade 5'
    };
    return labels[grade] || grade;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✏️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Paper Marking Portal</h1>
              <p className="text-sm text-gray-500">Anonymous Marking System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-800">{user?.full_name}</p>
              <p className="text-sm text-gray-500">Marker</p>
            </div>
            <button
              onClick={logout}
              data-testid="logout-btn"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('pending')}
            data-testid="tab-pending"
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'pending' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending Papers ({pendingPapers.length})
          </button>
          <button
            onClick={() => setView('payments')}
            data-testid="tab-payments"
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'payments' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Payments
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Pending Papers View */}
        {view === 'pending' && !currentPaper && (
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading papers...</p>
              </div>
            ) : pendingPapers.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                <span className="text-6xl">📄</span>
                <h3 className="text-xl font-bold text-gray-800 mt-4">No Papers Pending</h3>
                <p className="text-gray-600 mt-2">Check back later for new papers to mark</p>
              </div>
            ) : (
              pendingPapers.map(paper => (
                <div key={paper.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {gradeLabel(paper.grade)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="font-mono text-gray-600">{paper.secret_code}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {paper.paper_photos?.length || 0} pages uploaded
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaimPaper(paper.id)}
                      data-testid={`claim-paper-${paper.id}`}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                    >
                      Claim & Mark
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Marking View */}
        {view === 'marking' && currentPaper && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Paper Photos */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Paper: {currentPaper.secret_code}
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {currentPaper.paper_photos?.map((photo, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                      Page {index + 1}
                    </div>
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${photo}`}
                      alt={`Page ${index + 1}`}
                      className="w-full"
                    />
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">No photos uploaded</p>
                )}
              </div>
            </div>

            {/* Marking Form */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Mark Paper</h3>
              
              {/* Essay Marks */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Marks (Out of 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={marks.essay_marks}
                  onChange={(e) => setMarks({ ...marks, essay_marks: parseInt(e.target.value) || 0 })}
                  data-testid="essay-marks"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Short Answer Marks */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Answer Marks
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {marks.short_answer_marks.slice(0, 15).map((mark, index) => (
                    <div key={index} className="text-center">
                      <label className="text-xs text-gray-500">Q{index + 1}</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={mark}
                        onChange={(e) => {
                          const newMarks = [...marks.short_answer_marks];
                          newMarks[index] = parseInt(e.target.value) || 0;
                          setMarks({ ...marks, short_answer_marks: newMarks });
                        }}
                        data-testid={`short-answer-${index}`}
                        className="w-full px-2 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={marks.comments}
                  onChange={(e) => setMarks({ ...marks, comments: e.target.value })}
                  data-testid="marker-comments"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional comments..."
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Written Score:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {marks.essay_marks + marks.short_answer_marks.reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setCurrentPaper(null);
                    setView('pending');
                    fetchPendingPapers();
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitMarks}
                  disabled={submitting}
                  data-testid="submit-marks-btn"
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Marks'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payments View */}
        {view === 'payments' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-sm text-gray-500">Papers Marked</p>
                <p className="text-3xl font-bold text-gray-800">{payments.papers_marked || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-sm text-gray-500">Pending Payment</p>
                <p className="text-3xl font-bold text-orange-500">Rs. {payments.total_pending || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-3xl font-bold text-green-500">Rs. {payments.total_paid || 0}</p>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Payment History</h3>
              {payments.payments?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No payment records yet</p>
              ) : (
                <div className="space-y-3">
                  {payments.payments?.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">Paper Marking</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">Rs. {payment.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkerDashboard;
