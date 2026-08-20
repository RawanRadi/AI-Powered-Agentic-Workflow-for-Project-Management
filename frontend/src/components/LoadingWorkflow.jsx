import React from 'react'
import WorkflowStepper from './WorkflowStepper.jsx'

/**
 * LoadingWorkflow
 * Animated progression across the agent pipeline while the report is generated.
 *
 * Props:
 *  - activeIndex   index of the agent currently "working"
 *  - completedTo   index up to which agents have completed
 */
export default function LoadingWorkflow({ activeIndex, completedTo }) {
  return (
    <div className="card loading-workflow">
      <div className="loading-workflow__title">
        <span className="pulse-dot" style={{ display: 'inline-block', marginRight: 10 }} />
        Generating your delivery report…
      </div>
      <p className="loading-workflow__subtitle">
        Agents are collaborating: Product Manager → Program Manager → Development Engineer
      </p>
      <WorkflowStepper activeIndex={activeIndex} completedTo={completedTo} />
    </div>
  )
}
