import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import BrdUploader from '../components/BrdUploader.jsx'
import BrdTextInput from '../components/BrdTextInput.jsx'
import WorkflowStepper from '../components/WorkflowStepper.jsx'
import LoadingWorkflow from '../components/LoadingWorkflow.jsx'
import AgentOutputCard from '../components/AgentOutputCard.jsx'
import ExportActions from '../components/ExportActions.jsx'
import {
  IconWorkflow,
  IconSparkles,
  IconProduct,
  IconProgram,
  IconDev,
  IconAlert,
  IconCheck,
} from '../components/icons.jsx'
import { generateReport } from '../services/api.js'

// Loading choreography: which pipeline node is "active" over time.
// Indexes map to WORKFLOW_STEPS: 1=PM, 2=PgM, 3=Dev.
const LOADING_SEQUENCE = [
  { active: 1, completedTo: 0 },
  { active: 2, completedTo: 1 },
  { active: 3, completedTo: 2 },
]

export default function AgenticWorkflow() {
  const [brdText, setBrdText] = useState('')
  const [fileName, setFileName] = useState('')
  const [inputType, setInputType] = useState('text')

  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reportSource, setReportSource] = useState(null)

  const resultsRef = useRef(null)
  const loadingTimer = useRef(null)

  useEffect(() => () => clearInterval(loadingTimer.current), [])

  const handleFileLoaded = ({ name, text, inputType: type }) => {
    setError('')
    setFileName(name)
    setBrdText(text)
    setInputType(type)
  }

  const handleClearFile = () => {
    setFileName('')
    setInputType('text')
  }

  const startLoadingAnimation = () => {
    setLoadingStage(0)
    let stage = 0
    loadingTimer.current = setInterval(() => {
      stage = Math.min(stage + 1, LOADING_SEQUENCE.length - 1)
      setLoadingStage(stage)
    }, 700)
  }

  const handleGenerate = async () => {
    const content = brdText.trim()
    if (!content) {
      setError('Please upload a BRD document or paste BRD text before generating.')
      return
    }

    setError('')
    setSuccess('')
    setReport(null)
    setReportSource(null)
    setIsLoading(true)
    startLoadingAnimation()

    try {
      const { report: result, source } = await generateReport({
        inputType,
        content,
      })
      setReport(result)
      setReportSource(source)
      setSuccess(
        source === 'mock'
          ? 'Report generated with the built-in demo engine (backend not connected).'
          : 'Delivery report generated successfully.',
      )
    } catch (err) {
      setError(`Something went wrong while generating the report: ${err.message}`)
    } finally {
      clearInterval(loadingTimer.current)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (report && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [report])

  const canGenerate = brdText.trim().length > 0 && !isLoading
  const stage = LOADING_SEQUENCE[loadingStage]

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/agentic-workflow" className="brand">
            <span className="brand__logo">
              <IconWorkflow width={20} height={20} />
            </span>
            Requirements Engineering Platform
          </Link>
          <Link to="/agentic-workflow" className="topbar__link">
            Agentic Workflow
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="hero__eyebrow">
              <IconSparkles width={14} height={14} /> Multi-Agent AI
            </span>
            <h1 className="hero__title">
              AI-Powered Multi-Agent Requirements Engineering Platform
            </h1>
            <p className="hero__desc">
              Upload or paste a Business Requirements Document and let three
              specialized AI agents — Product Manager, Program Manager and
              Development Engineer — turn it into a structured, executive-ready
              delivery report.
            </p>
          </div>
          <div className="hero__art">
            <HeroArt />
          </div>
        </div>
      </section>

      <main className="container" style={{ paddingBottom: 48 }}>
        {/* Input card */}
        <section className="section" aria-label="Provide your BRD">
          <div className="section__head">
            <h2 className="section__title">Provide your BRD</h2>
            <p className="section__subtitle">
              Upload a .docx or .txt file, drag &amp; drop, or paste the text
              directly.
            </p>
          </div>

          <div className="card">
            <div className="grid-2">
              <BrdUploader
                onFileLoaded={handleFileLoaded}
                onError={setError}
                fileName={fileName}
                onClear={handleClearFile}
              />
              <BrdTextInput
                value={brdText}
                onChange={(text) => {
                  setBrdText(text)
                  if (!fileName) setInputType('text')
                }}
              />
            </div>

            {error && (
              <div className="alert alert--error" role="alert">
                <IconAlert width={18} height={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="input-card__footer">
              <span className="input-card__footer-hint">
                Your document is processed to generate epics, features and tasks.
              </span>
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" /> Generating…
                  </>
                ) : (
                  <>
                    <IconSparkles width={18} height={18} /> Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Workflow visualization */}
        <section className="section" aria-label="Workflow">
          <div className="section__head">
            <h2 className="section__title">How it works</h2>
            <p className="section__subtitle">
              A transparent, agent-by-agent pipeline from document to delivery
              plan.
            </p>
          </div>
          <div className="card">
            <WorkflowStepper
              activeIndex={isLoading ? stage.active : -1}
              completedTo={report ? 4 : isLoading ? stage.completedTo : -1}
            />
          </div>
        </section>

        {/* Results / loading / empty */}
        <section className="section" aria-label="Results" ref={resultsRef}>
          <div className="section__head">
            <h2 className="section__title">Delivery report</h2>
            <p className="section__subtitle">
              Structured output from each specialized agent.
            </p>
          </div>

          {isLoading && (
            <LoadingWorkflow
              activeIndex={stage.active}
              completedTo={stage.completedTo}
            />
          )}

          {!isLoading && !report && <EmptyState />}

          {!isLoading && report && (
            <>
              {success && (
                <div className="alert alert--success" role="status" style={{ marginTop: 0, marginBottom: 20 }}>
                  <IconCheck width={18} height={18} />
                  <span>{success}</span>
                </div>
              )}

              <div className="results-grid">
                <AgentOutputCard
                  title="Product Manager"
                  role="Epics, user stories & acceptance criteria"
                  Icon={IconProduct}
                  blocks={[
                    report.productManager.epic
                      ? { title: 'Epic', items: [report.productManager.epic] }
                      : { title: 'Epic', items: [] },
                    { title: 'User Stories', items: report.productManager.userStories },
                    { title: 'Acceptance Criteria', items: report.productManager.acceptanceCriteria },
                  ]}
                />
                <AgentOutputCard
                  title="Program Manager"
                  role="Features, dependencies & milestones"
                  Icon={IconProgram}
                  blocks={[
                    { title: 'Features', items: report.programManager.features },
                    { title: 'Dependencies', items: report.programManager.dependencies },
                    { title: 'Delivery Milestones', items: report.programManager.milestones },
                  ]}
                />
                <AgentOutputCard
                  title="Development Engineer"
                  role="Development tasks, technical notes & tests"
                  Icon={IconDev}
                  blocks={[
                    { title: 'Development Tasks', items: report.developmentEngineer.tasks },
                    { title: 'Technical Notes', items: report.developmentEngineer.technicalNotes },
                    { title: 'Test Tasks', items: report.developmentEngineer.testTasks },
                  ]}
                />
              </div>

              <div className="card" style={{ marginTop: 22 }}>
                <div className="section__head" style={{ marginBottom: 14 }}>
                  <h3 className="section__title" style={{ fontSize: 18 }}>
                    Export
                  </h3>
                  <p className="section__subtitle">
                    Share the report with your team in one click.
                  </p>
                </div>
                <ExportActions report={report} />
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span>© {new Date().getFullYear()} Requirements Engineering Platform</span>
          <span>
            Connected to <Link to="/agentic-workflow">/agentic-workflow</Link>
            {reportSource === 'api' ? ' · live backend' : ''}
          </span>
        </div>
      </footer>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <IconWorkflow width={30} height={30} />
      </div>
      <div className="empty-state__title">No report yet</div>
      <p className="empty-state__desc">
        Provide a BRD above and select <strong>Generate Report</strong>. Your
        Product Manager, Program Manager and Development Engineer outputs will
        appear here.
      </p>
    </div>
  )
}

/** Decorative hero illustration of the agent pipeline. */
function HeroArt() {
  return (
    <svg
      className="workflow-icon"
      viewBox="0 0 320 260"
      role="img"
      aria-label="Multi-agent workflow illustration"
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#006C35" />
          <stop offset="1" stopColor="#04824a" />
        </linearGradient>
      </defs>
      <rect x="112" y="10" width="96" height="46" rx="12" fill="#fff" stroke="#D1D5DB" />
      <text x="160" y="38" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1F2937">
        BRD
      </text>

      <line x1="160" y1="56" x2="160" y2="86" stroke="#006C35" strokeWidth="2" />
      <rect x="70" y="86" width="180" height="42" rx="12" fill="#E8F5EE" stroke="#006C35" />
      <text x="160" y="112" textAnchor="middle" fontSize="12" fontWeight="600" fill="#006C35">
        Product Manager
      </text>

      <line x1="160" y1="128" x2="160" y2="150" stroke="#006C35" strokeWidth="2" />
      <rect x="70" y="150" width="180" height="42" rx="12" fill="#E8F5EE" stroke="#006C35" />
      <text x="160" y="176" textAnchor="middle" fontSize="12" fontWeight="600" fill="#006C35">
        Program Manager
      </text>

      <line x1="160" y1="192" x2="160" y2="214" stroke="#006C35" strokeWidth="2" />
      <rect x="70" y="214" width="180" height="42" rx="12" fill="url(#g)" />
      <text x="160" y="240" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
        Development Engineer
      </text>
    </svg>
  )
}
