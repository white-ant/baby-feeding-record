<template>
  <div class="share-page page-container">
    <div class="header">
      <div class="back-btn" @click="router.back()">‹ 返回</div>
      <h1 class="page-title">共享管理</h1>
      <div v-if="babyStore.currentBaby" class="baby-name">👶 {{ babyStore.currentBaby.name }}</div>
    </div>

    <button class="btn-primary add-share-btn" @click="openAddModal">+ 添加共享</button>

    <div v-if="shares.length > 0" class="share-list">
      <div v-for="share in shares" :key="share.id" class="share-item">
        <div class="share-info">
          <div class="share-avatar">👤</div>
          <div class="share-detail">
            <div class="share-username">{{ share.shared_nickname || share.shared_username }}</div>
            <div class="share-meta">
              <span class="permission-tag" :class="share.permission">
                {{ share.permission === 'record' ? '可记录' : '仅查看' }}
              </span>
            </div>
          </div>
        </div>
        <div class="share-actions">
          <button class="action-btn" @click="togglePermission(share)">
            {{ share.permission === 'view' ? '升级权限' : '降级权限' }}
          </button>
          <button class="action-btn danger" @click="handleDeleteShare(share)">删除</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🔗</div>
      <div class="empty-text">暂无共享</div>
      <div class="empty-hint">点击上方按钮添加共享用户</div>
    </div>

    <div class="public-link-section">
      <div class="section-title">公开链接</div>
      <div v-if="publicShare" class="public-link-card">
        <div class="link-status">
          <div class="status-row">
            <span class="status-label">状态</span>
            <div class="toggle-switch" :class="{ on: publicShare.token_enabled }" @click="togglePublicLink">
              <div class="toggle-knob"></div>
            </div>
          </div>
          <div v-if="publicShare.token_enabled && publicShare.share_token" class="link-row">
            <div class="link-url">{{ publicLinkUrl }}</div>
            <button class="copy-btn" @click="copyLink">复制</button>
          </div>
        </div>
      </div>
      <div v-else class="no-link-hint">暂无公开链接，添加共享后自动生成</div>
    </div>

    <div v-if="showAddModal" class="modal-mask" @click.self="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">添加共享</h3>
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input v-model="addForm.username" type="text" class="form-input" placeholder="输入对方用户名" />
        </div>
        <div class="form-group">
          <label class="form-label">权限</label>
          <div class="permission-select">
            <div class="perm-option" :class="{ active: addForm.permission === 'view' }" @click="addForm.permission = 'view'">仅查看</div>
            <div class="perm-option" :class="{ active: addForm.permission === 'record' }" @click="addForm.permission = 'record'">可记录</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn-primary" :disabled="submitting" @click="submitAddShare">
            {{ submitting ? '添加中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBabyStore } from '@/stores/baby'
import { getShares, addShare, deleteShare, updateShare } from '@/api/shares'

const router = useRouter()
const babyStore = useBabyStore()

const shares = ref([])
const showAddModal = ref(false)
const submitting = ref(false)
const addForm = ref({ username: '', permission: 'view' })

const showToast = ref(false)
const toastMessage = ref('')

const publicShare = computed(() => shares.value.find(s => s.share_token))

const publicLinkUrl = computed(() => {
  if (!publicShare.value?.share_token) return ''
  return `${window.location.origin}/baby-feeding-record/public/${publicShare.value.share_token}`
})

function toast(msg, duration = 2000) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

async function loadShares() {
  if (!babyStore.currentBaby) return
  try {
    const data = await getShares(babyStore.currentBaby.id)
    shares.value = data
  } catch (e) {
    toast(e.message || '加载失败')
  }
}

function openAddModal() {
  addForm.value = { username: '', permission: 'view' }
  showAddModal.value = true
}

async function submitAddShare() {
  if (!addForm.value.username.trim()) {
    toast('请输入用户名')
    return
  }
  submitting.value = true
  try {
    await addShare(babyStore.currentBaby.id, addForm.value.username.trim(), addForm.value.permission)
    toast('添加成功')
    showAddModal.value = false
    await loadShares()
  } catch (e) {
    toast(e.message || '添加失败')
  } finally {
    submitting.value = false
  }
}

async function togglePermission(share) {
  const newPerm = share.permission === 'view' ? 'record' : 'view'
  try {
    await updateShare(share.id, { permission: newPerm })
    toast('权限已更新')
    await loadShares()
  } catch (e) {
    toast(e.message || '更新失败')
  }
}

async function handleDeleteShare(share) {
  try {
    await deleteShare(share.id)
    toast('已删除')
    await loadShares()
  } catch (e) {
    toast(e.message || '删除失败')
  }
}

async function togglePublicLink() {
  if (!publicShare.value) return
  const newEnabled = !publicShare.value.token_enabled
  try {
    await updateShare(publicShare.value.id, { token_enabled: newEnabled })
    toast(newEnabled ? '已启用公开链接' : '已禁用公开链接')
    await loadShares()
  } catch (e) {
    toast(e.message || '操作失败')
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(publicLinkUrl.value)
    toast('链接已复制')
  } catch {
    toast('复制失败，请手动复制')
  }
}

onMounted(() => {
  loadShares()
})
</script>

<style scoped>
.share-page {
  padding: 0 16px;
}

.header {
  padding: 40px 8px 16px;
}

.back-btn {
  font-size: 18px;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 8px;
}

.baby-name {
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;
}

.add-share-btn {
  width: 100%;
  margin-bottom: 20px;
}

.share-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.share-item {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.share-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.share-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.share-detail {
  flex: 1;
}

.share-username {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.permission-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.permission-tag.view {
  background: #fff3e0;
  color: #ff9800;
}

.permission-tag.record {
  background: #e8f5e9;
  color: #4caf50;
}

.share-actions {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  background: var(--card-bg);
  color: var(--text-color);
  transition: all 0.2s;
}

.action-btn:active {
  opacity: 0.7;
}

.action-btn.danger {
  color: var(--danger);
  border-color: var(--danger);
}

.public-link-section {
  margin-top: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-left: 8px;
}

.public-link-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-label {
  font-size: 15px;
  color: var(--text-color);
  font-weight: 500;
}

.toggle-switch {
  width: 50px;
  height: 28px;
  border-radius: 14px;
  background: var(--border-color);
  position: relative;
  transition: background 0.3s;
  cursor: pointer;
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

.link-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
}

.link-url {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  word-break: break-all;
  background: var(--primary-light);
  padding: 8px 12px;
  border-radius: 8px;
}

.copy-btn {
  padding: 8px 14px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s;
}

.copy-btn:active {
  transform: scale(0.95);
}

.no-link-hint {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 18px;
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 16px;
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
  height: 44px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  padding: 0 14px;
  font-size: 15px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-color);
}

.form-input:focus {
  border-color: var(--primary);
}

.permission-select {
  display: flex;
  gap: 12px;
}

.perm-option {
  flex: 1;
  height: 44px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 15px;
  color: var(--text-secondary);
  transition: all 0.2s;
  background: var(--input-bg);
}

.perm-option.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}
</style>
