import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DetailPage from './ProjectDetail'; // 파일 이름이 ProjectDetail.js라고 가정
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 기본 경로('/')에서는 홈 화면을 보여줍니다. */}
          <Route path="/" element={
            <div style={{ textAlign: 'center', color: 'white', paddingTop: '100px' }}>
              <h1>AstroLens 갤러리</h1>
              <p>아래 버튼을 눌러 상세 페이지로 이동하세요.</p>
              
              {/* ✅ 1. 이동할 때 샘플 ID를 URL에 포함시켜줍니다. */}
              <Link to="/detail/PIA04921"> 
                <button className="btn btn-primary btn-lg">
                  상세 정보 보러가기
                </button>
              </Link>
            </div>
          } />
          
          {/* ✅ 2. :nasaId를 추가해 URL의 ID를 변수로 받을 수 있게 합니다. */}
          <Route path="/detail/:nasaId" element={<DetailPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;