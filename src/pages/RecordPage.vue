<template>
  <div class="record-page page-container">
    <!-- 顶部时间显示区域 -->
    <div class="time-section">
      <div class="date-text">{{ currentDate }}</div>
      <div class="week-text">{{ currentWeek }}</div>
      <div class="time-text">{{ currentTime }}</div>
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
 */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { addRecord } from '../utils/storage.js'

// 当前日期和时间
const currentDate = ref('')
const currentWeek = ref('')
const currentTime = ref('')
let timer = null

// 弹窗相关
const showModal = ref(false)
const amount = ref(null)
const amountInput = ref(null)

// Toast 提示
const showToast = ref(false)
const toastMessage = ref('')

// 快捷奶量选项
const quickAmounts = [30, 60, 90, 120, 150, 180]

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
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.record-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* 时间显示区域 */
.time-section {
  text-align: center;
  padding: 60px 20px 40px;
}

.date-text {
  font-size: 18px;
  color: #ff7aa2;
  font-weight: 500;
  margin-bottom: 8px;
}

.week-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.time-text {
  font-size: 48px;
  font-weight: 700;
  color: #333;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
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
  background: linear-gradient(135deg, #ffb3c8 0%, #ff7aa2 50%, #ff5588 100%);
  box-shadow: 0 10px 40px rgba(255, 122, 162, 0.4),
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
  border: 3px solid rgba(255, 122, 162, 0.3);
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
  color: #999;
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
  border: 1px solid #ffd6e3;
  background: #fff5f8;
  color: #ff7aa2;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:active {
  background: #ff7aa2;
  color: #fff;
  border-color: #ff7aa2;
}
</style>
