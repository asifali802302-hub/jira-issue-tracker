import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Bearer token to all outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jira_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  getAllUsers: () => API.get('/auth/users'),
}

export const projectAPI = {
  getAll: () => API.get('/projects'),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  addMember: (projectId, userId) => API.post(`/projects/${projectId}/members/${userId}`),
}

export const issueAPI = {
  getByProject: (projectId) => API.get(`/issues/project/${projectId}`),
  searchAndFilter: (projectId, params) => API.get(`/issues/project/${projectId}/filter`, { params }),
  getById: (id) => API.get(`/issues/${id}`),
  create: (data) => API.post('/issues', data),
  update: (id, data) => API.put(`/issues/${id}`, data),
  updateStatus: (id, data) => API.patch(`/issues/${id}/status`, data),
  delete: (id) => API.delete(`/issues/${id}`),
}

export const commentAPI = {
  getByIssue: (issueId) => API.get(`/issues/${issueId}/comments`),
  create: (issueId, data) => API.post(`/issues/${issueId}/comments`, data),
  delete: (id) => API.delete(`/comments/${id}`),
}

export default API
