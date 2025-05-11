import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { MainPage } from './pages/mainPage/MainPage';
import { GamePage } from './pages/gamePage/GamePage';
import { BrowserRouter, Route, Routes } from 'react-router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  </BrowserRouter>
);

serviceWorkerRegistration.register();

