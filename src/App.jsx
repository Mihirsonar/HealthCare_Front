import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route decider component for root URL /
const HomeRedirect = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(userString);
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication page */}
          <Route path="/login" element={<Login />} />

          {/* Protected Client/User Portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['User', 'Admin']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Administrative Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback routing */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
