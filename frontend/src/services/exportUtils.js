// Report export helpers: Markdown, DOCX and clipboard.
import { saveAs } from 'file-saver'
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from 'docx'

/** Normalise an output entry (string or {title, detail}) into a readable line. */
function lineFor(item) {
  if (typeof item === 'string') return item
  if (!item) return ''
  const { title, detail } = item
  if (title && detail) return `${title} — ${detail}`
  return title || detail || ''
}

/** Build a Markdown string from the normalized report. */
export function reportToMarkdown(report) {
  const { productManager: pm, programManager: prog, developmentEngineer: dev } =
    report

  const lines = []
  lines.push('# AI-Powered Requirements Delivery Report', '')

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

export async function copyToClipboard(report) {
  const text = reportToMarkdown(report)
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  // Fallback for insecure contexts.
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

/* ---------- DOCX ---------- */

function heading(text, level) {
  return new Paragraph({ text, heading: level, spacing: { after: 120 } })
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun(text)],
    bullet: { level: 0 },
    spacing: { after: 40 },
  })
}

export async function exportDocx(report) {
  const { productManager: pm, programManager: prog, developmentEngineer: dev } =
    report
  const children = []

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'AI-Powered Requirements Delivery Report',
          bold: true,
          size: 34,
        }),
      ],
      spacing: { after: 240 },
    }),
  )

  children.push(heading('Product Manager', HeadingLevel.HEADING_1))
  if (pm.epic) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Epic: ', bold: true }),
          new TextRun(pm.epic),
        ],
        spacing: { after: 120 },
      }),
    )
  }
  children.push(heading('User Stories', HeadingLevel.HEADING_2))
  pm.userStories.forEach((s) => children.push(bullet(lineFor(s))))
  children.push(heading('Acceptance Criteria', HeadingLevel.HEADING_2))
  pm.acceptanceCriteria.forEach((c) => children.push(bullet(lineFor(c))))

  children.push(heading('Program Manager', HeadingLevel.HEADING_1))
  children.push(heading('Features', HeadingLevel.HEADING_2))
  prog.features.forEach((f) => children.push(bullet(lineFor(f))))
  if (prog.dependencies.length) {
    children.push(heading('Dependencies', HeadingLevel.HEADING_2))
    prog.dependencies.forEach((d) => children.push(bullet(lineFor(d))))
  }
  if (prog.milestones.length) {
    children.push(heading('Delivery Milestones', HeadingLevel.HEADING_2))
    prog.milestones.forEach((m) => children.push(bullet(lineFor(m))))
  }

  children.push(heading('Development Engineer', HeadingLevel.HEADING_1))
  children.push(heading('Development Tasks', HeadingLevel.HEADING_2))
  dev.tasks.forEach((t) => children.push(bullet(lineFor(t))))
  if (dev.technicalNotes.length) {
    children.push(heading('Technical Notes', HeadingLevel.HEADING_2))
    dev.technicalNotes.forEach((n) => children.push(bullet(lineFor(n))))
  }
  if (dev.testTasks.length) {
    children.push(heading('Test Tasks', HeadingLevel.HEADING_2))
    dev.testTasks.forEach((t) => children.push(bullet(lineFor(t))))
  }

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, 'requirements-delivery-report.docx')
}
