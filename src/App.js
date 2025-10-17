import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DetailPage from './ProjectDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* define the route with a dynamic nasaId param */}
        <Route path="/detail/:nasaId" element={<DetailPage />} />

        {/* (optional) default route */}
        <Route path="/" element={<div style={{ color: 'white', textAlign: 'center' }}>Home Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;
