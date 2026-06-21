<template>
  <div class="babies-page page-container">
    <div class="header">
      <h1 class="page-title">宝宝管理</h1>
      <button class="btn-primary add-btn" @click="openAddModal">+ 添加宝宝</button>
    </div>

    <div v-if="ownBabies.length > 0" class="section">
      <div class="section-title">我的宝宝</div>
      <div class="baby-list">
        <div v-for="baby in ownBabies" :key="baby.id" class="baby-card" :class="{ selected: babyStore.currentBaby?.id === baby.id }">
          <div class="baby-info" @click="babyStore.setCurrentBaby(baby)">
            <div class="baby-avatar">{{ baby.gender === '女' ? '👧' : '👦' }}</div>
            <div class="baby-detail">
              <div class="baby-name">{{ baby.name }}</div>
              <div class="baby-meta">
                <span v-if="baby.birthday">{{ baby.birthday }}</span>
              </div>
            </div>
            <div v-if="babyStore.currentBaby?.id === baby.id" class="current-badge">当前</div>
          </div>
          <div class="baby-actions">
            <button class="action-btn edit" @click="openEditModal(baby)">✏️</button>
            <button class="action-btn delete" @click="handleDelete(baby)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="sharedBabies.length > 0" class="section">
      <div class="section-title">共享宝宝</div>
      <div class="baby-list">
        <div v-for="baby in sharedBabies" :key="baby.id" class="baby-card" :class="{ selected: babyStore.currentBaby?.id === baby.id }">
          <div class="baby-info" @click="babyStore.setCurrentBaby(baby)">
            <div class="baby-avatar">{{ baby.gender === '女' ? '👧' : '👦' }}</div>
            <div class="baby-detail">
              <div class="baby-name">{{ baby.name }}</div>
              <div class="baby-meta">
                <span v-if="baby.birthday">{{ baby.birthday }}</span>
                <span class="permission-badge" :class="baby.permission">{{ baby.permission === 'record' ? '可记录' : '查看' }}</span>
              </div>
            </div>
            <div v-if="babyStore.currentBaby?.id === baby.id" class="current-badge">当前</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="babyStore.babies.length === 0" class="empty-state">
      <div class="empty-icon">👶</div>
      <div class="empty-text">还没有宝宝</div>
      <div class="empty-hint">点击上方按钮添加宝宝</div>
    </div>

    <div v-if="showAddModal || showEditModal" class="modal-mask" @click.self="closeModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ showEditModal ? '编辑宝宝' : '添加宝宝' }}</h3>
        <div class="form-group">
          <label class="form-label">名字</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="宝宝的名字" />
        </div>
        <div class="form-group">
          <label class="form-label">性别</label>
          <div class="gender-select">
            <div class="gender-option" :class="{ active: form.gender === '男' }" @click="form.gender = '男'">👦 男</div>
            <div class="gender-option" :class="{ active: form.gender === '女' }" @click="form.gender = '女'">👧 女</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">生日</label>
          <input v-model="form.birthday" type="date" class="form-input" />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" :disabled="submitting" @click="submitForm">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-mask" @click.self="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="delete-confirm-text">确定要删除宝宝 {{ deletingBaby?.name }} 吗？所有相关记录将被删除，此操作不可撤销。</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">取消</button>
          <button class="btn-danger" :disabled="submitting" @click="confirmDelete">
            {{ submitting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { addBaby, updateBaby, deleteBaby } from '@/api/babies'

const babyStore = useBabyStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingBaby = ref(null)
const deletingBaby = ref(null)
const submitting = ref(false)

const showToast = ref(false)
const toastMessage = ref('')

const form = ref({
  name: '',
  gender: '',
  birthday: ''
})

const ownBabies = computed(() => babyStore.babies.filter(b => b.permission === 'owner'))
const sharedBabies = computed(() => babyStore.babies.filter(b => b.permission !== 'owner'))

function toast(msg, duration = 2000) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

function openAddModal() {
  form.value = { name: '', gender: '', birthday: '' }
  showAddModal.value = true
  showEditModal.value = false
}

function openEditModal(baby) {
  form.value = {
    name: baby.name,
    gender: baby.gender || '',
    birthday: baby.birthday ? baby.birthday.slice(0, 10) : ''
  }
  editingBaby.value = baby
  showEditModal.value = true
  showAddModal.value = false
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingBaby.value = null
}

async function submitForm() {
  if (!form.value.name.trim()) {
    toast('请输入宝宝名字')
    return
  }
  submitting.value = true
  try {
    if (showEditModal.value && editingBaby.value) {
      const data = await updateBaby(editingBaby.value.id, {
        name: form.value.name.trim(),
        gender: form.value.gender,
        birthday: form.value.birthday || null
      })
      babyStore.updateBabyInList(data)
      toast('修改成功')
    } else {
      const data = await addBaby({
        name: form.value.name.trim(),
        gender: form.value.gender,
        birthday: form.value.birthday || null
      })
      babyStore.addBabyToList(data)
      toast('添加成功')
    }
    closeModal()
  } catch (e) {
    toast(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function handleDelete(baby) {
  deletingBaby.value = baby
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deletingBaby.value) return
  submitting.value = true
  try {
    await deleteBaby(deletingBaby.value.id)
    babyStore.removeBabyFromList(deletingBaby.value.id)
    toast('删除成功')
    showDeleteModal.value = false
    deletingBaby.value = null
  } catch (e) {
    toast(e.message || '删除失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  babyStore.fetchBabies()
})
</script>

<style scoped>
.babies-page {
  padding: 0 16px;
}

.header {
  padding: 40px 8px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
}

.add-btn {
  font-size: 14px;
  padding: 8px 18px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-left: 8px;
}

.baby-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.baby-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.baby-card.selected {
  border: 2px solid var(--primary);
}

.baby-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 14px;
}

.baby-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.baby-detail {
  flex: 1;
}

.baby-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.baby-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.permission-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.permission-badge.view {
  background: #fff3e0;
  color: #ff9800;
}

.permission-badge.record {
  background: #e8f5e9;
  color: #4caf50;
}

.current-badge {
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  flex-shrink: 0;
}

.baby-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
}

.action-btn.edit {
  background: var(--primary-light);
}

.action-btn.delete {
  background: #fff5f5;
}

.action-btn:active {
  transform: scale(0.9);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
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

.gender-select {
  display: flex;
  gap: 12px;
}

.gender-option {
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

.gender-option.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.delete-confirm-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>
