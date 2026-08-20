// Export helpers: Markdown, DOCX-friendly HTML, JSON and clipboard.
// DOCX export here uses a Word-compatible HTML blob (.doc) to avoid an extra
// binary dependency; it opens cleanly in Microsoft Word.
import { saveAs } from 'file-saver'

function lineFor(item) {
  if (typeof item === 'string') return item
  if (!item) return ''
  const { title, detail } = item
  if (title && detail) return `${title} — ${detail}`
  return title || detail || ''
}

export function reportToMarkdown(report) {
  const { productManager: pm, programManager: prog, developmentEngineer: dev } =
    report
  const lines = ['# Requirements Delivery Report', '']

  lines.push('## Product Manager', '')
  if (pm.epic) lines.push(`**Epic:** ${pm.epic}`, '')
  lines.push('### User Stories')
  pm.userStories.forEach((s) => lines.push(`- ${lineFor(s)}`))
  lines.push('', '### Acceptance Criteria')
  pm.acceptanceCriteria.forEach((c) => lines.push(`- ${lineFor(c)}`))
  lines.push('')

  lines.push('## Program Manager', '')
  lines.push('### Features')
  prog.features.forEach((f) => lines.push(`- ${lineFor(f)}`))
  if (prog.dependencies.length) {
    lines.push('', '### Dependencies')
    prog.dependencies.forEach((d) => lines.push(`- ${lineFor(d)}`))
  }
  if (prog.milestones.length) {
    lines.push('', '### Delivery Milestones')
    prog.milestones.forEach((m) => lines.push(`- ${lineFor(m)}`))
  }
  lines.push('')

  lines.push('## Development Engineer', '')
  lines.push('### Development Tasks')
  dev.tasks.forEach((t) => lines.push(`- ${lineFor(t)}`))
  if (dev.technicalNotes.length) {
    lines.push('', '### Technical Notes')
    dev.technicalNotes.forEach((n) => lines.push(`- ${lineFor(n)}`))
  }
  if (dev.testTasks.length) {
    lines.push('', '### Test Tasks')
    dev.testTasks.forEach((t) => lines.push(`- ${lineFor(t)}`))
  }
  lines.push('')

  return lines.join('\n')
}

export function exportMarkdown(report) {
  const blob = new Blob([reportToMarkdown(report)], {
    type: 'text/markdown;charset=utf-8',
  })
  saveAs(blob, 'requirements-delivery-report.md')
}

export function exportJson(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  saveAs(blob, 'requirements-delivery-report.json')
}

export async function copyToClipboard(report) {
  const text = reportToMarkdown(report)
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

/* ---------- DOCX (Word-compatible HTML) ---------- */

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function ul(items) {
  return `<ul>${items.map((i) => `<li>${esc(lineFor(i))}</li>`).join('')}</ul>`
}

export function exportDocx(report) {
  const { productManager: pm, programManager: prog, developmentEngineer: dev } =
    report

  const body = `
    <h1>Requirements Delivery Report</h1>
    <h2>Product Manager</h2>
    ${pm.epic ? `<p><strong>Epic:</strong> ${esc(pm.epic)}</p>` : ''}
    <h3>User Stories</h3>${ul(pm.userStories)}
    <h3>Acceptance Criteria</h3>${ul(pm.acceptanceCriteria)}
    <h2>Program Manager</h2>
    <h3>Features</h3>${ul(prog.features)}
    ${prog.dependencies.length ? `<h3>Dependencies</h3>${ul(prog.dependencies)}` : ''}
    ${prog.milestones.length ? `<h3>Delivery Milestones</h3>${ul(prog.milestones)}` : ''}
    <h2>Development Engineer</h2>
    <h3>Development Tasks</h3>${ul(dev.tasks)}
    ${dev.technicalNotes.length ? `<h3>Technical Notes</h3>${ul(dev.technicalNotes)}` : ''}
    ${dev.testTasks.length ? `<h3>Test Tasks</h3>${ul(dev.testTasks)}` : ''}
  `

  const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1F2937; }
      h1 { color: #006C35; }
      h2 { color: #006C35; border-bottom: 1px solid #D1D5DB; padding-bottom: 4px; }
      h3 { color: #00552A; }
    </style></head><body>${body}</body></html>`

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  saveAs(blob, 'requirements-delivery-report.doc')
}
