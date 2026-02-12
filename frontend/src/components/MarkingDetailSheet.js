import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SKILLS = [
  'Mathematical Reasoning',
  'Language Proficiency',
  'General Knowledge',
  'Comprehension Skills',
  'Problem Solving',
  'Logical Thinking',
  'Spatial Reasoning',
  'Memory & Recall',
  'Analytical Skills',
  'Critical Thinking'
];

const MarkingDetailSheet = ({ submission, open, onClose }) => {
  const { t } = useTranslation();
  
  const [scores, setScores] = useState(
    submission.skill_scores || SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 0 }), {})
  );
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [saving, setSaving] = useState(false);

  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);

  const updateScore = (skill, value) => {
    const numValue = Math.max(0, Math.min(10, parseInt(value) || 0));
    setScores({ ...scores, [skill]: numValue });
  };

  const handleSave = async (finalize = false) => {
    try {
      setSaving(true);
      const skillScores = {};
      SKILLS.forEach((skill, idx) => {
        skillScores[skill] = scores[skill] || 0;
      });

      await axios.put(
        `${API_URL}/api/teacher/paper2/submissions/${submission.id}/score`,
        {
          skill_scores: skillScores,
          feedback: feedback,
          status: finalize ? 'scored' : 'draft'
        }
      );

      alert(finalize ? 'Submission finalized successfully!' : 'Draft saved successfully!');
      if (finalize) {
        onClose();
      }
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 h-full w-full sm:w-[600px] bg-white shadow-2xl overflow-y-auto"
          data-testid="marking-detail-sheet"
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: '#8D153A' }}>
                  {submission.student_name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Grade {submission.student_grade} • {submission.exam_title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                data-testid="close-marking-sheet"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Files Preview */}
            {submission.files && submission.files.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Submitted Files</h3>
                <div className="grid grid-cols-2 gap-3">
                  {submission.files.map((file, idx) => {
                    const filename = file.split('/').pop();
                    const fileUrl = file.startsWith('http') ? file : `${API_URL}${file.replace('uploads', '/api/uploads')}`;
                    
                    return (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <img
                          src={fileUrl}
                          alt={`Page ${idx + 1}`}
                          className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(fileUrl, '_blank')}
                        />
                        <div className="p-2 bg-muted/30">
                          <p className="text-xs truncate">Page {idx + 1}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rubric Scoring */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Skill Assessment (0-10 each)</h3>
              <div className="space-y-4">
                {SKILLS.map((skill, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">{skill}</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={scores[skill] || 0}
                        onChange={(e) => updateScore(skill, e.target.value)}
                        className="w-16 px-2 py-1 border rounded-md text-center"
                        data-testid={`rubric-score-${idx}`}
                      />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => updateScore(skill, i + 1)}
                          className={`flex-1 h-2 rounded ${
                            i < (scores[skill] || 0)
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                          data-testid={`rubric-bar-${idx}-${i}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('comments')}</label>
              <textarea
                rows={5}
                placeholder="Add feedback for the student..."
                className="w-full p-3 border rounded-md resize-none"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                data-testid="rubric-comment-textarea"
              />
            </div>

            {/* Total Score */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{t('total_score')}:</span>
                <span className="text-3xl font-bold" style={{ color: '#8D153A' }}>
                  {totalScore} / 100
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="btn btn-outline flex-1"
                data-testid="save-draft-button"
              >
                {saving ? 'Saving...' : t('save_draft')}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="btn btn-primary flex-1"
                data-testid="finalize-button"
                style={{ backgroundColor: '#137B10' }}
              >
                {saving ? 'Finalizing...' : t('finalize')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MarkingDetailSheet;