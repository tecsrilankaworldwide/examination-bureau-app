import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth Context
import { AuthProvider, useAuth } from './AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MarkerDashboard from './pages/MarkerDashboard';
import ExamInterface from './pages/ExamInterface';
import ParentUpload from './pages/ParentUpload';
import ProgressReport from './pages/ProgressReport';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.role === 'student' && <StudentDashboard />}
              {user?.role === 'parent' && <ParentDashboard />}
              {user?.role === 'teacher' && <TeacherDashboard />}
              {user?.role === 'marker' && <MarkerDashboard />}
              {user?.role === 'admin' && <AdminDashboard />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/exam/:examId" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExamInterface />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/parent/upload" 
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentUpload />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/marker" 
          element={
            <ProtectedRoute allowedRoles={['marker', 'teacher', 'admin']}>
              <MarkerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/progress/:studentId" 
          element={
            <ProtectedRoute allowedRoles={['parent', 'teacher', 'admin', 'student']}>
              <ProgressReport />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
