import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './mainPage/MainPage';
// ProjectCreat 파일을 CreatPage로 import 합니다.
import CreatPage from './ProjectCreat'; 
import DetailPage from './ProjectDetail';

function App() {
  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            {/* 기본 경로('/')에서는 MainPage를 보여줍니다. */}
            <Route path="/" element={<MainPage />} />

            {/* '/create' 경로에 CreatPage 컴포넌트를 연결합니다. */}
            <Route path="/create" element={<CreatPage />} />
            
            {/* 상세 페이지 경로는 나중에 구현할 수 있도록 주석 처리해 둡니다. */}
            <Route path="/detail/:nasaId" element={<DetailPage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

