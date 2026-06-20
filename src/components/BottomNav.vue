<template>
  <!-- 底部导航栏 -->
  <nav class="bottom-nav">
    <div
      class="nav-item"
      :class="{ active: activeTab === 'record' }"
      @click="$emit('change', 'record')"
    >
      <div class="nav-icon">📝</div>
      <div class="nav-text">记录</div>
    </div>
    <div
      class="nav-item"
      :class="{ active: activeTab === 'stats' }"
      @click="$emit('change', 'stats')"
    >
      <div class="nav-icon">📊</div>
      <div class="nav-text">统计</div>
    </div>
    <div
      class="nav-item"
      :class="{ active: activeTab === 'history' }"
      @click="$emit('change', 'history')"
    >
      <div class="nav-icon">📋</div>
      <div class="nav-text">查看</div>
    </div>
  </nav>
</template>

<script setup>
/**
 * 底部导航栏组件
 * 通过 activeTab prop 控制当前选中项
 * 通过 change 事件通知父组件切换
 */
import { defineProps, defineEmits } from 'vue'

defineProps({
  activeTab: {
    type: String,
    default: 'record'
  }
})

defineEmits(['change'])
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--bg-primary);
  display: flex;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.06);
  border-top: 1px solid var(--border-color);
  z-index: 100;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  gap: 4px;
}

.nav-item:active {
  background: var(--bg-secondary);
}

.nav-icon {
  font-size: 24px;
  line-height: 1;
  filter: grayscale(30%);
  opacity: 0.6;
  transition: opacity 0.2s, transform 0.2s;
}

.nav-text {
  font-size: 12px;
  color: var(--text-tertiary);
  transition: color 0.2s;
}

.nav-item.active .nav-icon {
  opacity: 1;
  filter: grayscale(0%);
  transform: scale(1.1);
}

.nav-item.active .nav-text {
  color: var(--accent-primary);
  font-weight: 600;
}

/* PC 端适配，跟随 #app 宽度 */
@media (min-width: 768px) {
  .bottom-nav {
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>
