# AI-Powered Multi-Agent Requirements Engineering Platform (Frontend)

A React + Vite frontend for the multi-agent requirements engineering workflow.
It lets users upload or paste a **Business Requirements Document (BRD)** and
generates a structured delivery report using three AI agents:

- **Product Manager** — epic, user stories, acceptance criteria
- **Program Manager** — features, dependencies, delivery milestones
- **Development Engineer** — development tasks, technical notes, test tasks

The page is served at the route **`/agentic-workflow`** and connects to the
main agentic-workflow experience.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 — the app redirects to `/agentic-workflow`.

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Backend integration

The app calls:

```
POST /api/agentic-workflow/generate
Request:  { "inputType": "text" | "docx", "content": "<BRD content>" }
Response: { "productManager": {...}, "programManager": {...}, "developmentEngineer": {...} }
```

During development, `/api` is proxied to `VITE_API_TARGET`
(default `http://localhost:8000`) — see [vite.config.js](./vite.config.js).

If no backend is available, the app automatically falls back to a built-in
demo generator so the UI remains fully functional (see
[src/services/api.js](./src/services/api.js)).

## Project structure

```
src/
  components/
    BrdUploader.jsx      # file upload + drag & drop (.docx/.txt)
    BrdTextInput.jsx     # paste BRD text
    WorkflowStepper.jsx  # BRD → PM → PgM → Dev → Report visualization
    AgentOutputCard.jsx  # elegant per-agent result card
    ExportActions.jsx    # export Markdown / DOCX / copy to clipboard
    LoadingWorkflow.jsx  # animated pipeline progression
    icons.jsx            # inline SVG icon set
  pages/
    AgenticWorkflow.jsx  # the main page
  services/
    api.js               # generate report + mock fallback
    exportUtils.js       # Markdown / DOCX / clipboard helpers
  styles/
    global.css           # SAUDIA-inspired theme
```

## Design

SAUDIA-inspired palette: Primary Green `#006C35`, Light Green `#E8F5EE`,
White `#FFFFFF`, Dark Text `#1F2937`, Border Gray `#D1D5DB`.
