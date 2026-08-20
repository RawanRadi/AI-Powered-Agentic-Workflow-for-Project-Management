import React, { useState } from 'react'
import { IconMarkdown, IconDocx, IconJson, IconCopy, IconCheck } from './icons.jsx'
import {
  exportMarkdown,
  exportDocx,
  exportJson,
  copyToClipboard,
} from '../services/exportUtils.js'

/**
 * ExportActions
 * Export the report as Markdown, DOCX, JSON, or copy to clipboard.
 *
 * Props:
 *  - report   the normalized report object
 */
export default function ExportActions({ report }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard errors are non-fatal */
    }
  }

  return (
    <div className="export-actions">
      <button type="button" className="btn btn--ghost" onClick={() => exportMarkdown(report)}>
        <IconMarkdown width={16} height={16} /> Export Markdown
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => exportDocx(report)}>
        <IconDocx width={16} height={16} /> Export DOCX
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => exportJson(report)}>
        <IconJson width={16} height={16} /> Export JSON
      </button>
      <button type="button" className="btn btn--ghost" onClick={handleCopy}>
        {copied ? <IconCheck width={16} height={16} /> : <IconCopy width={16} height={16} />}
        {copied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
    </div>
  )
}
