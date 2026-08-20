import React, { createContext, useContext, useMemo, useState } from 'react'

const OrchestratorContext = createContext(null)

/**
 * Holds the latest report and a history of orchestration runs, so pages
 * (Dashboard, Orchestrator, History) can share state without a backend.
 */
export function OrchestratorProvider({ children }) {
  const [runs, setRuns] = useState([])
  const [latestReport, setLatestReport] = useState(null)

  const addRun = (run) => {
    setRuns((prev) => [run, ...prev].slice(0, 50))
    setLatestReport(run.report)
  }

  const clearHistory = () => {
    setRuns([])
    setLatestReport(null)
  }

  const stats = useMemo(() => {
    const total = runs.length
    const succeeded = runs.filter((r) => r.status === 'success').length
    const stories = runs.reduce(
      (n, r) => n + (r.report?.productManager?.userStories?.length || 0),
      0,
    )
    const tasks = runs.reduce(
      (n, r) => n + (r.report?.developmentEngineer?.tasks?.length || 0),
      0,
    )
    return { total, succeeded, stories, tasks }
  }, [runs])

  const value = { runs, latestReport, addRun, clearHistory, stats }

  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  )
}

export function useOrchestrator() {
  const ctx = useContext(OrchestratorContext)
  if (!ctx) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider')
  }
  return ctx
}
