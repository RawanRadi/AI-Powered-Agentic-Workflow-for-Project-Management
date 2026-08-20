import React from 'react'
import { Link } from 'react-router-dom'
import { IconAlert } from '../components/icons.jsx'

export default function NotFound() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <IconAlert width={30} height={30} />
      </div>
      <div className="empty-state__title">Page not found</div>
      <p className="empty-state__desc">
        The page you are looking for doesn’t exist.
      </p>
      <div style={{ marginTop: 18 }}>
        <Link to="/dashboard" className="btn btn--primary">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
