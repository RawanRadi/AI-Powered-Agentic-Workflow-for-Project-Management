import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import AppLayout from './components/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import OrchestratorPage from './pages/OrchestratorPage.jsx'
import RunHistory from './pages/RunHistory.jsx'
import NotFound from './pages/NotFound.jsx'
import { OrchestratorProvider } from './context/OrchestratorContext.jsx'

export default function App() {
  return (
    <OrchestratorProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orchestrate" element={<OrchestratorPage />} />
            <Route path="/history" element={<RunHistory />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OrchestratorProvider>
  )
}
