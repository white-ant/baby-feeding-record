import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/pages/LoginPage.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('@/pages/RegisterPage.vue'), meta: { guest: true } },
  { path: '/', name: 'Record', component: () => import('@/pages/RecordPage.vue'), meta: { auth: true } },
  { path: '/history', name: 'History', component: () => import('@/pages/HistoryPage.vue'), meta: { auth: true } },
  { path: '/stats', name: 'Stats', component: () => import('@/pages/StatsPage.vue'), meta: { auth: true } },
  { path: '/babies', name: 'Babies', component: () => import('@/pages/BabiesPage.vue'), meta: { auth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/ProfilePage.vue'), meta: { auth: true } },
  { path: '/share', name: 'Share', component: () => import('@/pages/SharePage.vue'), meta: { auth: true } },
  { path: '/public/:token', name: 'PublicShare', component: () => import('@/pages/PublicSharePage.vue'), meta: { public: true } },
]

const router = createRouter({
  history: createWebHistory('/baby-feeding-record/'),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.auth && !token) {
    return next('/login')
  }
  if (to.meta.guest && token) {
    return next('/')
  }
  next()
})

export default router
