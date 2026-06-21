<template>
  <div class="profile-page page-container">
    <div class="header">
      <h1 class="page-title">我的</h1>
    </div>

    <div class="user-card">
      <div class="user-avatar">👤</div>
      <div class="user-info">
        <div class="user-nickname">{{ authStore.user?.nickname || authStore.user?.username || '' }}</div>
        <div class="user-username">@{{ authStore.user?.username || '' }}</div>
      </div>
    </div>

    <div class="settings-section">
      <div class="setting-item" @click="themeStore.toggleTheme()">
        <div class="setting-left">
          <span class="setting-icon">{{ themeStore.isDark ? '🌙' : '☀️' }}</span>
          <span class="setting-label">深色模式</span>
        </div>
        <div class="toggle-switch" :class="{ on: themeStore.isDark }">
          <div class="toggle-knob"></div>
        </div>
      </div>

      <div class="setting-item" @click="goToShare">
        <div class="setting-left">
          <span class="setting-icon">🔗</span>
          <span class="setting-label">共享管理</span>
        </div>
        <span class="setting-arrow">›</span>
      </div>
    </div>

    <button class="logout-btn" @click="showLogoutModal = true">退出登录</button>

    <div v-if="showLogoutModal" class="modal-mask" @click.self="showLogoutModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认退出</h3>
        <p class="confirm-text">确定要退出登录吗？</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showLogoutModal = false">取消</button>
          <button class="btn-danger" @click="handleLogout">确认退出</button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useBabyStore } from '@/stores/baby'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const babyStore = useBabyStore()

const showLogoutModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

function toast(msg, duration = 2000) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

function goToShare() {
  if (!babyStore.currentBaby) {
    toast('请先选择一个宝宝')
    return
  }
  if (!babyStore.isOwner) {
    toast('仅宝宝所有者可管理共享')
    return
  }
  router.push('/share')
}

async function handleLogout() {
  try {
    await authStore.logout()
    router.replace('/login')
  } catch (e) {
    toast('退出失败')
  }
  showLogoutModal.value = false
}
</script>

<style scoped>
.profile-page {
  padding: 0 16px;
}

.header {
  padding: 40px 8px 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(255, 122, 162, 0.1);
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-nickname {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 4px;
}

.user-username {
  font-size: 14px;
  color: var(--text-secondary);
}

.settings-section {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.setting-item:active {
  background: var(--border-color);
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  font-size: 22px;
}

.setting-label {
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
}

.setting-arrow {
  font-size: 22px;
  color: var(--text-secondary);
  font-weight: 300;
}

.toggle-switch {
  width: 50px;
  height: 28px;
  border-radius: 14px;
  background: var(--border-color);
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle-switch.on {
  background: var(--primary);
}

.toggle-knob {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.toggle-switch.on .toggle-knob {
  transform: translateX(22px);
}

.logout-btn {
  width: 100%;
  height: 50px;
  background: var(--card-bg);
  color: var(--danger);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:active {
  background: var(--border-color);
}

.confirm-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 8px;
}
</style>
