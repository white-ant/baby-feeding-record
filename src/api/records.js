import request from './request'

export function getRecords(babyId, date) {
  const params = {}
  if (date) params.date = date
  return request.get(`/babies/${babyId}/records`, { params })
}

export function addRecord(babyId, data) {
  return request.post(`/babies/${babyId}/records`, data)
}

export function deleteRecord(babyId, recordId) {
  return request.delete(`/babies/${babyId}/records/${recordId}`)
}
