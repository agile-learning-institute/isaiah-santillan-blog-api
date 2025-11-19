import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import CommentForm from '../components/CommentForm'
import CommentList from '../components/CommentList'
import './PostDetail.css'

function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPost()
  }, [slug])

  useEffect(() => {
    if (post?.id) {
      loadComments()
    }
  }, [post?.id])

  const loadPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPostBySlug(slug)
      setPost(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const data = await api.getComments(post?.id)
      setComments(data || [])
    } catch (err) {
      console.error('Error loading comments:', err)
    }
  }

  const handleCommentAdded = () => {
    loadComments()
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
    return <div className="loading">Loading post...</div>
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Post not found</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="post-detail">
      <div className="container">
        <Link to="/" className="back-link">← Back to all posts</Link>
        
        <article className="post-content">
          <header className="post-header">
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span className="author">
                By {post.author?.username || post.author?.email || 'Unknown'}
              </span>
              {post.publishedAt && (
                <span className="date">{formatDate(post.publishedAt)}</span>
              )}
            </div>
          </header>
          
          <div 
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </article>

        <section className="comments-section">
          <h2>Comments ({comments.length})</h2>
          
          <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
          
          <CommentList comments={comments} />
        </section>
      </div>
    </div>
  )
}

export default PostDetail

