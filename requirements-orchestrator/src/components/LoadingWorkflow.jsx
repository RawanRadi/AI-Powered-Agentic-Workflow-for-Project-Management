import React from 'react'
import WorkflowStepper from './WorkflowStepper.jsx'

/**
 * LoadingWorkflow
 * Animated progression across the agent pipeline while a report is generated.
 *
 * Props:
 *  - activeIndex   index of the agent currently "working"
 *  - completedTo   index up to which agents have completed
 */
export default function LoadingWorkflow({ activeIndex, completedTo }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
        <span className="pulse-dot" style={{ display: 'inline-block', marginRight: 10 }} />
        Orchestrating your delivery report…
      </div>
      <p style={{ color: 'var(--color-muted-text)', fontSize: 14, marginBottom: 26 }}>
        Agents are collaborating: Product Manager → Program Manager → Development Engineer
      </p>
      <WorkflowStepper activeIndex={activeIndex} completedTo={completedTo} />
    </div>
  )
}
