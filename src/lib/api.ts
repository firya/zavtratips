import axios from 'axios'

// Use absolute path only in development mode
const isDevelopment = import.meta.env.MODE === 'development'
const baseURL = isDevelopment 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
}) 