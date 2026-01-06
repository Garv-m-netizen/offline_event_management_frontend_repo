import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const EventCard = ({ event }) => {
  const navigate = useNavigate()
  const { user, api } = useAuth()
  const [accessRequested, setAccessRequested] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [error, setError] = useState('')

  // Check access status for investors
  useEffect(() => {
    if (user && user.role === 'investor') {
      checkAccessStatus()
    }
  }, [user, event.name])

  const checkAccessStatus = async () => {
    setCheckingAccess(true)
    try {
      await api.get(`/investors/event/${encodeURIComponent(event.name)}`)
      setHasAccess(true)
      setAccessRequested(false)
    } catch (err) {
      // For any error (403 or others), assume no access and not requested
      setHasAccess(false)
      setAccessRequested(false)
    } finally {
      setCheckingAccess(false)
    }
  }

  const handleRequestAccess = async (e) => {
    e.stopPropagation()
    setLoading(true)
    setError('')
    try {
      await api.post('/investors/request-access', {
        event_name: event.name,
      })
      setAccessRequested(true)
      setHasAccess(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request access')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    navigate(`/events/${encodeURIComponent(event.name)}`)
  }

  const statusColor =
    event.status === 'upcoming'
      ? 'bg-green-600'
      : 'bg-gray-600'

  return (
    <div
      onClick={handleCardClick}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-700"
    >
      <div className="h-48 bg-gray-700 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white truncate">
            {event.name}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColor}`}
          >
            {event.status}
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="text-sm text-gray-500">
          <p>
            {new Date(event.event_datetime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {user && user.role === 'investor' && (
          <div className="mt-4">
            {error && (
              <div className="mb-2 text-red-400 text-xs">
                {error}
              </div>
            )}
            {checkingAccess ? (
              <div className="text-gray-400 text-xs">Checking access...</div>
            ) : hasAccess ? (
              <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs rounded">
                Access Granted
              </span>
            ) : accessRequested ? (
              <span className="inline-block px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                Access Requested
              </span>
            ) : (
              <button
                onClick={handleRequestAccess}
                disabled={loading}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Requesting...' : 'Request Access'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard

