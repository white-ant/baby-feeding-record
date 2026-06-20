/**
 * localStorage 操作工具
 * 封装喂奶记录的增删改查操作
 */

const STORAGE_KEY = 'baby_feeding_records'

/**
 * 获取所有喂奶记录
 * @returns {Array} 喂奶记录数组，按时间倒序排列
 */
export function getRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取喂奶记录失败:', error)
    return []
  }
}

/**
 * 保存所有喂奶记录
 * @param {Array} records 喂奶记录数组
 */
function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.error('保存喂奶记录失败:', error)
  }
}

/**
 * 添加一条喂奶记录
 * @param {Object} record 喂奶记录对象
 * @param {number} record.amount 奶量（ML）
 * @param {string} record.time 喂奶时间
 * @param {number} record.timestamp 创建时间戳
 * @returns {Object} 新增的记录（包含 id）
 */
export function addRecord(amount, time, timestamp) {
  const records = getRecords()
  const newRecord = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    amount,
    time,
    timestamp
  }
  records.unshift(newRecord)
  saveRecords(records)
  return newRecord
}

/**
 * 删除一条喂奶记录
 * @param {string} id 记录 ID
 * @returns {boolean} 是否删除成功
 */
export function deleteRecord(id) {
  const records = getRecords()
  const index = records.findIndex((r) => r.id === id)
  if (index !== -1) {
    records.splice(index, 1)
    saveRecords(records)
    return true
  }
  return false
}

/**
 * 获取今日总奶量
 * @param {Array} records 可选，传入已读取的记录数组以避免重复读取
 * @returns {number} 今日喂奶总量（ML）
 */
export function getTodayTotal(records) {
  const list = records || getRecords()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return list
    .filter((r) => r.time && r.time.startsWith(todayStr))
    .reduce((sum, r) => sum + Number(r.amount || 0), 0)
}

/**
 * 获取今日喂奶次数
 * @param {Array} records 可选，传入已读取的记录数组
 * @returns {number} 今日喂奶次数
 */
export function getTodayCount(records) {
  const list = records || getRecords()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return list.filter((r) => r.time && r.time.startsWith(todayStr)).length
}

/**
 * 获取最近一次喂奶记录
 * @returns {Object|null} 最近的喂奶记录，没有则返回 null
 */
export function getLatestRecord() {
  const records = getRecords()
  if (records.length === 0) return null
  return records.reduce((latest, r) =>
    r.timestamp > latest.timestamp ? r : latest
  , records[0])
}
