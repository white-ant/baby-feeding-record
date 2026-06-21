import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBabies as apiGetBabies } from '@/api/babies'

export const useBabyStore = defineStore('baby', () => {
  const babies = ref([])
  const currentBaby = ref(null)

  const currentBabyPermission = computed(() => {
    if (!currentBaby.value) return null
    return currentBaby.value.permission || null
  })

  const isOwner = computed(() => {
    if (!currentBaby.value) return false
    return currentBaby.value.permission === 'owner'
  })

  async function fetchBabies() {
    const data = await apiGetBabies()
    babies.value = data
    const savedId = localStorage.getItem('currentBabyId')
    if (savedId) {
      const found = data.find(b => b.id === Number(savedId))
      if (found) {
        currentBaby.value = found
        return
      }
    }
    if (data.length > 0) {
      currentBaby.value = data[0]
      localStorage.setItem('currentBabyId', String(data[0].id))
    }
  }

  function setCurrentBaby(baby) {
    currentBaby.value = baby
    localStorage.setItem('currentBabyId', String(baby.id))
  }

  function updateBabyInList(baby) {
    const idx = babies.value.findIndex(b => b.id === baby.id)
    if (idx !== -1) {
      babies.value[idx] = baby
      if (currentBaby.value && currentBaby.value.id === baby.id) {
        currentBaby.value = baby
      }
    }
  }

  function removeBabyFromList(babyId) {
    babies.value = babies.value.filter(b => b.id !== babyId)
    if (currentBaby.value && currentBaby.value.id === babyId) {
      currentBaby.value = babies.value.length > 0 ? babies.value[0] : null
      if (currentBaby.value) {
        localStorage.setItem('currentBabyId', String(currentBaby.value.id))
      } else {
        localStorage.removeItem('currentBabyId')
      }
    }
  }

  function addBabyToList(baby) {
    babies.value.unshift(baby)
    if (babies.value.length === 1) {
      currentBaby.value = baby
      localStorage.setItem('currentBabyId', String(baby.id))
    }
  }

  return {
    babies,
    currentBaby,
    currentBabyPermission,
    isOwner,
    fetchBabies,
    setCurrentBaby,
    updateBabyInList,
    removeBabyFromList,
    addBabyToList
  }
})
