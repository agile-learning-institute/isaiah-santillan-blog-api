import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import './Comments.css'

function Comments() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState({ published: null })

  useEffect(() => {
    loadComments()
  }, [filter])

  const loadComments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getComments(null, filter.published)
      setComments(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (comment) => {
    try {
      await api.updateComment(comment.id, { published: !comment.published })
      loadComments()
    } catch (err) {
      alert('Error updating comment: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await api.deleteComment(id)
      loadComments()
    } catch (err) {
      alert('Error deleting comment: ' + err.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading">Loading comments...</div>
  }

  return (
    <div className="comments-page">
      <div className="container">
        <div className="comments-header">
          <h1>Comments</h1>
        </div>

        <div className="filters">
          <button
            onClick={() => setFilter({ published: null })}
            className={`btn btn-secondary btn-sm ${filter.published === null ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter({ published: true })}
            className={`btn btn-secondary btn-sm ${filter.published === true ? 'active' : ''}`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter({ published: false })}
            className={`btn btn-secondary btn-sm ${filter.published === false ? 'active' : ''}`}
          >
            Unpublished
          </button>
        </div>

        {error && <div className="error">Error: {error}</div>}

        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments found.</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-meta">
                    <span className="comment-author">
                      {comment.name || 'Anonymous'}
                    </span>
                    {comment.email && (
                      <span className="comment-email">{comment.email}</span>
                    )}
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.post && (
                      <span className="comment-post">
                        on "{comment.post.title}"
                      </span>
                    )}
                  </div>
                  <span className={`badge ${comment.published ? 'badge-published' : 'badge-draft'}`}>
                    {comment.published ? 'Published' : 'Unpublished'}
                  </span>
                </div>
                <div className="comment-content">
                  {comment.content}
                </div>
                <div className="comment-actions">
                  <button
                    onClick={() => handleTogglePublish(comment)}
                    className={`btn btn-sm ${comment.published ? 'btn-secondary' : 'btn-success'}`}
                  >
                    {comment.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Comments

