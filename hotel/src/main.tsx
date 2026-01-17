import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // File css toàn cục của bro

// 1. IMPORT CÁI NÀY VÀO
import { BrowserRouter } from 'react-router-dom' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. BỌC APP LẠI BẰNG BROWSER ROUTER */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)