import { useState } from 'react'
import { api } from '../utils/api'
import './CommentForm.css'

function CommentForm({ postId, onCommentAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!formData.content.trim()) {
      setError('Comment content is required')
      setLoading(false)
      return
    }

    try {
      await api.createComment(postId, formData)
      setSuccess(true)
      setFormData({ name: '', email: '', content: '' })
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <h3>Leave a Comment</h3>
      
      <div className="form-group">
        <label htmlFor="name">Name (optional)</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email (optional)</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Comment *</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your comment here..."
          required
        />
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Comment posted successfully!</div>}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}

export default CommentForm

