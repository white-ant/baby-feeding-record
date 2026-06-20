/**
 * localStorage 操作工具
 * 封装宝宝管理和喂奶记录的增删改查操作
 * 支持多宝宝管理
 */

const BABIES_KEY = 'baby_feeding_babies'
const ACTIVE_BABY_KEY = 'baby_feeding_active_baby'
const THEME_KEY = 'baby_feeding_theme'

const DEFAULT_BABY = {
  id: 'default',
  name: '宝宝',
  avatar: '👶',
  birthday: '',
  gender: ''
}

/**
 * ==================== 宝宝管理 ====================
 */

/**
 * 获取所有宝宝列表
 * @returns {Array} 宝宝列表
 */
export function getBabies() {
  try {
    const data = localStorage.getItem(BABIES_KEY)
    const babies = data ? JSON.parse(data) : []
    if (babies.length === 0) {
      babies.push({ ...DEFAULT_BABY, id: generateId() })
      saveBabies(babies)
    }
    return babies
  } catch (error) {
    console.error('读取宝宝列表失败:', error)
    return [{ ...DEFAULT_BABY, id: generateId() }]
  }
}

/**
 * 保存宝宝列表
 * @param {Array} babies 宝宝列表
 */
function saveBabies(babies) {
  try {
    localStorage.setItem(BABIES_KEY, JSON.stringify(babies))
  } catch (error) {
    console.error('保存宝宝列表失败:', error)
  }
}

/**
 * 获取当前选中的宝宝
 * @returns {Object} 当前宝宝
 */
export function getActiveBaby() {
  try {
    const babies = getBabies()
    const activeId = localStorage.getItem(ACTIVE_BABY_KEY)
    if (activeId) {
      const active = babies.find((b) => b.id === activeId)
      if (active) return active
    }
    return babies[0]
  } catch (error) {
    console.error('获取当前宝宝失败:', error)
    return getBabies()[0]
  }
}

/**
 * 设置当前选中的宝宝
 * @param {string} babyId 宝宝ID
 */
export function setActiveBaby(babyId) {
  try {
    localStorage.setItem(ACTIVE_BABY_KEY, babyId)
  } catch (error) {
    console.error('设置当前宝宝失败:', error)
  }
}

/**
 * 添加新宝宝
 * @param {Object} baby 宝宝信息
 * @param {string} baby.name 宝宝姓名
 * @param {string} baby.avatar 头像emoji
 * @param {string} baby.birthday 生日
 * @param {string} baby.gender 性别
 * @returns {Object} 新增的宝宝
 */
export function addBaby(baby) {
  const babies = getBabies()
  const newBaby = {
    id: generateId(),
    name: baby.name || '宝宝',
    avatar: baby.avatar || '👶',
    birthday: baby.birthday || '',
    gender: baby.gender || ''
  }
  babies.push(newBaby)
  saveBabies(babies)
  setActiveBaby(newBaby.id)
  return newBaby
}

/**
 * 更新宝宝信息
 * @param {string} babyId 宝宝ID
 * @param {Object} updates 更新的字段
 * @returns {boolean} 是否成功
 */
export function updateBaby(babyId, updates) {
  const babies = getBabies()
  const index = babies.findIndex((b) => b.id === babyId)
  if (index !== -1) {
    babies[index] = { ...babies[index], ...updates }
    saveBabies(babies)
    return true
  }
  return false
}

/**
 * 删除宝宝
 * @param {string} babyId 宝宝ID
 * @returns {boolean} 是否成功
 */
export function deleteBaby(babyId) {
  const babies = getBabies()
  if (babies.length <= 1) {
    return false
  }
  const index = babies.findIndex((b) => b.id === babyId)
  if (index !== -1) {
    babies.splice(index, 1)
    saveBabies(babies)
    // 删除该宝宝的所有记录
    localStorage.removeItem(getRecordsKey(babyId))
    // 如果删除的是当前宝宝，切换到第一个
    const activeId = localStorage.getItem(ACTIVE_BABY_KEY)
    if (activeId === babyId) {
      setActiveBaby(babies[0].id)
    }
    return true
  }
  return false
}

/**
 * ==================== 喂奶记录管理 ====================
 */

/**
 * 获取记录存储key
 * @param {string} babyId 宝宝ID
 * @returns {string} storage key
 */
function getRecordsKey(babyId) {
  return `baby_feeding_records_${babyId}`
}

/**
 * 获取指定宝宝的所有喂奶记录
 * @param {string} babyId 宝宝ID（可选，默认当前宝宝）
 * @returns {Array} 喂奶记录数组
 */
export function getRecords(babyId) {
  const id = babyId || getActiveBaby().id
  try {
    const data = localStorage.getItem(getRecordsKey(id))
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取喂奶记录失败:', error)
    return []
  }
}

/**
 * 保存喂奶记录
 * @param {Array} records 记录数组
 * @param {string} babyId 宝宝ID
 */
function saveRecords(records, babyId) {
  const id = babyId || getActiveBaby().id
  try {
    localStorage.setItem(getRecordsKey(id), JSON.stringify(records))
  } catch (error) {
    console.error('保存喂奶记录失败:', error)
  }
}

/**
 * 添加一条喂奶记录
 * @param {number} amount 奶量（ML）
 * @param {string} time 喂奶时间
 * @param {number} timestamp 创建时间戳
 * @param {string} babyId 宝宝ID（可选）
 * @returns {Object} 新增的记录
 */
export function addRecord(amount, time, timestamp, babyId) {
  const records = getRecords(babyId)
  const newRecord = {
    id: generateId(),
    amount,
    time,
    timestamp
  }
  records.unshift(newRecord)
  saveRecords(records, babyId)
  return newRecord
}

/**
 * 删除一条喂奶记录
 * @param {string} id 记录ID
 * @param {string} babyId 宝宝ID（可选）
 * @returns {boolean} 是否成功
 */
export function deleteRecord(id, babyId) {
  const records = getRecords(babyId)
  const index = records.findIndex((r) => r.id === id)
  if (index !== -1) {
    records.splice(index, 1)
    saveRecords(records, babyId)
    return true
  }
  return false
}

/**
 * 获取今日总奶量
 * @param {Array} records 可选，传入已读取的记录数组
 * @param {string} babyId 宝宝ID（可选）
 * @returns {number} 今日喂奶总量（ML）
 */
export function getTodayTotal(records, babyId) {
  const list = records || getRecords(babyId)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return list
    .filter((r) => r.time && r.time.startsWith(todayStr))
    .reduce((sum, r) => sum + Number(r.amount || 0), 0)
}

/**
 * 获取今日喂奶次数
 * @param {Array} records 可选，传入已读取的记录数组
 * @param {string} babyId 宝宝ID（可选）
 * @returns {number} 今日喂奶次数
 */
export function getTodayCount(records, babyId) {
  const list = records || getRecords(babyId)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return list.filter((r) => r.time && r.time.startsWith(todayStr)).length
}

/**
 * 获取最近一次喂奶记录
 * @param {string} babyId 宝宝ID（可选）
 * @returns {Object|null} 最近的喂奶记录
 */
export function getLatestRecord(babyId) {
  const records = getRecords(babyId)
  if (records.length === 0) return null
  return records.reduce((latest, r) =>
    r.timestamp > latest.timestamp ? r : latest
  , records[0])
}

/**
 * ==================== 主题管理 ====================
 */

/**
 * 获取当前主题
 * @returns {string} 'light' | 'dark'
 */
export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch (error) {
    return 'light'
  }
}

/**
 * 保存主题
 * @param {string} theme 'light' | 'dark'
 */
export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch (error) {
    console.error('保存主题失败:', error)
  }
}

/**
 * ==================== 统计分析 ====================
 */

/**
 * 获取统计数据（用于图表）
 * @param {string} period 'day' | 'week' | 'month'
 * @param {string} babyId 宝宝ID（可选）
 * @returns {Object} 统计数据
 */
export function getStats(period = 'day', babyId) {
  const records = getRecords(babyId)
  const now = new Date()
  let labels = []
  let data = []
  let feedings = []

  if (period === 'day') {
    for (let i = 23; i >= 0; i--) {
      const hour = now.getHours() - i
      const adjustedHour = hour < 0 ? hour + 24 : hour
      labels.push(`${String(adjustedHour).padStart(2, '0')}:00`)
      const hourStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(adjustedHour).padStart(2, '0')}`
      const hourRecords = records.filter((r) => r.time && r.time.startsWith(hourStr))
      data.push(hourRecords.reduce((sum, r) => sum + Number(r.amount), 0))
      feedings.push(hourRecords.length)
    }
  } else if (period === 'week') {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      labels.push(weekDays[date.getDay()])
      const dayRecords = records.filter((r) => r.time && r.time.startsWith(dateStr))
      data.push(dayRecords.reduce((sum, r) => sum + Number(r.amount), 0))
      feedings.push(dayRecords.length)
    }
  } else if (period === 'month') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
      const dayRecords = records.filter((r) => r.time && r.time.startsWith(dateStr))
      data.push(dayRecords.reduce((sum, r) => sum + Number(r.amount), 0))
      feedings.push(dayRecords.length)
    }
  }

  return { labels, data, feedings }
}

/**
 * 获取喂养频率分析
 * @param {string} babyId 宝宝ID（可选）
 * @returns {Object} 频率分析数据
 */
export function getFrequencyAnalysis(babyId) {
  const records = getRecords(babyId)
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp)

  if (sorted.length < 2) {
    return {
      avgInterval: 0,
      avgAmount: 0,
      totalFeedings: records.length,
      totalAmount: records.reduce((sum, r) => sum + Number(r.amount), 0),
      intervals: []
    }
  }

  const intervals = []
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].timestamp - sorted[i - 1].timestamp
    intervals.push(diff / (1000 * 60 * 60))
  }

  const avgInterval = intervals.reduce((sum, v) => sum + v, 0) / intervals.length
  const avgAmount = records.reduce((sum, r) => sum + Number(r.amount), 0) / records.length

  return {
    avgInterval: Math.round(avgInterval * 10) / 10,
    avgAmount: Math.round(avgAmount),
    totalFeedings: records.length,
    totalAmount: records.reduce((sum, r) => sum + Number(r.amount), 0),
    intervals
  }
}

/**
 * ==================== 工具函数 ====================
 */

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8)
}
