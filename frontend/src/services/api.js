// API service for the agentic workflow.
//
// Primary integration point:
//   POST /api/agentic-workflow/generate
//   Request:  { inputType: "text" | "docx", content: "<BRD content>" }
//   Response: { productManager, programManager, developmentEngineer }
//
// If the backend is not reachable (e.g. the frontend is running standalone),
// we fall back to a deterministic local mock so the UI stays fully functional.

const GENERATE_ENDPOINT = '/api/agentic-workflow/generate'

/**
 * Generate a structured delivery report from a BRD.
 * @param {{ inputType: 'text'|'docx', content: string }} payload
 * @returns {Promise<{ report: object, source: 'api'|'mock' }>}
 */
export async function generateReport(payload) {
  try {
    const res = await fetch(GENERATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }

    const data = await res.json()
    return { report: normalizeReport(data), source: 'api' }
  } catch (err) {
    // Graceful fallback: keep the experience working without a live backend.
    // eslint-disable-next-line no-console
    console.warn('Falling back to local mock report:', err.message)
    const data = await mockGenerate(payload)
    return { report: normalizeReport(data), source: 'mock' }
  }
}

/**
 * Ensure the report always has the three agent sections with the expected shape,
 * regardless of small differences in the backend response.
 */
function normalizeReport(data = {}) {
  const pm = data.productManager || {}
  const prog = data.programManager || {}
  const dev = data.developmentEngineer || {}

  return {
    productManager: {
      epic: pm.epic || '',
      userStories: toArray(pm.userStories),
      acceptanceCriteria: toArray(pm.acceptanceCriteria),
    },
    programManager: {
      features: toArray(prog.features),
      dependencies: toArray(prog.dependencies),
      milestones: toArray(prog.milestones || prog.deliveryMilestones),
    },
    developmentEngineer: {
      tasks: toArray(dev.tasks || dev.developmentTasks),
      technicalNotes: toArray(dev.technicalNotes),
      testTasks: toArray(dev.testTasks),
    },
  }
}

function toArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

/* -------------------------------------------------------------------------- */
/* Local mock generator                                                        */
/* -------------------------------------------------------------------------- */

function mockGenerate(payload) {
  const content = (payload?.content || '').trim()
  const subject = deriveSubject(content)

  const report = {
    productManager: {
      epic: `Deliver the ${subject} experience described in the BRD`,
      userStories: [
        {
          title: 'Submit a request',
          detail: `As an end user, I want to submit a ${subject} request so that my need is captured and routed correctly.`,
        },
        {
          title: 'Track progress',
          detail: `As a business analyst, I want to track the status of ${subject} items so that I can report progress to stakeholders.`,
        },
        {
          title: 'Receive notifications',
          detail: `As a project manager, I want automated notifications so that I stay informed of ${subject} updates without manual checks.`,
        },
      ],
      acceptanceCriteria: [
        'Submitted requests are validated and persisted before a confirmation is shown.',
        'Status changes are reflected in the dashboard within 5 seconds.',
        'Notifications are delivered to the correct recipients based on role.',
      ],
    },
    programManager: {
      features: [
        {
          title: 'Intake & Routing',
          detail: 'Capture BRD inputs and route work items to the responsible teams automatically.',
        },
        {
          title: 'Progress Dashboard',
          detail: 'A consolidated view of milestones, dependencies and delivery health.',
        },
        {
          title: 'Notification Service',
          detail: 'Role-based, event-driven alerts across email and in-app channels.',
        },
      ],
      dependencies: [
        'Identity & access management for role-based routing.',
        'Central data store shared by the intake and dashboard features.',
      ],
      milestones: [
        { title: 'M1 — Foundations', detail: 'Data model, authentication and intake API ready.' },
        { title: 'M2 — Core Experience', detail: 'Dashboard and routing live for pilot users.' },
        { title: 'M3 — GA', detail: 'Notifications, reporting and hardening complete.' },
      ],
    },
    developmentEngineer: {
      tasks: [
        {
          title: 'TASK-001 · Define data model',
          detail: 'Design and migrate the schema for requests, statuses and audit history.',
        },
        {
          title: 'TASK-002 · Build intake API',
          detail: 'Implement the POST endpoint with validation and persistence.',
        },
        {
          title: 'TASK-003 · Dashboard UI',
          detail: 'Create the progress dashboard with live status updates.',
        },
      ],
      technicalNotes: [
        'Use an event-driven pattern to decouple intake from notifications.',
        'Cache dashboard queries to keep status refresh under 5 seconds.',
      ],
      testTasks: [
        'Unit tests for validation rules on the intake API.',
        'Integration tests covering routing to each responsible team.',
        'End-to-end test for the submit → track → notify flow.',
      ],
    },
  }

  // Simulate agent processing latency for a realistic loading experience.
  return new Promise((resolve) => setTimeout(() => resolve(report), 400))
}

function deriveSubject(content) {
  if (!content) return 'product'
  const firstLine = content.split('\n').find((l) => l.trim().length > 0) || ''
  const words = firstLine.trim().split(/\s+/).slice(0, 6).join(' ')
  return words.length > 2 ? words.toLowerCase() : 'product'
}
