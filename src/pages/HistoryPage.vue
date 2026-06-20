<template>
  <div class="history-page page-container">
    <!-- 顶部操作栏 -->
    <div class="header-bar">
      <div class="header-left">
        <div class="baby-info" @click="$emit('openBabyManager')">
          <span class="baby-avatar">{{ activeBaby.avatar }}</span>
          <span class="baby-name">{{ activeBaby.name }}</span>
          <span class="caret">▼</span>
        </div>
      </div>
      <div class="header-right">
        <button class="icon-btn" @click="$emit('toggleTheme')" :title="isDark ? '浅色模式' : '夜间模式'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </div>

    <!-- 页面标题和今日统计 -->
    <div class="header">
      <h1 class="page-title">喂奶记录</h1>
      <div class="today-stat">
        <div class="stat-label">今日已喂奶</div>
        <div class="stat-value">{{ todayTotal }} <span class="stat-unit">ML</span></div>
        <div class="stat-count">共 {{ todayCount }} 次</div>
      </div>
    </div>

    <!-- 记录列表 -->
    <div v-if="records.length > 0" class="record-list">
      <div
        v-for="record in records"
        :key="record.id"
        class="record-item"
      >
        <div class="record-info">
          <div class="record-time">
            <span class="time-icon">⏰</span>
            {{ record.time }}
          </div>
          <div class="record-amount">
            <span class="amount-value">{{ record.amount }}</span>
            <span class="amount-unit">ML</span>
          </div>
        </div>
        <button class="delete-btn" @click="handleDelete(record)">
          🗑️
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🍼</div>
      <div class="empty-text">暂无喂奶记录</div>
      <div class="empty-hint">快去记录宝宝的第一次喂奶吧~</div>
    </div>

    <!-- 删除确认弹窗 -->
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

    <!-- Toast 提示 -->
    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
/**
 * 查看页面 - 展示所有喂奶记录
 * 功能：
 * 1. 显示今日总奶量统计
 * 2. 列表展示所有喂奶记录（按时间倒序）
 * 3. 支持删除单条记录
 * 4. 空状态展示
 * 5. 支持多宝宝切换和主题切换
 */
import { ref, computed, onMounted } from 'vue'
import { getRecords, deleteRecord, getTodayTotal, getTodayCount, getActiveBaby } from '../utils/storage.js'

defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

defineEmits(['openBabyManager', 'toggleTheme'])

// 记录列表
const records = ref([])
// 当前宝宝
const activeBaby = ref(getActiveBaby())

// 删除相关
const showDeleteModal = ref(false)
const deletingRecord = ref(null)

// Toast 提示
const showToast = ref(false)
const toastMessage = ref('')

/**
 * 今日总奶量 - 基于 records.value 计算，确保数据刷新时自动更新
 */
const todayTotal = computed(() => getTodayTotal(records.value))

/**
 * 今日喂奶次数 - 基于 records.value 计算
 */
const todayCount = computed(() => getTodayCount(records.value))

/**
 * 刷新记录列表
 */
function loadRecords() {
  const list = getRecords()
  list.sort((a, b) => b.timestamp - a.timestamp)
  records.value = list
  activeBaby.value = getActiveBaby()
}

/**
 * 显示 Toast 提示
 * @param {string} message 提示内容
 * @param {number} duration 显示时长（毫秒）
 */
function showToastMessage(message, duration = 2000) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, duration)
}

/**
 * 点击删除按钮
 * @param {Object} record 要删除的记录
 */
function handleDelete(record) {
  deletingRecord.value = record
  showDeleteModal.value = true
}

/**
 * 确认删除
 */
function confirmDelete() {
  if (deletingRecord.value) {
    const success = deleteRecord(deletingRecord.value.id)
    if (success) {
      loadRecords()
      showToastMessage('删除成功')
    } else {
      showToastMessage('删除失败')
    }
  }
  showDeleteModal.value = false
  deletingRecord.value = null
}

onMounted(() => {
  loadRecords()
})

// 暴露刷新方法给父组件，切换标签时刷新
defineExpose({
  loadRecords
})
</script>

<style scoped>
.history-page {
  padding: 0;
}

.caret {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-left: 2px;
}

/* 页面头部 */
.header {
  padding: 24px 20px;
  text-align: center;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.today-stat {
  background: linear-gradient(135deg, var(--accent-light) 0%, var(--bg-tertiary) 100%);
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: var(--shadow-md);
}

.stat-label {
  font-size: 14px;
  color: var(--accent-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
  color: var(--accent-dark);
  line-height: 1.2;
}

.stat-unit {
  font-size: 18px;
  font-weight: 500;
  margin-left: 2px;
}

.stat-count {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 6px;
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px 24px;
}

.record-item {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
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
  color: var(--accent-primary);
}

.amount-unit {
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.delete-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--bg-secondary);
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
  background: var(--bg-tertiary);
  transform: scale(0.9);
}

/* 空状态 */
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
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* 删除确认弹窗样式 */
.delete-confirm-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 8px;
}
</style>
