import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import './Dashboard.css'

function Dashboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPublished, setShowPublished] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [showPublished])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPosts(showPublished ? null : false)
      setPosts(data.posts || data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (post) => {
    try {
      await api.updatePost(post.id, { published: !post.published })
      loadPosts()
    } catch (err) {
      alert('Error updating post: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      await api.deletePost(id)
      loadPosts()
    } catch (err) {
      alert('Error deleting post: ' + err.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not published'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Loading posts...</div>
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Posts</h1>
          <Link to="/posts/new" className="btn btn-primary">
            + New Post
          </Link>
        </div>

        <div className="filters">
          <button
            onClick={() => setShowPublished(!showPublished)}
            className={`btn btn-secondary btn-sm ${showPublished ? 'active' : ''}`}
          >
            {showPublished ? 'Show All' : 'Show Published Only'}
          </button>
        </div>

        {error && <div className="error">Error: {error}</div>}

        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Create your first post!</p>
            <Link to="/posts/new" className="btn btn-primary">
              Create Post
            </Link>
          </div>
        ) : (
          <div className="posts-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Published</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link to={`/posts/${post.id}/edit`} className="post-title-link">
                        {post.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${post.published ? 'badge-published' : 'badge-draft'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{post.author?.username || post.author?.email || 'Unknown'}</td>
                    <td>{formatDate(post.publishedAt)}</td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className={`btn btn-sm ${post.published ? 'btn-secondary' : 'btn-success'}`}
                        >
                          {post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link
                          to={`/posts/${post.id}/edit`}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

