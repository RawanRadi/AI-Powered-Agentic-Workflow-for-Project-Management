import React from 'react'
import {
  IconArrow,
  IconFile,
  IconProduct,
  IconProgram,
  IconDev,
  IconCheck,
} from './icons.jsx'

/**
 * The five stages of the agentic delivery pipeline.
 * `id` values align with the agent keys returned by the API.
 */
export const WORKFLOW_STEPS = [
  { id: 'brd', label: 'BRD', caption: 'Input document', Icon: IconFile },
  {
    id: 'productManager',
    label: 'Product Manager',
    caption: 'User stories',
    Icon: IconProduct,
  },
  {
    id: 'programManager',
    label: 'Program Manager',
    caption: 'Features',
    Icon: IconProgram,
  },
  {
    id: 'developmentEngineer',
    label: 'Development Engineer',
    caption: 'Dev tasks',
    Icon: IconDev,
  },
  {
    id: 'report',
    label: 'Delivery Report',
    caption: 'Final output',
    Icon: IconCheck,
  },
]

/**
 * WorkflowStepper
 * Visualises the BRD → PM → PgM → Dev → Report pipeline.
 *
 * Props:
 *  - activeIndex   index of the currently active step (default -1)
 *  - completedTo   steps with index <= completedTo render as done
 *  - orientation   'horizontal' | 'vertical'
 */
export default function WorkflowStepper({
  activeIndex = -1,
  completedTo = -1,
  orientation = 'horizontal',
}) {
  return (
    <div className={`stepper${orientation === 'vertical' ? ' stepper--vertical' : ''}`}>
      {WORKFLOW_STEPS.map((step, i) => {
        const isDone = i <= completedTo
        const isActive = i === activeIndex
        const state = isDone ? ' stepper__node--done' : isActive ? ' stepper__node--active' : ''
        const { Icon } = step
        return (
          <React.Fragment key={step.id}>
            <div className={`stepper__node${state}`}>
              <div className="stepper__badge">
                <Icon width={22} height={22} />
              </div>
              <div>
                <div className="stepper__label">{step.label}</div>
                <div className="stepper__caption">{step.caption}</div>
              </div>
            </div>
            {i < WORKFLOW_STEPS.length - 1 && (
              <div className="stepper__connector" aria-hidden="true">
                <IconArrow width={18} height={18} />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
