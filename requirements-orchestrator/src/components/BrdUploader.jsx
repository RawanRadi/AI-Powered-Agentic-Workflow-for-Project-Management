import React, { useCallback, useRef, useState } from 'react'
import mammoth from 'mammoth'
import { IconUpload, IconFile } from './icons.jsx'

const ACCEPTED = ['.docx', '.txt']

/**
 * BrdUploader
 * File selection + drag-and-drop for .docx / .txt BRD documents.
 * Extracts plain text (mammoth for .docx) and reports it upward.
 *
 * Props:
 *  - onFileLoaded({ name, text, inputType })
 *  - onError(message)
 *  - fileName            currently loaded file name (controlled)
 *  - onClear()
 */
export default function BrdUploader({ onFileLoaded, onError, fileName, onClear }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)

  const readFile = useCallback(
    async (file) => {
      if (!file) return
      const lower = file.name.toLowerCase()
      const isDocx = lower.endsWith('.docx')
      const isTxt = lower.endsWith('.txt')

      if (!isDocx && !isTxt) {
        onError?.('Unsupported file type. Please upload a .docx or .txt file.')
        return
      }

      setIsReading(true)
      try {
        let text = ''
        if (isDocx) {
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          text = result.value
        } else {
          text = await file.text()
        }

        if (!text.trim()) {
          onError?.('The uploaded document appears to be empty.')
          return
        }

        onFileLoaded?.({
          name: file.name,
          text,
          inputType: isDocx ? 'docx' : 'text',
        })
      } catch (err) {
        onError?.(`Could not read the file: ${err.message}`)
      } finally {
        setIsReading(false)
      }
    },
    [onError, onFileLoaded],
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    readFile(e.dataTransfer.files?.[0])
  }

  return (
    <div
      className={`uploader${isDragging ? ' uploader--drag' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      aria-label="Upload a BRD document"
    >
      <div className="uploader__icon">
        <IconUpload />
      </div>
      <div className="uploader__title">
        {isReading ? 'Reading document…' : 'Drag & drop your BRD here'}
      </div>
      <div className="uploader__hint">
        or click to browse · supports {ACCEPTED.join(' and ')}
      </div>

      <div className="uploader__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          <IconUpload width={16} height={16} /> Upload BRD
        </button>
      </div>

      {fileName && (
        <div className="file-chip" onClick={(e) => e.stopPropagation()}>
          <IconFile width={15} height={15} />
          <span>{fileName}</span>
          <button
            type="button"
            className="file-chip__remove"
            aria-label="Remove file"
            onClick={(e) => {
              e.stopPropagation()
              onClear?.()
            }}
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".docx,.txt"
        hidden
        onChange={(e) => {
          readFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
