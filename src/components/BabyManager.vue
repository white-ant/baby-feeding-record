<template>
  <div v-if="show" class="modal-mask" @click.self="$emit('close')">
    <div class="modal-content baby-manager" @click.stop>
      <h3 class="modal-title">宝宝管理</h3>

      <div class="baby-list">
        <div
          v-for="baby in babies"
          :key="baby.id"
          class="baby-item"
          :class="{ active: baby.id === activeBabyId }"
          @click="switchBaby(baby.id)"
        >
          <div class="baby-avatar-large">{{ baby.avatar }}</div>
          <div class="baby-details">
            <div class="baby-name-large">{{ baby.name }}</div>
            <div v-if="baby.birthday" class="baby-meta">
              {{ baby.birthday }}
              <span v-if="baby.gender"> · {{ baby.gender }}</span>
            </div>
          </div>
          <div v-if="baby.id === activeBabyId" class="active-badge">当前</div>
          <button
            v-if="babies.length > 1"
            class="delete-baby-btn"
            @click.stop="handleDelete(baby)"
          >
            ✕
          </button>
        </div>
      </div>

      <button class="add-baby-btn" @click="showAddForm = true">
        <span class="add-icon">+</span>
        添加宝宝
      </button>

      <div v-if="showAddForm" class="add-form">
        <input
          v-model="newBaby.name"
          type="text"
          class="modal-input"
          placeholder="宝宝姓名"
          maxlength="20"
        />
        <div class="avatar-selector">
          <span class="form-label">选择头像：</span>
          <div class="avatar-options">
            <button
              v-for="avatar in avatarOptions"
              :key="avatar"
              class="avatar-option"
              :class="{ selected: newBaby.avatar === avatar }"
              @click="newBaby.avatar = avatar"
            >
              {{ avatar }}
            </button>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" @click="showAddForm = false">取消</button>
          <button class="btn-primary" @click="addNewBaby">确认添加</button>
        </div>
      </div>

      <button class="close-btn" @click="$emit('close')">关闭</button>
    </div>
  </div>
</template>

<script setup>
/**
 * 宝宝管理弹窗组件
 * 功能：切换宝宝、添加宝宝、删除宝宝
 */
import { ref, reactive, onMounted } from 'vue'
import { getBabies, setActiveBaby, addBaby, deleteBaby } from '../utils/storage.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'change'])

const babies = ref([])
const activeBabyId = ref('')
const showAddForm = ref(false)
const avatarOptions = ['👶', '👧', '👦', '🍼', '🧸', '🎀', '⭐', '🌸', '🐻', '🐰']

const newBaby = reactive({
  name: '',
  avatar: '👶',
  birthday: '',
  gender: ''
})

function loadBabies() {
  babies.value = getBabies()
  const active = babies.value.find((b) => b.id === localStorage.getItem('baby_feeding_active_baby'))
  activeBabyId.value = active ? active.id : babies.value[0].id
}

function switchBaby(babyId) {
  setActiveBaby(babyId)
  activeBabyId.value = babyId
  emit('change')
}

function addNewBaby() {
  if (!newBaby.name.trim()) {
    alert('请输入宝宝姓名')
    return
  }
  const baby = addBaby({
    name: newBaby.name.trim(),
    avatar: newBaby.avatar
  })
  activeBabyId.value = baby.id
  newBaby.name = ''
  newBaby.avatar = '👶'
  showAddForm.value = false
  loadBabies()
  emit('change')
}

function handleDelete(baby) {
  if (confirm(`确定要删除「${baby.name}」吗？该宝宝的所有喂奶记录也会被删除。`)) {
    const success = deleteBaby(baby.id)
    if (success) {
      loadBabies()
      emit('change')
    }
  }
}

onMounted(() => {
  loadBabies()
})
</script>

<style scoped>
.baby-manager {
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.baby-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.baby-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border: 2px solid transparent;
}

.baby-item.active {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.baby-item:active {
  transform: scale(0.98);
}

.baby-avatar-large {
  font-size: 36px;
  width: 56px;
  height: 56px;
  background: var(--bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.baby-details {
  flex: 1;
  min-width: 0;
}

.baby-name-large {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.baby-meta {
  font-size: 12px;
  color: var(--text-tertiary);
}

.active-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--accent-primary);
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.delete-baby-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.delete-baby-btn:active {
  background: rgba(255, 0, 0, 0.2);
}

.add-baby-btn {
  width: 100%;
  padding: 14px;
  background: var(--bg-secondary);
  border: 2px dashed var(--accent-light);
  border-radius: 14px;
  color: var(--accent-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.add-baby-btn:active {
  background: var(--bg-tertiary);
}

.add-icon {
  font-size: 20px;
  font-weight: 700;
}

.add-form {
  background: var(--bg-secondary);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.avatar-selector {
  margin-top: 16px;
}

.avatar-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.avatar-option {
  width: 44px;
  height: 44px;
  border: 2px solid transparent;
  background: var(--bg-primary);
  border-radius: 12px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-option.selected {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.form-actions button {
  flex: 1;
}

.close-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:active {
  background: var(--bg-secondary);
}
</style>
