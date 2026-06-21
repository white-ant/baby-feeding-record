import request from './request'

export function addShare(babyId, username, permission) {
  return request.post(`/${babyId}/share`, { username, permission })
}

export function getShares(babyId) {
  return request.get(`/${babyId}/shares`)
}

export function deleteShare(shareId) {
  return request.delete(`/shares/${shareId}`)
}

export function updateShare(shareId, data) {
  return request.patch(`/shares/${shareId}`, data)
}

export function getPublicShare(token) {
  return request.get(`/public/share/${token}`)
}
