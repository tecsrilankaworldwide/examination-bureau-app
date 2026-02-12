import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Paper2Submission = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmission();
  }, [examId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/exams/${examId}/paper2/submission`);
      if (response.data.submission) {
        setSubmission(response.data.submission);
      }
    } catch (err) {
      console.error('Failed to load submission:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      await axios.post(
        `${API_URL}/api/exams/${examId}/paper2/submit-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Files uploaded successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="header-title">📸 Paper 2 Submission</h1>
              <p className="header-subtitle">Upload your answer sheets</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          {error && <div className="alert alert-destructive">{error}</div>}

          {submission ? (
            <div className="card">
              <h2 style={{ marginBottom: '1rem' }}>Submission Status</h2>
              <div className="alert alert-success">
                <p><strong>✅ Submission Received</strong></p>
                <p>Your Paper 2 has been submitted and is under review.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                </p>
                {submission.status === 'scored' && submission.score && (
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem' }}>
                    Score: {submission.score}
                  </p>
                )}
              </div>
              
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                You can resubmit by uploading new files below.
              </p>
            </div>
          ) : (
            <div className="alert alert-info">
              <p><strong>ℹ️ No submission yet</strong></p>
              <p>Upload photos of your Paper 2 answer sheets below.</p>
            </div>
          )}

          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Upload Answer Sheets</h2>
            
            <div
              {...getRootProps()}
              style={{
                border: '2px dashed hsl(var(--border))',
                borderRadius: 'var(--radius)',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive ? 'hsl(var(--muted))' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <input {...getInputProps()} />
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
              {isDragActive ? (
                <p>Drop the files here...</p>
              ) : (
                <>
                  <p style={{ fontWeight: '500' }}>Drag & drop answer sheet photos here</p>
                  <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                    or click to select files
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                    Supported: PNG, JPG, JPEG, WEBP
                  </p>
                </>
              )}
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Selected Files ({files.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'hsl(var(--muted) / 0.3)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid hsl(var(--border))'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📄</span>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{file.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline"
                        onClick={() => removeFile(index)}
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={uploading}
                style={{ width: '100%', marginTop: '1.5rem' }}
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Paper2Submission;