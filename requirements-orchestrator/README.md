# Requirements Orchestrator (Frontend)

A React + Vite single-page app that orchestrates a **Business Requirements
Document (BRD)** through three AI agents into a structured delivery plan:

- **Product Manager** — epic, user stories, acceptance criteria
- **Program Manager** — features, dependencies, delivery milestones
- **Development Engineer** — development tasks, technical notes, test tasks

> Source code only. Install and run in your own environment (see below).

## Getting started

```bash
cd requirements-orchestrator
npm install
npm run dev
```

Vite serves the app at http://localhost:5174 (redirects to `/dashboard`).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Routing

| Route          | Page              | Description                                  |
| -------------- | ----------------- | -------------------------------------------- |
| `/dashboard`   | Dashboard         | Stats, pipeline overview, latest report      |
| `/orchestrate` | Orchestrator      | Upload/paste BRD, generate + export a report |
| `/history`     | Run History       | Session run log                              |
| `*`            | NotFound          | Fallback                                     |

## Backend integration

```
POST /api/agentic-workflow/generate
Request:  { "inputType": "text" | "docx", "content": "<BRD content>" }
Response: { "productManager": {...}, "programManager": {...}, "developmentEngineer": {...} }
```

During development, `/api` is proxied to `VITE_API_TARGET`
(default `http://localhost:8000`) — see [vite.config.js](./vite.config.js).
If no backend is reachable, the app falls back to a built-in demo generator so
the UI stays fully functional (see [src/services/api.js](./src/services/api.js)).

## Structure

```
src/
  components/
    AppLayout.jsx        # sidebar + top bar shell (Outlet)
    BrdUploader.jsx      # upload + drag & drop (.docx/.txt)
    BrdTextInput.jsx     # paste BRD text
    WorkflowStepper.jsx  # BRD → PM → PgM → Dev → Report
    LoadingWorkflow.jsx  # animated pipeline progression
    AgentOutputCard.jsx  # per-agent result card
    ReportResults.jsx    # the three agent cards
    ExportActions.jsx    # Markdown / DOCX / JSON / clipboard
    icons.jsx            # inline SVG icons
  context/
    OrchestratorContext.jsx  # shared runs/report state
  pages/
    Dashboard.jsx
    OrchestratorPage.jsx
    RunHistory.jsx
    NotFound.jsx
  services/
    api.js               # orchestrate() + mock fallback
    exportUtils.js       # export helpers
  styles/
    global.css           # SAUDIA-inspired theme
```

## Design

SAUDIA-inspired palette: Primary Green `#006C35`, Light Green `#E8F5EE`,
White `#FFFFFF`, Dark Text `#1F2937`, Border Gray `#D1D5DB`.
