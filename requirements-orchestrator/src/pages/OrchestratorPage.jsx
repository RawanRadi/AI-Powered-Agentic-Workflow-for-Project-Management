import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BrdUploader from '../components/BrdUploader.jsx'
import BrdTextInput from '../components/BrdTextInput.jsx'
import WorkflowStepper from '../components/WorkflowStepper.jsx'
import LoadingWorkflow from '../components/LoadingWorkflow.jsx'
import ReportResults from '../components/ReportResults.jsx'
import ExportActions from '../components/ExportActions.jsx'
import { IconSparkles, IconAlert, IconCheck, IconOrchestrate } from '../components/icons.jsx'
import { orchestrate } from '../services/api.js'
import { useOrchestrator } from '../context/OrchestratorContext.jsx'

// Loading choreography: which pipeline node is "active" over time.
// Indexes map to PIPELINE_STEPS: 1=PM, 2=PgM, 3=Dev.
const LOADING_SEQUENCE = [
  { active: 1, completedTo: 0 },
  { active: 2, completedTo: 1 },
  { active: 3, completedTo: 2 },
]

export default function OrchestratorPage() {
  const navigate = useNavigate()
  const { addRun } = useOrchestrator()

  const [brdText, setBrdText] = useState('')
  const [fileName, setFileName] = useState('')
  const [inputType, setInputType] = useState('text')

  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setError('Please upload a BRD document or paste BRD text before orchestrating.')
      return
    }

    setError('')
    setSuccess('')
    setReport(null)
    setIsLoading(true)
    startLoadingAnimation()

    try {
      const { report: result, source } = await orchestrate({ inputType, content })
      setReport(result)
      setSuccess(
        source === 'mock'
          ? 'Report generated with the built-in demo engine (backend not connected).'
          : 'Delivery report generated successfully.',
      )
      addRun({
        id: `run-${Date.now()}`,
        fileName: fileName || 'Pasted BRD',
        inputType,
        status: 'success',
        source,
        createdAt: new Date().toISOString(),
        report: result,
      })
    } catch (err) {
      setError(`Something went wrong while orchestrating the report: ${err.message}`)
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
    <div className="stack">
      <div className="page-head">
        <h1 className="page-head__title">Orchestrate Requirements</h1>
        <p className="page-head__subtitle">
          Upload or paste a BRD and let the agents produce a structured delivery
          report.
        </p>
      </div>

      {/* Input card */}
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 22,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--color-muted-text)' }}>
            The BRD is processed into epics, features and engineering tasks.
          </span>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {isLoading ? (
              <>
                <span className="spinner" /> Orchestrating…
              </>
            ) : (
              <>
                <IconSparkles width={18} height={18} /> Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="card">
        <WorkflowStepper
          activeIndex={isLoading ? stage.active : -1}
          completedTo={report ? 4 : isLoading ? stage.completedTo : -1}
        />
      </div>

      {/* Results */}
      <div ref={resultsRef}>
        {isLoading && (
          <LoadingWorkflow activeIndex={stage.active} completedTo={stage.completedTo} />
        )}

        {!isLoading && !report && (
          <div className="empty-state">
            <div className="empty-state__icon">
              <IconOrchestrate width={30} height={30} />
            </div>
            <div className="empty-state__title">No report yet</div>
            <p className="empty-state__desc">
              Provide a BRD above and select <strong>Generate Report</strong>.
              The Product Manager, Program Manager and Development Engineer
              outputs will appear here.
            </p>
          </div>
        )}

        {!isLoading && report && (
          <div className="stack">
            {success && (
              <div className="alert alert--success" role="status" style={{ marginTop: 0 }}>
                <IconCheck width={18} height={18} />
                <span>{success}</span>
              </div>
            )}
            <ReportResults report={report} />
            <div className="card card--pad-sm">
              <ExportActions report={report} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
