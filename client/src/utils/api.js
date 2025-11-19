const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred')
    }
    
    return data
  } catch (error) {
    throw error
  }
}

export const api = {
  // Posts
  getPosts: (page = 1, limit = 10) => 
    fetchAPI(`/posts?page=${page}&limit=${limit}`),
  
  getPostBySlug: (slug) => 
    fetchAPI(`/posts/${slug}`),
  
  // Comments
  getComments: (postId) => 
    fetchAPI(`/comments/post/${postId}`),
  
  createComment: (postId, commentData) => 
    fetchAPI(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),
}

export default api

