import React from 'react'
import { IconText } from './icons.jsx'

/**
 * BrdTextInput
 * Large controlled text area for pasting BRD content directly.
 *
 * Props:
 *  - value
 *  - onChange(text)
 */
export default function BrdTextInput({ value, onChange }) {
  return (
    <div>
      <label className="field-label" htmlFor="brd-textarea">
        <span>
          <IconText width={15} height={15} /> Paste BRD text
        </span>
        <span className="field-label__count">
          {value.length.toLocaleString()} characters
        </span>
      </label>
      <textarea
        id="brd-textarea"
        className="textarea"
        placeholder="Paste your Business Requirements Document here. Include goals, scope, users, and functional requirements for the best results…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
