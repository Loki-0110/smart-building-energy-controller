import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

export function errorMessage(error) {
  const data = error?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (error?.code === 'ECONNABORTED') return 'The backend took too long to respond.'
  if (!error?.response) return 'Cannot reach the backend. Confirm Spring Boot is running at the configured API URL.'
  return `Request failed (${error.response.status}). Please check the submitted data and backend logs.`
}
export default api
