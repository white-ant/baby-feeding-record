import request from './request'

export function getStats(babyId, type) {
  return request.get(`/babies/${babyId}/stats`, { params: { type } })
}
