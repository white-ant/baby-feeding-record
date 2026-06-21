import request from './request'

export function login(username, password) {
  return request.post('/auth/login', { username, password })
}

export function register(username, password, nickname) {
  return request.post('/auth/register', { username, password, nickname })
}

export function logout() {
  return request.post('/auth/logout')
}

export function getMe() {
  return request.get('/auth/me')
}
