import './CommentList.css'

function CommentList({ comments }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (comments.length === 0) {
    return (
      <div className="no-comments">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <span className="comment-author">
              {comment.name || 'Anonymous'}
            </span>
            <span className="comment-date">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <div className="comment-content">
            {comment.content}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentList

