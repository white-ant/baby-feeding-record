<template>
  <div class="record-page page-container">
    <div class="time-section">
      <div v-if="babyStore.currentBaby" class="baby-name">👶 {{ babyStore.currentBaby.name }}</div>
      <div class="date-text">{{ currentDate }}</div>
      <div class="week-text">{{ currentWeek }}</div>
      <div class="time-text">{{ currentTime }}</div>

      <div class="today-summary">
        <div class="summary-item">
          <div class="summary-value">{{ todayTotal }}<span class="summary-unit">ML</span></div>
          <div class="summary-label">总奶量</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">{{ todayCount }}</div>
          <div class="summary-label">喂奶次数</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">{{ avgPerFeed }}<span class="summary-unit">ML</span></div>
          <div class="summary-label">平均每次</div>
        </div>
      </div>

      <div v-if="latestRecord" class="last-feeding">
        <div class="last-label">上次喂奶</div>
        <div class="last-info">
          <span class="last-time">⏰ {{ formatTime(latestRecord.feeding_time) }}</span>
          <span class="last-amount">{{ latestRecord.milk_amount }} ML</span>
        </div>
      </div>
    </div>

    <div class="button-section">
      <template v-if="isViewOnly">
        <div class="view-only-hint">当前账号只有查看权限</div>
      </template>
      <template v-else>
        <button class="record-btn" @click="showModal = true">
          <div class="record-btn-inner">
            <div class="record-icon">🍼</div>
            <div class="record-text">记录喂奶</div>
          </div>
        </button>
        <p class="hint-text">点击按钮记录宝宝的喂奶情况</p>
      </template>
    </div>

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
            :class="{ active: amount === quick }"
            @click="amount = quick"
          >
            {{ quick }} ML
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showModal = false">取消</button>
          <button class="btn-primary" :disabled="submitting" @click="confirmRecord">
            {{ submitting ? '提交中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { getRecords, addRecord } from '@/api/records'

const babyStore = useBabyStore()

const currentDate = ref('')
const currentWeek = ref('')
const currentTime = ref('')
let timer = null

const showModal = ref(false)
const amount = ref(null)
const amountInput = ref(null)
const submitting = ref(false)

const showToast = ref(false)
const toastMessage = ref('')

const quickAmounts = [30, 60, 90, 120, 150, 180]

const records = ref([])
const latestRecord = computed(() => records.value.length > 0 ? records.value[0] : null)

const todayTotal = computed(() => {
  const today = getTodayStr()
  return records.value
    .filter(r => startsWithDate(r.feeding_time, today))
    .reduce((sum, r) => sum + Number(r.milk_amount || 0), 0)
})

const todayCount = computed(() => {
  const today = getTodayStr()
  return records.value.filter(r => startsWithDate(r.feeding_time, today)).length
})

const avgPerFeed = computed(() => {
  if (todayCount.value === 0) return 0
  return Math.round(todayTotal.value / todayCount.value)
})

const isViewOnly = computed(() => babyStore.currentBabyPermission === 'view')

function getTodayStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function startsWithDate(dateTimeStr, dateStr) {
  return dateTimeStr && dateTimeStr.startsWith(dateStr)
}

function formatTime(dateTimeStr) {
  if (!dateTimeStr) return ''
  const d = new Date(dateTimeStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadStats() {
  if (!babyStore.currentBaby) return
  try {
    const data = await getRecords(babyStore.currentBaby.id)
    data.sort((a, b) => new Date(b.feeding_time) - new Date(a.feeding_time))
    records.value = data
  } catch (e) {
    // silently fail
  }
}

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

function toast(msg, duration = 2000) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

async function confirmRecord() {
  const amountNum = Number(amount.value)
  if (!amountNum || amountNum <= 0) {
    toast('请输入有效的奶量')
    return
  }
  if (amountNum > 1000) {
    toast('奶量不能超过 1000 ML')
    return
  }
  if (!babyStore.currentBaby) {
    toast('请先选择宝宝')
    return
  }

  submitting.value = true
  try {
    const now = new Date()
    const feedingTime = now.toISOString().slice(0, 19).replace('T', ' ')
    await addRecord(babyStore.currentBaby.id, {
      milk_amount: amountNum,
      feeding_time: feedingTime
    })
    showModal.value = false
    amount.value = null
    await loadStats()
    toast('记录成功 🍼')
  } catch (e) {
    toast(e.message || '记录失败')
  } finally {
    submitting.value = false
  }
}

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

defineExpose({ loadStats })
</script>

<style scoped>
.record-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.time-section {
  text-align: center;
  padding: 60px 20px 40px;
}

.baby-name {
  font-size: 16px;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 12px;
}

.date-text {
  font-size: 18px;
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.week-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.time-text {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}

.today-summary {
  margin-top: 28px;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 2px 15px rgba(255, 122, 162, 0.1);
}

.summary-item {
  text-align: center;
  flex: 1;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-dark);
  line-height: 1.2;
}

.summary-unit {
  font-size: 12px;
  font-weight: 500;
  margin-left: 2px;
  color: var(--primary);
}

.summary-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.summary-divider {
  width: 1px;
  height: 36px;
  background: var(--border-color);
}

.last-feeding {
  margin-top: 16px;
  background: var(--primary-light);
  border-radius: 14px;
  padding: 14px 18px;
  text-align: left;
}

.last-label {
  font-size: 12px;
  color: var(--primary);
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
  color: var(--primary-dark);
}

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
  box-shadow: 0 10px 40px var(--primary-shadow),
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
  box-shadow: 0 5px 20px var(--primary-shadow),
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
  color: var(--text-secondary);
}

.view-only-hint {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px 32px;
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.quick-btn {
  padding: 8px 14px;
  border: 1px solid var(--primary-border);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:active,
.quick-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
</style>
