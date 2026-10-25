# sql2diagram - 专为毕业设计与学术论文打造的在线绘图工具箱 🎓📊

<p align="center">
  <img src="public/screenshots/01-home-workspace.png" alt="sql2diagram Cover" width="85%" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <b>免安装 · 纯前端 · 开箱即用 · 专为高校学术论文与毕设规范定制</b>
</p>

<p align="center">
  <a href="https://github.com/Anlon-27/sql2diagram/stargazers"><img src="https://img.shields.io/github/stars/Anlon-27/sql2diagram?style=flat-square&color=blue" alt="stars"></a>
  <a href="https://github.com/Anlon-27/sql2diagram/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/Vue-3.5-brightgreen?style=flat-square" alt="vue">
  <img src="https://img.shields.io/badge/Vite-7.0-purple?style=flat-square" alt="vite">
</p>

---

## 🌟 解决痛点

每年计算机、软件工程相关专业的同学在写毕业论文时，常常遇到以下痛点：
1. **画 ER 图繁琐**：Navicat/DBeaver 导出的物理模型图不符合学术规范，被导师反复驳回；手动用 Visio/ProcessOn 拉椭圆和矩形容易对不齐、调线调到崩溃。
2. **表结构排版难**：学术论文严禁彩色网格，必须是标准的**“学术三线表”**（顶底线粗、栏目线细），Word 调整费时费力。
3. **导出画质模糊或水印收费**：市面许多画图网站限制导出分辨率，插入 Word 后噪点严重甚至自带水印。

**sql2diagram** 为此而生：纯前端离线解析，直接粘贴建表 SQL，一键生成符合高校学术标准的图表并支持 300DPI 超清矢量导出！

---

## ✨ 核心特性

### 1. 🗄️ SQL 一键转学术标准 ER 图（逆向建模）
- 支持直接粘贴 MySQL 等主流数据库的 `CREATE TABLE` 建表脚本；
- 智能识别实体、字段属性、主键（自动下划线标注）及字段注释；
- 遵循经典陈氏 ER 图规范（矩形实体 + 椭圆属性 + 菱形关系）；
- 支持自由调整字号、间距、连线粗细并支持拖拽布局。

### 2. 📋 论文标准学术三线表一键生成
- 粘贴 SQL 即可自动生成符合国家标准 GB/T 的学术三线表；
- 规范展示字段名、类型、字段说明、是否为主键等；
- 支持实时调整字号、列宽配比与边框线磅数。

### 3. 🏗️ 全套毕设软工学术图表
内置多种毕设常见图表生成模板与可视化工作区：
- **系统分层架构图**（清晰分层、科技感排版）
- **业务流程图 / 审批流**
- **UML 类图**
- **UML 时序图**
- **用例图（Use Case）**

### 4. 🔒 纯前端计算，数据零上传
- 所有的 SQL 解析与图形排版渲染均在**浏览器本地（Client-side）**完成；
- 不会向任何云端服务器发送数据库敏感语句，安全放心；
- 支持一键导出 **300DPI 超清 PNG** 与 **SVG 矢量图**，论文打印无噪点。

---

## 📸 界面预览

<table border="0">
  <tr>
    <td width="50%"><img src="public/screenshots/02-er-workspace.png" alt="ER属性图" /><br/><b>📌 学术标准 ER 属性图</b></td>
    <td width="50%"><img src="public/screenshots/03-overall-er.png" alt="全局ER图" /><br/><b>📌 全局实体关联图</b></td>
  </tr>
  <tr>
    <td width="50%"><img src="public/screenshots/04-linetable.png" alt="学术三线表" /><br/><b>📌 学术标准三线表</b></td>
    <td width="50%"><img src="public/screenshots/05-architecture.png" alt="系统架构图" /><br/><b>📌 系统分层架构图</b></td>
  </tr>
</table>

---

## 🛠️ 本地开发与快速部署

### 1. 克隆项目与安装依赖
```bash
git clone https://github.com/Anlon-27/sql2diagram.git
cd sql2diagram

# 安装依赖
npm install
```

### 2. 本地启动开发环境
```bash
npm run dev
```
打开浏览器访问控制台提示的本地地址（默认 `http://localhost:5173`）即可。

### 3. 生产打包
```bash
npm run build
```
打包生成的内容位于 `dist/` 目录下，为纯静态 HTML/CSS/JS 文件。

### 4. 免费一键托管（推荐）
因为项目为 100% 纯前端静态网页，可直接一键部署至各大免费托管平台，无需任何服务器运维成本：
- **Vercel**：导入 GitHub 仓库，框架预设选择 `Vite`，点击 Deploy 即可。
- **GitHub Pages**：在仓库设置中开启 Pages，选择静态打包输出分支。
- **Cloudflare Pages**：连接仓库一键自动化构建发布。

---

## 🤝 贡献与交流

欢迎提交 Issue 或 Pull Request 来改进 sql2diagram！
- 如果你觉得这个工具帮到了你的毕业设计或课程设计，请给项目点一个 **⭐️ Star**，让更多同学少走弯路！

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源发布。
