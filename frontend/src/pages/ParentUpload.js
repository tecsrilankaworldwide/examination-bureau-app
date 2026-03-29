import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ParentUpload = () => {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Check upload status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(
          `${API}/parent/upload-status/${user?.linked_student_id || 'none'}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUploadStatus(response.data);
        if (response.data.upload_available) {
          setRemainingSeconds(Math.floor(response.data.remaining_seconds));
        }
      } catch (err) {
        setError('Failed to check upload status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [user, token]);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds > 0 && uploadStatus?.upload_available) {
      const timer = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setUploadStatus({ ...uploadStatus, upload_available: false, message: 'Upload window expired' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingSeconds, uploadStatus]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 15) {
      setError('Maximum 15 photos allowed');
      return;
    }
    
    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select photos to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('attempt_id', uploadStatus.attempt_id);
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });

      await axios.post(`${API}/parent/upload-photos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Photos uploaded successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Checking upload status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">📸</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Upload Written Paper</h1>
          <p className="text-gray-600 mt-2">ලිඛිත පත්‍රයේ ඡායාරූප උඩුගත කරන්න</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!uploadStatus?.upload_available ? (
            /* Upload Window Not Available */
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <span className="text-5xl">⏳</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {uploadStatus?.message || 'Upload Window Not Available'}
              </h2>
              {uploadStatus?.opens_in_seconds > 0 ? (
                <p className="text-gray-600">
                  Window opens in: {formatTime(Math.floor(uploadStatus.opens_in_seconds))}
                </p>
              ) : (
                <p className="text-gray-600">
                  The upload window has expired or the student hasn't completed the exam yet.
                </p>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            /* Upload Window Open */
            <>
              {/* Timer */}
              <div className={`text-center mb-8 p-6 rounded-xl ${
                remainingSeconds < 60 ? 'bg-red-50 border-2 border-red-300' : 'bg-green-50 border-2 border-green-300'
              }`}>
                <p className="text-sm font-medium text-gray-600 mb-1">Time Remaining</p>
                <p className={`text-5xl font-bold ${
                  remainingSeconds < 60 ? 'text-red-600 animate-pulse' : 'text-green-600'
                }`}>
                  {formatTime(remainingSeconds)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {remainingSeconds < 60 ? 'HURRY! Upload now!' : 'Take clear photos of all pages'}
                </p>
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

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-amber-800 mb-2">Instructions / උපදෙස්:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Take clear photos of all written paper pages</li>
                  <li>• Make sure all text is readable / අකුරු පැහැදිලිව පෙනෙන්න ඕන</li>
                  <li>• Upload all pages in order (Page 1, Page 2, etc.)</li>
                  <li>• Maximum 15 photos allowed / උපරිම ඡායාරූප 15</li>
                </ul>
              </div>

              {/* File Selection */}
              <div className="mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                  data-testid="photo-input"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="select-photos-btn"
                  className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all"
                >
                  <div className="text-center">
                    <span className="text-4xl">📷</span>
                    <p className="mt-2 text-gray-600 font-medium">
                      Click to Select Photos
                    </p>
                    <p className="text-sm text-gray-500">
                      ඡායාරූප තෝරන්න / புகைப்படங்களைத் தேர்ந்தெடுக்கவும்
                    </p>
                  </div>
                </button>
              </div>

              {/* Preview */}
              {previewUrls.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Selected Photos ({previewUrls.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={url}
                          alt={`Page ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-1 text-sm">
                          Page {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                data-testid="upload-btn"
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentUpload;
