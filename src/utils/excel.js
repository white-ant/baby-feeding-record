/**
 * Excel 导出工具
 * 封装喂奶记录导出为 Excel 功能
 */
import * as XLSX from 'xlsx'

/**
 * 导出喂奶记录为 Excel
 * @param {Array} records 喂奶记录数组
 * @param {string} babyName 宝宝姓名，用于文件名
 */
export function exportToExcel(records, babyName = '宝宝') {
  if (!records || records.length === 0) {
    throw new Error('暂无记录可导出')
  }

  const data = records
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((record, index) => ({
      '序号': index + 1,
      '喂奶时间': record.time,
      '奶量(ML)': record.amount,
      '时间戳': record.timestamp
    }))

  const worksheet = XLSX.utils.json_to_sheet(data)

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 12 },
    { wch: 18 }
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '喂奶记录')

  const today = new Date()
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const fileName = `${babyName}_喂奶记录_${dateStr}.xlsx`

  XLSX.writeFile(workbook, fileName)
}
