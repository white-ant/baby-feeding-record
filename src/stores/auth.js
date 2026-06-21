import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(data) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function login(username, password) {
    const data = await apiLogin(username, password)
    setAuth(data)
    return data
  }

  async function register(username, password, nickname) {
    const data = await apiRegister(username, password, nickname)
    setAuth(data)
    return data
  }

  async function logout() {
    try {
      await apiLogout()
    } finally {
      token.value = ''
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  async function fetchMe() {
    const data = await getMe()
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
  }

  return { user, token, isLoggedIn, login, register, logout, fetchMe, setAuth }
})
