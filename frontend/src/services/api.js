import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

export const invoiceService = {
  getAll: () => api.get('/api/invoices/').then(r => r.data),
  getOne: (id) => api.get(`/api/invoices/${id}`).then(r => r.data),
  delete: (id) => api.delete(`/api/invoices/${id}`).then(r => r.data),
  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/api/invoices/upload', fd).then(r => r.data)
  },
  getSummary: () => api.get('/api/invoices/stats/summary').then(r => r.data),
  getMonthly: () => api.get('/api/invoices/stats/monthly').then(r => r.data),
}

export const reportService = {
  generate: () => api.post('/api/reports/generate').then(r => r.data),
  list: () => api.get('/api/reports/list').then(r => r.data),
  downloadUrl: (filename) => `${api.defaults.baseURL}/api/reports/download/${filename}`,
}

export const pipelineService = {
  run: () => api.post('/api/pipeline/run').then(r => r.data),
  status: () => api.get('/api/pipeline/status').then(r => r.data),
}

export default api
