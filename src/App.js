import './App.css';
import { use, useState } from 'react';
import DetailPage from './ProjectDetail';
import MainPage from './mainPage/MainPage';

function App() {
  return (
    <>
      <DetailPage/>
      <MainPage/>
    </>
  );
}

export default App;
