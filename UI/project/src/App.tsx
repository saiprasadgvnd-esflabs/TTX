import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Questions from './components/Questions';
import Report from './components/Report';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;