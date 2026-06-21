<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">🍼</div>
      <h1 class="title">婴儿喂奶记录</h1>
      <p class="subtitle">记录宝宝每一天的成长</p>
    </div>

    <div class="login-card">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input
          v-model="username"
          type="text"
          class="form-input"
          placeholder="请输入用户名"
          @keyup.enter="handleLogin"
        />
      </div>
      <div class="form-group">
        <label class="form-label">密码</label>
        <input
          v-model="password"
          type="password"
          class="form-input"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </div>
      <button class="btn-primary login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登 录' }}
      </button>
      <div class="switch-link">
        还没有账号？<router-link to="/register" class="link">去注册</router-link>
      </div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBabyStore } from '@/stores/baby'

const router = useRouter()
const authStore = useAuthStore()
const babyStore = useBabyStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

function toast(msg, duration = 2000) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

async function handleLogin() {
  if (!username.value.trim()) {
    toast('请输入用户名')
    return
  }
  if (!password.value) {
    toast('请输入密码')
    return
  }
  loading.value = true
  try {
    await authStore.login(username.value.trim(), password.value)
    await babyStore.fetchBabies()
    router.replace('/')
  } catch (e) {
    toast(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  font-size: 64px;
  margin-bottom: 12px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-card {
  width: 100%;
  max-width: 340px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(255, 122, 162, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 48px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  background: var(--input-bg);
  color: var(--text-color);
}

.form-input:focus {
  border-color: var(--primary);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.login-btn {
  width: 100%;
  height: 48px;
  margin-top: 8px;
  font-size: 18px;
}

.switch-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}
</style>
