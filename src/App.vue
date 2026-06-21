<template>
  <div class="app-wrapper">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <BottomNav v-if="showNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBabyStore } from '@/stores/baby'
import { useThemeStore } from '@/stores/theme'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const authStore = useAuthStore()
const babyStore = useBabyStore()
useThemeStore()

const showNav = computed(() => {
  return !route.meta.guest && !route.meta.public
})

if (authStore.isLoggedIn && babyStore.babies.length === 0) {
  babyStore.fetchBabies()
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
