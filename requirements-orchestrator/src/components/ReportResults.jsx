import React from 'react'
import AgentOutputCard from './AgentOutputCard.jsx'
import { IconProduct, IconProgram, IconDev } from './icons.jsx'

/**
 * ReportResults
 * Renders the three agent output cards for a normalized report.
 *
 * Props:
 *  - report   normalized report object
 */
export default function ReportResults({ report }) {
  if (!report) return null

  return (
    <div className="results-grid">
      <AgentOutputCard
        title="Product Manager"
        role="Epics, user stories & acceptance criteria"
        Icon={IconProduct}
        blocks={[
          { title: 'Epic', items: report.productManager.epic ? [report.productManager.epic] : [] },
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
  )
}
