import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import './Home.css'

function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    loadPosts(1)
  }, [])

  const loadPosts = async (page) => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPosts(page, 10)
      setPosts(data.posts || [])
      setPagination(data.pagination || { page, pages: 1, total: 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Loading posts...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="home">
      <div className="container">
        <div className="home-header">
          <h1>Latest Posts</h1>
          {pagination.total > 0 && (
            <p className="post-count">{pagination.total} post{pagination.total !== 1 ? 's' : ''}</p>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post) => (
                <article key={post.id} className="post-card">
                  <Link to={`/post/${post.slug}`} className="post-link">
                    <h2>{post.title}</h2>
                  </Link>
                  <div className="post-meta">
                    <span className="author">
                      By {post.author?.username || post.author?.email || 'Unknown'}
                    </span>
                    {post.publishedAt && (
                      <span className="date">{formatDate(post.publishedAt)}</span>
                    )}
                    {post._count?.comments > 0 && (
                      <span className="comments">
                        {post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="post-excerpt">
                    {post.content.substring(0, 200)}
                    {post.content.length > 200 ? '...' : ''}
                  </p>
                  <Link to={`/post/${post.slug}`} className="read-more">
                    Read more →
                  </Link>
                </article>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => loadPosts(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => loadPosts(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home

