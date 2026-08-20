import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AgenticWorkflow from './pages/AgenticWorkflow.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main page this platform connects to */}
        <Route path="/agentic-workflow" element={<AgenticWorkflow />} />
        <Route path="/" element={<Navigate to="/agentic-workflow" replace />} />
        <Route path="*" element={<Navigate to="/agentic-workflow" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
