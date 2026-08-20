import React from 'react'
import { Link } from 'react-router-dom'
import { useOrchestrator } from '../context/OrchestratorContext.jsx'
import { IconHistory, IconOrchestrate } from '../components/icons.jsx'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function RunHistory() {
  const { runs, clearHistory } = useOrchestrator()

  return (
    <div className="stack">
      <div
        className="page-head"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}
      >
        <div>
          <h1 className="page-head__title">Run History</h1>
          <p className="page-head__subtitle">
            Every orchestration run from this session.
          </p>
        </div>
        {runs.length > 0 && (
          <button type="button" className="btn btn--ghost" onClick={clearHistory}>
            Clear history
          </button>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <IconHistory width={30} height={30} />
          </div>
          <div className="empty-state__title">No runs recorded</div>
          <p className="empty-state__desc">
            Orchestration runs from this session will be listed here. Start one
            from the <Link className="link" to="/orchestrate">Orchestrate</Link>{' '}
            page.
          </p>
        </div>
      ) : (
        <div className="card card--pad-sm">
          <table className="table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Input</th>
                <th>Engine</th>
                <th>Stories</th>
                <th>Tasks</th>
                <th>Status</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>{run.fileName}</td>
                  <td>
                    <span className="badge badge--muted">
                      {run.inputType === 'docx' ? 'DOCX' : 'Text'}
                    </span>
                  </td>
                  <td>{run.source === 'api' ? 'Backend' : 'Demo'}</td>
                  <td>{run.report?.productManager?.userStories?.length ?? 0}</td>
                  <td>{run.report?.developmentEngineer?.tasks?.length ?? 0}</td>
                  <td>
                    <span
                      className={`badge ${
                        run.status === 'success' ? 'badge--success' : 'badge--amber'
                      }`}
                    >
                      {run.status === 'success' ? 'Success' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(run.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <Link to="/orchestrate" className="btn btn--primary">
          <IconOrchestrate width={18} height={18} /> New orchestration
        </Link>
      </div>
    </div>
  )
}
