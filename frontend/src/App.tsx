import React from 'react';
import logo from './logo.svg';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import InterviewPage from './pages/InterviewPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/interview/:id" element={<InterviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
