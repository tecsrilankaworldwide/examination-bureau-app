import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { X, Save, FileText } from 'lucide-react';

const Paper2Marking = ({ onClose }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [essayMarks, setEssayMarks] = useState(0);
  const [shortAnswerMarks, setShortAnswerMarks] = useState(Array(10).fill(0));
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      // In a real implementation, there would be an endpoint to fetch all paper2 submissions
      // For now, we'll show a placeholder
      setSubmissions([]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      setLoading(false);
    }
  };

  const handleMark = async () => {
    if (!selectedSubmission) return;

    setSaving(true);
    try {
      await axios.put(
        `${API}/paper2/${selectedSubmission.id}/mark`,
        {
          essay_marks: essayMarks,
          short_answer_marks: shortAnswerMarks,
          comments
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Marks saved successfully!');
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (error) {
      console.error('Failed to save marks:', error);
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const updateShortAnswerMark = (index, value) => {
    const updated = [...shortAnswerMarks];
    updated[index] = Math.min(2, Math.max(0, parseInt(value) || 0));
    setShortAnswerMarks(updated);
  };

  const totalShortAnswerMarks = shortAnswerMarks.reduce((sum, mark) => sum + mark, 0);
  const totalMarks = essayMarks + totalShortAnswerMarks;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-[#E5E7EB] p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
              Paper 2 Marking
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">Mark essay and short answer questions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-paper2-marking"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F59E0B] mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-600 mb-2">No Submissions Yet</p>
              <p className="text-gray-500">
                Paper 2 submissions from students will appear here for marking.
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Students submit Paper 2 (Essay + Short Answers) via WhatsApp,
                <br />and teachers can mark them here once submissions are recorded.
              </p>
            </div>
          ) : !selectedSubmission ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select a submission to mark. Total submissions: {submissions.length}
              </p>
              {submissions.map(submission => (
                <div
                  key={submission.id}
                  className="p-4 border-2 border-[#E5E7EB] rounded-lg hover:border-[#F59E0B] cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setEssayMarks(submission.essay_marks || 0);
                    setShortAnswerMarks(submission.short_answer_marks || Array(10).fill(0));
                    setComments(submission.teacher_comments || '');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#1F2937]">Student ID: {submission.student_id}</p>
                      <p className="text-sm text-gray-600">Exam: {submission.exam_id}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted via: {submission.submitted_via}
                      </p>
                    </div>
                    <div className="text-right">
                      {submission.marked_at ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          Marked ({submission.total_marks}/40)
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">Marking Submission</p>
                <p className="text-xs text-blue-700">Student: {selectedSubmission.student_id}</p>
                <p className="text-xs text-blue-700">Exam: {selectedSubmission.exam_id}</p>
              </div>

              {/* Essay Marking */}
              <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#1F2937] mb-4" style={{fontFamily: 'Manrope, sans-serif'}}>
                  Essay Question (Out of 20 marks)
                </h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-[#374151]">Marks:</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={essayMarks}
                    onChange={(e) => setEssayMarks(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-24 px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    data-testid="essay-marks-input"
                  />
                  <span className="text-sm text-gray-600">/ 20</span>
                </div>
              </div>

              {/* Short Answer Marking */}
              <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#1F2937] mb-4" style={{fontFamily: 'Manrope, sans-serif'}}>
                  Short Answer Questions (10 questions, 2 marks each)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Array(10).fill(null).map((_, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[#374151]">Q{idx + 1}</label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        value={shortAnswerMarks[idx]}
                        onChange={(e) => updateShortAnswerMark(idx, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-center"
                        data-testid={`short-answer-${idx + 1}-input`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <span className="text-sm font-semibold text-[#374151]">
                    Total Short Answers: {totalShortAnswerMarks} / 20
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Teacher Comments (Optional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] min-h-[100px]"
                  placeholder="Add any feedback for the student..."
                  data-testid="teacher-comments-input"
                />
              </div>

              {/* Total */}
              <div className="bg-[#FFF7E5] border-2 border-[#F59E0B] rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
                    Total Paper 2 Marks:
                  </span>
                  <span className="text-3xl font-bold text-[#F59E0B]" style={{fontFamily: 'Manrope, sans-serif'}}>
                    {totalMarks} / 40
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleMark}
                  disabled={saving}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  data-testid="save-marks-btn"
                >
                  <Save className="w-5 h-5" />
                  {saving ? t('common.loading') : 'Save Marks'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Paper2Marking;