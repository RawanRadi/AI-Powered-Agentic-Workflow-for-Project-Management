import React from 'react'

/** Render one output entry which may be a string or a { title, detail } object. */
function OutputItem({ item }) {
  if (typeof item === 'string') {
    return <li className="output-list__item">{item}</li>
  }
  const { title, detail } = item || {}
  return (
    <li className="output-list__item">
      {title && <strong>{title}</strong>}
      {detail && <span className="output-sub">{detail}</span>}
    </li>
  )
}

function OutputBlock({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="output-block">
      <div className="output-block__title">{title}</div>
      <ul className="output-list">
        {items.map((item, i) => (
          <OutputItem key={i} item={item} />
        ))}
      </ul>
    </div>
  )
}

/**
 * AgentOutputCard
 * Elegant card presenting one agent's outputs.
 *
 * Props:
 *  - title    agent name
 *  - role     short role description
 *  - Icon     icon component
 *  - blocks   [{ title, items }]
 */
export default function AgentOutputCard({ title, role, Icon, blocks }) {
  return (
    <article className="agent-card">
      <header className="agent-card__header">
        <div className="agent-card__avatar">
          {Icon ? <Icon width={22} height={22} /> : null}
        </div>
        <div>
          <div className="agent-card__title">{title}</div>
          <div className="agent-card__role">{role}</div>
        </div>
      </header>
      <div className="agent-card__body">
        {blocks.map((block) => (
          <OutputBlock key={block.title} title={block.title} items={block.items} />
        ))}
      </div>
    </article>
  )
}
