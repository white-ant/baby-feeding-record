<template>
  <!-- 主应用组件 - 管理页面切换 -->
  <div class="app-wrapper">
    <RecordPage v-show="activeTab === 'record'" />
    <HistoryPage v-show="activeTab === 'history'" ref="historyPageRef" />
    <BottomNav :active-tab="activeTab" @change="handleTabChange" />
  </div>
</template>

<script setup>
/**
 * App 根组件
 * 功能：
 * 1. 管理底部导航标签切换
 * 2. 切换到查看页面时刷新记录列表
 */
import { ref } from 'vue'
import BottomNav from './components/BottomNav.vue'
import RecordPage from './pages/RecordPage.vue'
import HistoryPage from './pages/HistoryPage.vue'

const activeTab = ref('record')
const historyPageRef = ref(null)

/**
 * 切换标签页
 * @param {string} tab 标签名 record | history
 */
function handleTabChange(tab) {
  activeTab.value = tab
  // 切换到查看页面时刷新数据
  if (tab === 'history' && historyPageRef.value) {
    historyPageRef.value.loadRecords()
  }
}
</script>

<style scoped>
.app-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
