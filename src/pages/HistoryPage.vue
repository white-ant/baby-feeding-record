<template>
  <div class="history-page page-container">
    <div class="header">
      <h1 class="page-title">喂奶记录</h1>
      <div v-if="babyStore.currentBaby" class="baby-name">👶 {{ babyStore.currentBaby.name }}</div>
      <div class="filters">
        <input
          v-model="filterDate"
          type="date"
          class="date-filter"
          @change="loadRecords"
        />
        <button class="export-btn" @click="exportExcel">📥 导出Excel</button>
      </div>
    </div>

    <div v-if="records.length > 0" class="record-list">
      <div
        v-for="record in records"
        :key="record.id"
        class="record-item"
      >
        <div class="record-info">
          <div class="record-time">
            <span class="time-icon">⏰</span>
            {{ formatTime(record.feeding_time) }}
          </div>
          <div class="record-amount">
            <span class="amount-value">{{ record.milk_amount }}</span>
            <span class="amount-unit">ML</span>
          </div>
        </div>
        <button
          v-if="canDelete(record)"
          class="delete-btn"
          @click="handleDelete(record)"
        >
          🗑️
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🍼</div>
      <div class="empty-text">暂无喂奶记录</div>
      <div class="empty-hint">快去记录宝宝的第一次喂奶吧~</div>
    </div>

    <div v-if="showDeleteModal" class="modal-mask" @click.self="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">确认删除</h3>
        <p class="delete-confirm-text">确定要删除这条喂奶记录吗？</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">取消</button>
          <button class="btn-primary" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { useAuthStore } from '@/stores/auth'
import { getRecords, deleteRecord } from '@/api/records'
import * as XLSX from 'xlsx'

const babyStore = useBabyStore()
const authStore = useAuthStore()

const records = ref([])
const filterDate = ref('')

const showDeleteModal = ref(false)
const deletingRecord = ref(null)

const showToast = ref(false)
const toastMessage = ref('')

function toast(msg, duration = 2000) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

function formatTime(dateTimeStr) {
  if (!dateTimeStr) return ''
  const d = new Date(dateTimeStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

function canDelete(record) {
  if (babyStore.currentBabyPermission === 'view') return false
  if (babyStore.isOwner) return true
  return record.user_id === authStore.user?.id
}

async function loadRecords() {
  if (!babyStore.currentBaby) return
  try {
    const date = filterDate.value || undefined
    const data = await getRecords(babyStore.currentBaby.id, date)
    records.value = data
  } catch (e) {
    toast(e.message || '加载失败')
  }
}

function handleDelete(record) {
  deletingRecord.value = record
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deletingRecord.value || !babyStore.currentBaby) return
  try {
    await deleteRecord(babyStore.currentBaby.id, deletingRecord.value.id)
    toast('删除成功')
    await loadRecords()
  } catch (e) {
    toast(e.message || '删除失败')
  }
  showDeleteModal.value = false
  deletingRecord.value = null
}

function exportExcel() {
  if (records.value.length === 0) {
    toast('暂无记录可导出')
    return
  }
  const babyName = babyStore.currentBaby?.name || 'unknown'
  const date = filterDate.value || new Date().toISOString().slice(0, 10)
  const data = records.value.map(r => ({
    '宝宝名称': babyName,
    '喂奶时间': r.feeding_time,
    '奶量ML': r.milk_amount,
    '记录人': r.user_id,
    '创建时间': r.created_at
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '喂奶记录')
  XLSX.writeFile(wb, `baby-feeding-record-${babyName}-${date}.xlsx`)
  toast('导出成功')
}

onMounted(() => {
  loadRecords()
})

defineExpose({ loadRecords })
</script>

<style scoped>
.history-page {
  padding: 0 16px;
}

.header {
  padding: 40px 8px 24px;
  text-align: center;
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
  margin-bottom: 16px;
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.date-filter {
  height: 40px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  padding: 0 12px;
  font-size: 14px;
  background: var(--input-bg);
  color: var(--text-color);
  outline: none;
}

.date-filter:focus {
  border-color: var(--primary);
}

.export-btn {
  height: 40px;
  padding: 0 16px;
  background: linear-gradient(135deg, #ff9ebb 0%, #ff7aa2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s;
}

.export-btn:active {
  transform: scale(0.96);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0 24px;
}

.record-item {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.record-item:active {
  transform: scale(0.98);
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.time-icon {
  font-size: 16px;
}

.record-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.amount-unit {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.delete-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--primary-light);
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.delete-btn:active {
  background: #ffe0ec;
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

.delete-confirm-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 8px;
}
</style>
