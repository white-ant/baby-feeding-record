# 🍼 婴儿喂奶记录程序

一个简洁、温馨的移动端优先的婴儿喂奶记录 Web 应用，帮助爸爸妈妈轻松记录宝宝每一次的喂奶情况。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?logo=github)

---

## ✨ 项目介绍

专为新手父母设计的喂奶记录工具，无需登录、无需后端，所有数据保存在本地浏览器中，开箱即用。界面采用温馨的粉色调，操作简单，一秒记录。

---

## 📱 功能说明

### 记录页面
- 🕐 **实时时间显示**：页面顶部显示当前日期、星期和精确到秒的实时时间
- 🔴 **醒目的圆形记录按钮**：一键开始记录
- 📝 **奶量输入弹窗**：支持手动输入或快捷选择（30/60/90/120/150/180 ML）
- ✅ **即时反馈**：记录成功后 Toast 提示

### 查看页面
- 📊 **今日总奶量统计**：展示今日喂奶总 ML 数和次数
- 📋 **记录列表**：按时间倒序展示所有喂奶记录
- 🗑️ **删除记录**：支持删除单条记录（带二次确认）
- 📭 **空状态提示**：没有记录时显示友好的空状态

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.x | 渐进式 JavaScript 框架，使用 Composition API |
| Vite | 5.x | 下一代前端构建工具 |
| localStorage | - | 浏览器本地存储，无需后端 |
| CSS3 | - | 原生 CSS，含响应式设计和动画 |

---

## 🚀 本地运行方式

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/baby-feeding-record.git
cd baby-feeding-record

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

启动后，在浏览器中打开终端显示的地址（通常是 `http://localhost:5173`）即可预览。

---

## 📦 构建方式

```bash
# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview
```

构建产物将输出到 `dist` 目录。

---

## 🌐 GitHub Pages 部署方式

本项目已内置 GitHub Actions 自动部署配置，推送代码到 `main` 分支后会自动构建并部署。

### 方式一：自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. 在 **Build and deployment** 中，将 **Source** 设置为 **GitHub Actions**
4. 推送代码到 `main` 分支，Actions 会自动执行构建和部署
5. 部署完成后，在 **Settings → Pages** 中查看访问地址

### 方式二：手动部署

```bash
# 1. 构建项目
npm run build

# 2. 进入构建产物目录
cd dist

# 3. 初始化为 git 仓库并推送到 gh-pages 分支
git init
git checkout -b gh-pages
git add -A
git commit -m 'deploy: build'
git push -f git@github.com:your-username/baby-feeding-record.git gh-pages
```

然后在仓库 **Settings → Pages** 中将 **Source** 设置为 **Deploy from a branch**，选择 `gh-pages` 分支。

> ⚠️ 注意：`vite.config.js` 中已将 `base` 设置为 `/baby-feeding-record/`，如果你的仓库名不同，请修改为对应的值。

---

## 📸 项目截图

| 记录页面 | 查看页面 |
|---------|---------|
| ![记录页面截图占位](./screenshots/record-page.png) | ![查看页面截图占位](./screenshots/history-page.png) |

> 💡 提示：截图暂未提供，可自行运行项目后截取并替换上方占位链接。

---

## 📁 项目结构

```
baby-feeding-record/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 自动部署配置
├── public/
│   └── favicon.svg             # 网站图标
├── src/
│   ├── components/
│   │   └── BottomNav.vue       # 底部导航栏组件
│   ├── pages/
│   │   ├── RecordPage.vue      # 记录页面
│   │   └── HistoryPage.vue     # 查看页面
│   ├── styles/
│   │   └── global.css          # 全局样式
│   ├── utils/
│   │   └── storage.js          # localStorage 工具封装
│   ├── App.vue                 # 根组件
│   └── main.js                 # 应用入口
├── .gitignore
├── index.html
├── vite.config.js              # Vite 配置
├── package.json
├── LICENSE                     # MIT 开源协议
└── README.md
```

---

## 🔮 后续可扩展功能

- ☁️ **云端同步**：支持登录账号，数据云端备份，多设备同步
- 👶 **多宝宝管理**：支持添加多个宝宝，切换记录
- ⏰ **喂奶提醒**：自定义喂奶间隔，到时推送提醒
- 📈 **图表统计**：日/周/月奶量趋势图、喂养频率分析
- 📊 **导出 Excel**：一键导出喂奶记录为 Excel 表格
- 🌙 **夜间模式**：深色主题保护视力
- 🌐 **国际化**：支持多语言切换
- 💾 **数据导入导出**：JSON 格式的数据备份与恢复

---

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

---

## 💝 致谢

感谢所有为这个小项目做出贡献的爸爸妈妈们 ❤️

如果这个项目对你有帮助，欢迎给个 ⭐ Star 支持一下！
