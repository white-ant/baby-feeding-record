<template>
  <div class="record-page page-container">
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

    <!-- 顶部时间显示区域 -->
    <div class="time-section">
      <div class="date-text">{{ currentDate }}</div>
      <div class="week-text">{{ currentWeek }}</div>
      <div class="time-text">{{ currentTime }}</div>

      <!-- 今日统计卡片 -->
      <div class="today-summary">
        <div class="summary-item">
          <div class="summary-value">{{ todayCount }}</div>
          <div class="summary-label">今日喂奶次数</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">{{ todayTotal }}<span class="summary-unit">ML</span></div>
          <div class="summary-label">今日总奶量</div>
        </div>
      </div>

      <!-- 上次喂奶记录 -->
      <div v-if="latestRecord" class="last-feeding">
        <div class="last-label">上次喂奶</div>
        <div class="last-info">
          <span class="last-time">⏰ {{ latestRecord.time }}</span>
          <span class="last-amount">{{ latestRecord.amount }} ML</span>
        </div>
      </div>
    </div>

    <!-- 中间圆形记录按钮 -->
    <div class="button-section">
      <button class="record-btn" @click="showModal = true">
        <div class="record-btn-inner">
          <div class="record-icon">🍼</div>
          <div class="record-text">记录喂奶</div>
        </div>
      </button>
      <p class="hint-text">点击按钮记录宝宝的喂奶情况</p>
    </div>

    <!-- 输入奶量弹窗 -->
    <div v-if="showModal" class="modal-mask" @click.self="showModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">请输入奶量（ML）</h3>
        <input
          ref="amountInput"
          v-model.number="amount"
          type="number"
          class="modal-input"
          placeholder="例如：120"
          min="1"
          max="1000"
          @keyup.enter="confirmRecord"
        />
        <div class="quick-amounts">
          <button
            v-for="quick in quickAmounts"
            :key="quick"
            class="quick-btn"
            @click="amount = quick"
          >
            {{ quick }} ML
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showModal = false">取消</button>
          <button class="btn-primary" @click="confirmRecord">确认</button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
/**
 * 记录页面 - 用于记录喂奶时间和奶量
 * 功能：
 * 1. 实时显示当前日期和时间
 * 2. 点击圆形按钮弹出奶量输入框
 * 3. 支持快捷奶量选择
 * 4. 记录保存到 localStorage
 * 5. 支持多宝宝切换和主题切换
 */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { addRecord, getTodayTotal, getTodayCount, getLatestRecord, getActiveBaby } from '../utils/storage.js'

defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

defineEmits(['openBabyManager', 'toggleTheme'])

// 当前日期和时间
const currentDate = ref('')
const currentWeek = ref('')
const currentTime = ref('')
let timer = null

// 当前宝宝
const activeBaby = ref(getActiveBaby())

// 弹窗相关
const showModal = ref(false)
const amount = ref(null)
const amountInput = ref(null)

// Toast 提示
const showToast = ref(false)
const toastMessage = ref('')

// 快捷奶量选项
const quickAmounts = [30, 60, 90, 120, 150, 180]

// 统计数据
const todayTotal = ref(0)
const todayCount = ref(0)
const latestRecord = ref(null)

/**
 * 刷新统计数据
 */
function loadStats() {
  todayTotal.value = getTodayTotal()
  todayCount.value = getTodayCount()
  latestRecord.value = getLatestRecord()
  activeBaby.value = getActiveBaby()
}

/**
 * 更新当前时间显示
 */
function updateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  currentDate.value = `${year}年${month}月${day}日`
  currentTime.value = `${hours}:${minutes}:${seconds}`

  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentWeek.value = weeks[now.getDay()]
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
 * 确认记录喂奶
 */
function confirmRecord() {
  const amountNum = Number(amount.value)
  if (!amountNum || amountNum <= 0) {
    showToastMessage('请输入有效的奶量')
    return
  }
  if (amountNum > 1000) {
    showToastMessage('奶量不能超过 1000 ML')
    return
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${year}-${month}-${day} ${hours}:${minutes}`

  addRecord(amountNum, timeStr, now.getTime())

  showModal.value = false
  amount.value = null
  loadStats()
  showToastMessage('记录成功 🍼')
}

// 监听弹窗打开，自动聚焦输入框
watch(showModal, (val) => {
  if (val) {
    nextTick(() => {
      amountInput.value && amountInput.value.focus()
    })
  }
})

onMounted(() => {
  updateTime()
  loadStats()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// 暴露刷新方法给父组件，切换标签时刷新
defineExpose({
  loadStats
})
</script>

<style scoped>
.record-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0;
}

.caret {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-left: 2px;
}

/* 时间显示区域 */
.time-section {
  text-align: center;
  padding: 40px 20px 40px;
}

.date-text {
  font-size: 18px;
  color: var(--accent-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.week-text {
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

.time-text {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}

/* 今日统计卡片 */
.today-summary {
  margin-top: 28px;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: var(--shadow-sm);
}

.summary-item {
  text-align: center;
  flex: 1;
}

.summary-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent-dark);
  line-height: 1.2;
}

.summary-unit {
  font-size: 13px;
  font-weight: 500;
  margin-left: 2px;
  color: var(--accent-primary);
}

.summary-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.summary-divider {
  width: 1px;
  height: 36px;
  background: var(--border-color);
}

/* 上次喂奶记录 */
.last-feeding {
  margin-top: 16px;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-radius: 14px;
  padding: 14px 18px;
  text-align: left;
}

.last-label {
  font-size: 12px;
  color: var(--accent-primary);
  font-weight: 500;
  margin-bottom: 6px;
}

.last-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.last-time {
  font-size: 14px;
  color: var(--text-secondary);
}

.last-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-dark);
}

/* 记录按钮区域 */
.button-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.record-btn {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 50%, var(--accent-dark) 100%);
  box-shadow: var(--shadow-btn),
    inset 0 2px 10px rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.record-btn::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 3px solid var(--accent-light);
}

.record-btn:active {
  transform: scale(0.95);
  box-shadow: 0 5px 20px rgba(255, 122, 162, 0.3),
    inset 0 2px 10px rgba(255, 255, 255, 0.3);
}

.record-btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.record-icon {
  font-size: 56px;
  line-height: 1;
}

.record-text {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.hint-text {
  margin-top: 32px;
  font-size: 14px;
  color: var(--text-tertiary);
}

/* 快捷奶量选择 */
.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.quick-btn {
  padding: 8px 14px;
  border: 1px solid var(--input-border);
  background: var(--bg-secondary);
  color: var(--accent-primary);
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:active {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}
</style>
