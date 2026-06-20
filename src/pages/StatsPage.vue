<template>
  <div class="stats-page page-container">
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
        <button class="icon-btn" @click="handleExport" title="导出Excel">
          📊
        </button>
      </div>
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">数据统计</h1>
    </div>

    <!-- 时间段切换 -->
    <div class="period-tabs">
      <button
        v-for="p in periods"
        :key="p.key"
        class="period-tab"
        :class="{ active: period === p.key }"
        @click="period = p.key"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-card-value">{{ analysis.totalFeedings }}</div>
        <div class="stat-card-label">总喂养次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">{{ analysis.totalAmount }}<span class="stat-card-unit">ML</span></div>
        <div class="stat-card-label">总奶量</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">{{ analysis.avgAmount }}<span class="stat-card-unit">ML</span></div>
        <div class="stat-card-label">平均奶量</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">{{ analysis.avgInterval }}<span class="stat-card-unit">h</span></div>
        <div class="stat-card-label">平均间隔</div>
      </div>
    </div>

    <!-- 奶量趋势图 -->
    <div class="chart-section">
      <h3 class="chart-title">奶量趋势</h3>
      <div class="chart-container">
        <Line v-if="chartData" :data="lineChartData" :options="chartOptions" />
        <div v-else class="chart-empty">暂无数据</div>
      </div>
    </div>

    <!-- 喂养频率柱状图 -->
    <div class="chart-section">
      <h3 class="chart-title">喂养频率</h3>
      <div class="chart-container">
        <Bar v-if="chartData" :data="barChartData" :options="barChartOptions" />
        <div v-else class="chart-empty">暂无数据</div>
      </div>
    </div>

    <!-- 频率分析详情 -->
    <div class="frequency-section" v-if="analysis.totalFeedings >= 2">
      <h3 class="section-title">喂养分析</h3>
      <div class="analysis-item">
        <span class="analysis-label">平均喂养间隔</span>
        <span class="analysis-value">{{ analysis.avgInterval }} 小时</span>
      </div>
      <div class="analysis-item">
        <span class="analysis-label">平均每次奶量</span>
        <span class="analysis-value">{{ analysis.avgAmount }} ML</span>
      </div>
      <div class="analysis-item">
        <span class="analysis-label">{{ periodLabel }}总喂养次数</span>
        <span class="analysis-value">{{ analysis.totalFeedings }} 次</span>
      </div>
      <div class="analysis-item">
        <span class="analysis-label">{{ periodLabel }}总奶量</span>
        <span class="analysis-value">{{ analysis.totalAmount }} ML</span>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="showToast" class="toast">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
/**
 * 统计页面 - 展示奶量趋势图和喂养频率分析
 * 功能：
 * 1. 日/周/月 时间段切换
 * 2. 奶量趋势折线图
 * 3. 喂养频率柱状图
 * 4. 统计卡片展示
 * 5. 喂养频率分析详情
 * 6. 导出Excel功能
 */
import { ref, computed, watch, onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'
import { getStats, getFrequencyAnalysis, getRecords, getActiveBaby, getTheme } from '../utils/storage.js'
import { exportToExcel } from '../utils/excel.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

defineEmits(['openBabyManager', 'toggleTheme'])

const period = ref('day')
const periods = [
  { key: 'day', label: '今日' },
  { key: 'week', label: '近7天' },
  { key: 'month', label: '近30天' }
]

const chartData = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const activeBaby = ref(getActiveBaby())

const periodLabel = computed(() => {
  const p = periods.find((p) => p.key === period.value)
  return p ? p.label : ''
})

const analysis = computed(() => {
  const freq = getFrequencyAnalysis()
  const stats = getStats(period.value)
  const periodTotalAmount = stats.data.reduce((sum, v) => sum + v, 0)
  const periodTotalFeedings = stats.feedings.reduce((sum, v) => sum + v, 0)
  const periodAvgAmount = periodTotalFeedings > 0 ? Math.round(periodTotalAmount / periodTotalFeedings) : 0

  return {
    totalFeedings: periodTotalFeedings,
    totalAmount: periodTotalAmount,
    avgAmount: periodAvgAmount,
    avgInterval: freq.avgInterval
  }
})

const lineChartData = computed(() => {
  if (!chartData.value) return null
  const textColor = props.isDark ? '#d1d5db' : '#666666'
  const gridColor = props.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  return {
    labels: chartData.value.labels,
    datasets: [
      {
        label: '奶量 (ML)',
        data: chartData.value.data,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-line').trim() || '#ff7aa2',
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-fill').trim() || 'rgba(255, 122, 162, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const barChartData = computed(() => {
  if (!chartData.value) return null
  return {
    labels: chartData.value.labels,
    datasets: [
      {
        label: '喂养次数',
        data: chartData.value.feedings,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-bar').trim() || '#ff9ebb',
        borderRadius: 6
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid')?.trim() || 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')?.trim() || '#666666',
        maxRotation: period.value === 'month' ? 45 : 0,
        autoSkip: true,
        maxTicksLimit: period.value === 'month' ? 10 : undefined
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid')?.trim() || 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')?.trim() || '#666666'
      }
    }
  }
}))

const barChartOptions = computed(() => ({
  ...chartOptions.value,
  scales: {
    ...chartOptions.value.scales,
    y: {
      ...chartOptions.value.scales.y,
      ticks: {
        ...chartOptions.value.scales.y.ticks,
        stepSize: 1,
        callback: function(value) {
          if (Number.isInteger(value)) return value
        }
      }
    }
  }
}))

function loadData() {
  chartData.value = getStats(period.value)
  activeBaby.value = getActiveBaby()
}

function handleExport() {
  try {
    const records = getRecords()
    exportToExcel(records, activeBaby.value.name)
    showToastMessage('导出成功 📊')
  } catch (error) {
    showToastMessage(error.message || '导出失败')
  }
}

function showToastMessage(message, duration = 2000) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, duration)
}

watch(period, loadData)

defineExpose({
  loadData
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-page {
  padding: 0;
}

.page-header {
  padding: 24px 20px 16px;
  text-align: center;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.period-tabs {
  display: flex;
  gap: 8px;
  padding: 0 20px 20px;
}

.period-tab {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.period-tab.active {
  background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: var(--shadow-btn);
}

.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 20px 20px;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 18px 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.stat-card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-dark);
  line-height: 1.2;
}

.stat-card-unit {
  font-size: 14px;
  font-weight: 500;
  margin-left: 2px;
  color: var(--accent-primary);
}

.stat-card-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 6px;
}

.chart-section {
  padding: 0 20px 24px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.chart-container {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 16px;
  height: 240px;
  box-shadow: var(--shadow-sm);
}

.chart-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 14px;
}

.frequency-section {
  padding: 0 20px 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-primary);
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-sm);
}

.analysis-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.analysis-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-primary);
}
</style>
