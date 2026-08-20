import React from 'react'
import { Link } from 'react-router-dom'
import { useOrchestrator } from '../context/OrchestratorContext.jsx'
import ReportResults from '../components/ReportResults.jsx'
import ExportActions from '../components/ExportActions.jsx'
import WorkflowStepper from '../components/WorkflowStepper.jsx'
import {
  IconOrchestrate,
  IconHistory,
  IconProduct,
  IconDev,
  IconCheck,
} from '../components/icons.jsx'

function Stat({ Icon, label, value }) {
  return (
    <div className="stat">
      <div className="stat__icon">
        <Icon width={20} height={20} />
      </div>
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const { stats, latestReport, runs } = useOrchestrator()

  return (
    <div className="stack">
      <div className="page-head">
        <h1 className="page-head__title">Dashboard</h1>
        <p className="page-head__subtitle">
          Orchestrate Business Requirements Documents into structured delivery
          plans with Product Manager, Program Manager and Development Engineer
          agents.
        </p>
      </div>

      <div className="grid-3">
        <Stat Icon={IconHistory} label="Total runs" value={stats.total} />
        <Stat Icon={IconCheck} label="Succeeded" value={stats.succeeded} />
        <Stat Icon={IconProduct} label="User stories" value={stats.stories} />
        <Stat Icon={IconDev} label="Dev tasks" value={stats.tasks} />
      </div>

      <div className="card">
        <div className="page-head" style={{ marginBottom: 16 }}>
          <h2 className="page-head__title" style={{ fontSize: 18 }}>
            The orchestration pipeline
          </h2>
          <p className="page-head__subtitle">
            A transparent, agent-by-agent flow from document to delivery plan.
          </p>
        </div>
        <WorkflowStepper completedTo={latestReport ? 4 : -1} />
        <div style={{ marginTop: 20 }}>
          <Link to="/orchestrate" className="btn btn--primary btn--lg">
            <IconOrchestrate width={18} height={18} /> Start an orchestration
          </Link>
        </div>
      </div>

      {latestReport ? (
        <>
          <div className="page-head">
            <h2 className="page-head__title" style={{ fontSize: 18 }}>
              Latest delivery report
            </h2>
            <p className="page-head__subtitle">
              {runs.length > 0 && runs[0].fileName
                ? `Source: ${runs[0].fileName}`
                : 'From your most recent run.'}
            </p>
          </div>
          <ReportResults report={latestReport} />
          <div className="card card--pad-sm">
            <ExportActions report={latestReport} />
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">
            <IconOrchestrate width={30} height={30} />
          </div>
          <div className="empty-state__title">No orchestration runs yet</div>
          <p className="empty-state__desc">
            Head to the <strong>Orchestrate</strong> page, provide a BRD, and
            your latest delivery report will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
