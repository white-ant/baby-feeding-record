<template>
  <!-- 主应用组件 - 管理页面切换、主题切换、宝宝管理 -->
  <div class="app-wrapper" :class="{ dark: isDark }">
    <RecordPage
      v-show="activeTab === 'record'"
      ref="recordPageRef"
      :is-dark="isDark"
      @open-baby-manager="showBabyManager = true"
      @toggle-theme="toggleTheme"
    />
    <StatsPage
      v-show="activeTab === 'stats'"
      ref="statsPageRef"
      :is-dark="isDark"
      @open-baby-manager="showBabyManager = true"
      @toggle-theme="toggleTheme"
    />
    <HistoryPage
      v-show="activeTab === 'history'"
      ref="historyPageRef"
      :is-dark="isDark"
      @open-baby-manager="showBabyManager = true"
      @toggle-theme="toggleTheme"
    />
    <BottomNav :active-tab="activeTab" @change="handleTabChange" />

    <!-- 宝宝管理弹窗 -->
    <BabyManager
      :show="showBabyManager"
      @close="showBabyManager = false"
      @change="handleBabyChange"
    />
  </div>
</template>

<script setup>
/**
 * App 根组件
 * 功能：
 * 1. 管理底部导航标签切换
 * 2. 主题切换（浅色/深色）
 * 3. 多宝宝管理
 * 4. 切换页面时刷新数据
 */
import { ref, onMounted, watch } from 'vue'
import BottomNav from './components/BottomNav.vue'
import BabyManager from './components/BabyManager.vue'
import RecordPage from './pages/RecordPage.vue'
import HistoryPage from './pages/HistoryPage.vue'
import StatsPage from './pages/StatsPage.vue'
import { getTheme, setTheme, getActiveBaby } from './utils/storage.js'

const activeTab = ref('record')
const isDark = ref(false)
const showBabyManager = ref(false)
const activeBaby = ref(getActiveBaby())

const recordPageRef = ref(null)
const historyPageRef = ref(null)
const statsPageRef = ref(null)

/**
 * 切换主题
 */
function toggleTheme() {
  isDark.value = !isDark.value
  setTheme(isDark.value ? 'dark' : 'light')
}

/**
 * 切换标签页
 * @param {string} tab 标签名 record | stats | history
 */
function handleTabChange(tab) {
  activeTab.value = tab
  if (tab === 'record' && recordPageRef.value) {
    recordPageRef.value.loadStats()
  }
  if (tab === 'stats' && statsPageRef.value) {
    statsPageRef.value.loadData()
  }
  if (tab === 'history' && historyPageRef.value) {
    historyPageRef.value.loadRecords()
  }
}

/**
 * 宝宝切换时刷新所有页面数据
 */
function handleBabyChange() {
  activeBaby.value = getActiveBaby()
  if (recordPageRef.value) {
    recordPageRef.value.loadStats()
  }
  if (statsPageRef.value) {
    statsPageRef.value.loadData()
  }
  if (historyPageRef.value) {
    historyPageRef.value.loadRecords()
  }
}

onMounted(() => {
  const savedTheme = getTheme()
  if (savedTheme === 'dark') {
    isDark.value = true
  }
})

watch(isDark, (val) => {
  if (val) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
</script>

<style scoped>
.app-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
