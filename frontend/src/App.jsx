import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import AuthProvider from './context/AuthContext';
import Home from './components/home/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;