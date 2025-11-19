import { getToken, removeToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function fetchAPI(endpoint, options = {}) {
  const token = getToken()
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      if (response.status === 401) {
        removeToken()
        window.location.href = '/login'
      }
      throw new Error(data.error || 'An error occurred')
    }
    
    return data
  } catch (error) {
    throw error
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Posts
  getPosts: (published = null) => {
    const query = published !== null ? `?published=${published}` : '?published=false'
    return fetchAPI(`/posts${query}`)
  },
  
  getPostById: (id) => 
    fetchAPI(`/posts/id/${id}`),
  
  createPost: (postData) => 
    fetchAPI('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),
  
  updatePost: (id, postData) => 
    fetchAPI(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),
  
  deletePost: (id) => 
    fetchAPI(`/posts/${id}`, {
      method: 'DELETE',
    }),

  // Comments
  getComments: (postId = null, published = null) => {
    let query = ''
    const params = []
    if (postId) params.push(`postId=${postId}`)
    if (published !== null) params.push(`published=${published}`)
    if (params.length > 0) query = '?' + params.join('&')
    return fetchAPI(`/comments${query}`)
  },
  
  updateComment: (id, commentData) => 
    fetchAPI(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    }),
  
  deleteComment: (id) => 
    fetchAPI(`/comments/${id}`, {
      method: 'DELETE',
    }),
}

export default api

