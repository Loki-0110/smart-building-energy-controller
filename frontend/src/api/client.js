import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

export function errorMessage(error) {
  return error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong. Check that the backend is running.'
}

export default api
