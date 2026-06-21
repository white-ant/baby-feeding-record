import request from './request'

export function getBabies() {
  return request.get('/babies')
}

export function addBaby(data) {
  return request.post('/babies', data)
}

export function updateBaby(id, data) {
  return request.put(`/babies/${id}`, data)
}

export function deleteBaby(id) {
  return request.delete(`/babies/${id}`)
}
