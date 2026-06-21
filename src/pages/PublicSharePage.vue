<template>
  <div class="public-share-page page-container">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">🔗</div>
      <div class="error-text">分享链接已失效</div>
      <div class="error-hint">{{ error }}</div>
    </div>

    <template v-else-if="shareData">
      <div class="header">
        <div class="baby-avatar">{{ shareData.baby.gender === '女' ? '👧' : '👦' }}</div>
        <h1 class="baby-title">{{ shareData.baby.name }}</h1>
        <div class="baby-meta">
          <span v-if="shareData.baby.gender">{{ shareData.baby.gender }}</span>
          <span v-if="shareData.baby.birthday">{{ shareData.baby.birthday }}</span>
        </div>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ todayTotal }}<span class="stat-unit">ML</span></div>
          <div class="stat-label">今日总奶量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ todayCount }}</div>
          <div class="stat-label">今日喂奶次数</div>
        </div>
      </div>

      <div class="record-section">
        <div class="section-title">喂奶记录</div>
        <div v-if="shareData.records.length > 0" class="record-list">
          <div v-for="record in shareData.records" :key="record.id" class="record-item">
            <div class="record-info">
              <div class="record-time">⏰ {{ formatTime(record.feeding_time) }}</div>
              <div class="record-amount">
                <span class="amount-value">{{ record.milk_amount }}</span>
                <span class="amount-unit">ML</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-text">暂无喂奶记录</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicShare } from '@/api/shares'

const route = useRoute()

const shareData = ref(null)
const loading = ref(true)
const error = ref('')

const todayTotal = computed(() => {
  if (!shareData.value?.records) return 0
  const today = new Date().toISOString().slice(0, 10)
  return shareData.value.records
    .filter(r => r.feeding_time && r.feeding_time.startsWith(today))
    .reduce((sum, r) => sum + Number(r.milk_amount || 0), 0)
})

const todayCount = computed(() => {
  if (!shareData.value?.records) return 0
  const today = new Date().toISOString().slice(0, 10)
  return shareData.value.records.filter(r => r.feeding_time && r.feeding_time.startsWith(today)).length
})

function formatTime(dateTimeStr) {
  if (!dateTimeStr) return ''
  const d = new Date(dateTimeStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

async function loadData() {
  const token = route.params.token
  if (!token) {
    error.value = '无效的分享链接'
    loading.value = false
    return
  }
  try {
    const data = await getPublicShare(token)
    shareData.value = data
  } catch (e) {
    error.value = e.message || '分享链接已失效'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.public-share-page {
  padding: 0 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 15px;
  color: var(--text-secondary);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.error-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.error-hint {
  font-size: 14px;
  color: var(--text-secondary);
}

.header {
  text-align: center;
  padding: 60px 20px 32px;
}

.baby-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 16px;
}

.baby-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 8px;
}

.baby-meta {
  display: flex;
  gap: 12px;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.stats-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-dark);
  line-height: 1.2;
}

.stat-unit {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  margin-left: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.record-section {
  padding-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 12px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  background: var(--card-bg);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.record-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-time {
  font-size: 14px;
  color: var(--text-secondary);
}

.record-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.amount-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.amount-unit {
  font-size: 13px;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
}
</style>
