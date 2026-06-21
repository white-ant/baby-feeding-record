<template>
  <div class="stats-page page-container">
    <div class="header">
      <h1 class="page-title">喂奶统计</h1>
      <div v-if="babyStore.currentBaby" class="baby-name">👶 {{ babyStore.currentBaby.name }}</div>
    </div>

    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-value">{{ todayTotalMilk }}<span class="card-unit">ML</span></div>
        <div class="card-label">总奶量</div>
      </div>
      <div class="summary-card">
        <div class="card-value">{{ todayCount }}</div>
        <div class="card-label">喂奶次数</div>
      </div>
      <div class="summary-card">
        <div class="card-value">{{ todayAvg }}<span class="card-unit">ML</span></div>
        <div class="card-label">平均每次</div>
      </div>
    </div>

    <div v-if="trendSummary" class="trend-summary">
      <div class="trend-title">{{ trendLabel }}</div>
      <div class="trend-info">
        <span>总奶量: {{ trendSummary.totalMilk }} ML</span>
        <span>总次数: {{ trendSummary.totalCount }} 次</span>
        <span>日均: {{ trendSummary.dailyAvg }} ML</span>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-title">奶量趋势</div>
      <div ref="lineChartRef" class="chart-container"></div>
    </div>

    <div class="chart-section">
      <div class="chart-title">喂奶频率</div>
      <div ref="barChartRef" class="chart-container"></div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useBabyStore } from '@/stores/baby'
import { useThemeStore } from '@/stores/theme'
import { getStats } from '@/api/stats'

const babyStore = useBabyStore()
const themeStore = useThemeStore()

const tabs = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
]
const activeTab = ref('day')

const statsData = ref([])
const todayTotalMilk = ref(0)
const todayCount = ref(0)
const todayAvg = ref(0)

const lineChartRef = ref(null)
const barChartRef = ref(null)
let lineChart = null
let barChart = null

const showToast = ref(false)
const toastMessage = ref('')

function toast(msg, duration = 2000) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

const trendLabel = computed(() => {
  if (activeTab.value === 'day') return '近7天趋势'
  if (activeTab.value === 'week') return '近4周趋势'
  return '近3月趋势'
})

const trendSummary = computed(() => {
  if (statsData.value.length === 0) return null
  const totalMilk = statsData.value.reduce((s, d) => s + Number(d.total_milk || 0), 0)
  const totalCount = statsData.value.reduce((s, d) => s + Number(d.feeding_count || 0), 0)
  const days = statsData.value.length || 1
  return {
    totalMilk,
    totalCount,
    dailyAvg: Math.round(totalMilk / days)
  }
})

function getTextColor() {
  return themeStore.isDark ? '#e0e0e0' : '#333'
}

function getSubTextColor() {
  return themeStore.isDark ? '#999' : '#999'
}

function getLineColor() {
  return themeStore.isDark ? '#333355' : '#f0f0f0'
}

function renderLineChart() {
  if (!lineChartRef.value) return
  if (!lineChart) {
    lineChart = echarts.init(lineChartRef.value)
  }

  let xData = []
  let yData = []

  if (activeTab.value === 'day') {
    const recent = statsData.value.slice(0, 7).reverse()
    xData = recent.map(d => d.date ? d.date.slice(5) : '')
    yData = recent.map(d => Number(d.total_milk || 0))
  } else if (activeTab.value === 'week') {
    const recent = statsData.value.slice(0, 4).reverse()
    xData = recent.map(d => d.week_start ? d.week_start.slice(5) : '')
    yData = recent.map(d => Number(d.total_milk || 0))
  } else {
    const recent = statsData.value.slice(0, 3).reverse()
    xData = recent.map(d => d.month || '')
    yData = recent.map(d => Number(d.total_milk || 0))
  }

  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 45, right: 16, top: 16, bottom: 30 },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { color: getSubTextColor(), fontSize: 11 },
      axisLine: { lineStyle: { color: getLineColor() } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: getSubTextColor(), fontSize: 11 },
      splitLine: { lineStyle: { color: getLineColor() } }
    },
    series: [{
      data: yData,
      type: 'line',
      smooth: true,
      itemStyle: { color: '#ff7aa2' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,122,162,0.3)' },
          { offset: 1, color: 'rgba(255,122,162,0.05)' }
        ])
      }
    }]
  })
}

function renderBarChart() {
  if (!barChartRef.value) return
  if (!barChart) {
    barChart = echarts.init(barChartRef.value)
  }

  let xData = []
  let yData = []

  if (activeTab.value === 'day') {
    const recent = statsData.value.slice(0, 7).reverse()
    xData = recent.map(d => d.date ? d.date.slice(5) : '')
    yData = recent.map(d => Number(d.feeding_count || 0))
  } else if (activeTab.value === 'week') {
    const recent = statsData.value.slice(0, 4).reverse()
    xData = recent.map(d => d.week_start ? d.week_start.slice(5) : '')
    yData = recent.map(d => Number(d.feeding_count || 0))
  } else {
    const recent = statsData.value.slice(0, 3).reverse()
    xData = recent.map(d => d.month || '')
    yData = recent.map(d => Number(d.feeding_count || 0))
  }

  barChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 45, right: 16, top: 16, bottom: 30 },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { color: getSubTextColor(), fontSize: 11 },
      axisLine: { lineStyle: { color: getLineColor() } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: getSubTextColor(), fontSize: 11 },
      splitLine: { lineStyle: { color: getLineColor() } }
    },
    series: [{
      data: yData,
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ff7aa2' },
          { offset: 1, color: '#ff5588' }
        ]),
        borderRadius: [6, 6, 0, 0]
      },
      barWidth: '40%'
    }]
  })
}

async function loadData() {
  if (!babyStore.currentBaby) return
  try {
    const data = await getStats(babyStore.currentBaby.id, activeTab.value)
    statsData.value = data

    const todayStr = new Date().toISOString().slice(0, 10)
    const todayRow = data.find(d => d.date === todayStr)
    todayTotalMilk.value = todayRow ? Number(todayRow.total_milk || 0) : 0
    todayCount.value = todayRow ? Number(todayRow.feeding_count || 0) : 0
    todayAvg.value = todayCount.value > 0 ? Math.round(todayTotalMilk.value / todayCount.value) : 0

    await nextTick()
    renderLineChart()
    renderBarChart()
  } catch (e) {
    toast(e.message || '加载失败')
  }
}

function switchTab(tab) {
  activeTab.value = tab
  loadData()
}

function handleResize() {
  lineChart && lineChart.resize()
  barChart && barChart.resize()
}

watch(() => themeStore.isDark, () => {
  renderLineChart()
  renderBarChart()
})

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (lineChart) {
    lineChart.dispose()
    lineChart = null
  }
  if (barChart) {
    barChart.dispose()
    barChart = null
  }
})
</script>

<style scoped>
.stats-page {
  padding: 0 16px;
}

.header {
  padding: 40px 8px 16px;
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
  margin-bottom: 12px;
}

.tab-bar {
  display: flex;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff9ebb 0%, #ff7aa2 100%);
  color: #fff;
  font-weight: 600;
}

.summary-cards {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  background: var(--card-bg);
  border-radius: 14px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-dark);
  line-height: 1.2;
}

.card-unit {
  font-size: 11px;
  font-weight: 500;
  color: var(--primary);
  margin-left: 2px;
}

.card-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.trend-summary {
  background: var(--primary-light);
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 20px;
}

.trend-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}

.trend-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.chart-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 12px;
}

.chart-container {
  width: 100%;
  height: 220px;
}
</style>
