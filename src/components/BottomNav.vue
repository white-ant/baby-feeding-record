<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <div class="nav-icon">{{ item.icon }}</div>
      <div class="nav-text">{{ item.label }}</div>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', icon: '📝', label: '记录' },
  { path: '/history', icon: '📋', label: '查看' },
  { path: '/stats', icon: '📊', label: '统计' },
  { path: '/babies', icon: '👶', label: '宝宝' },
  { path: '/profile', icon: '👤', label: '我的' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--nav-bg);
  display: flex;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.06);
  border-top: 1px solid var(--border-color);
  z-index: 100;
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
  text-decoration: none;
}

.nav-item:active {
  background: var(--border-color);
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
  color: var(--text-secondary);
  transition: color 0.2s;
}

.nav-item.active .nav-icon {
  opacity: 1;
  filter: grayscale(0%);
  transform: scale(1.1);
}

.nav-item.active .nav-text {
  color: var(--primary);
  font-weight: 600;
}

@media (min-width: 768px) {
  .bottom-nav {
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>
