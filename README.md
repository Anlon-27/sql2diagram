<div align="center">

# 📊 sql2diagram

**专为毕业设计与学术论文打造的在线规范绘图工具箱**

<p>
  <b>免安装 · 100% 纯前端离线计算 · 论文标准图表一键生成 · 300DPI 矢量导出</b>
</p>

<p align="center">
  <code>SQL转ER图</code> · <code>学术三线表</code> · <code>系统架构图</code> · <code>陈氏ER属性图</code> · <code>总体ER图</code> · <code>UML类图</code> · <code>时序图/顺序图</code> · <code>用例图</code> · <code>业务流程图</code> · <code>毕设画图神器</code>
</p>

[![GitHub Stars](https://img.shields.io/github/stars/Anlon-27/sql2diagram?style=flat-square&color=blue)](https://github.com/Anlon-27/sql2diagram/stargazers)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-orange.svg?style=flat-square)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![AntV G6](https://img.shields.io/badge/AntV-G6_4.8-1890FF?style=flat-square)](https://g6.antv.vision/)

<br />

<img src="public/screenshots/01-home-workspace.png" alt="sql2diagram 首页全景" width="92%" style="border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />

</div>

> **学术级 SQL 转 ER 图与毕设论文规范绘图工具箱** | *The All-in-One Academic Diagram Toolkit & SQL-to-Diagram Generator for Research and Thesis.*  
> 专为计算机科学、软件工程、信息管理等专业的高校学生、科研学者及毕业答辩打造，涵盖 **SQL 一键转陈氏 ER 属性图**、**AntV G6 多表全局实体关联图（总体 ER 图）**、**国标学术三线表 (GB/T)**、**软件系统分层架构图**、**业务流程图**、**UML 类图/时序图/用例图**、纯前端本地离线语法解析及 300DPI 论文级超清矢量导出等全套学术制图规范。

---

## 🌟 为什么选择 sql2diagram？（痛点与工具对比）

每年高校计算机、软件工程相关专业的同学在撰写毕业论文或课程设计时，常在绘图排版环节遭遇大量阻碍：

| 评价维度 | 传统通用绘图软件 (Visio / ProcessOn) | 数据库管理客户端 (Navicat / DBeaver) | **sql2diagram (本项目)** |
| :--- | :--- | :--- | :--- |
| **SQL 转 ER 图效率** | 手动拖拉椭圆、矩形与连接线，耗时数小时 | 一键导出，但仅支持物理网格表 | **直接粘贴建表 SQL，毫秒级自动排版生成陈氏 ER 属性图** |
| **学术评审规范** | 极易出现图形混淆、主键漏标下划线 | ❌ **导师常直接驳回**（严禁将物理模型图直接当概念 ER 图） | **严格遵循陈氏概念 ER 模型规范与国标 GB/T 表格标准** |
| **学术三线表支持** | 需在 Word 中繁琐设置边框线磅数与内外线 | 完全不支持导出学术论文表格格式 | **输入 SQL 一键生成符合规范的标准三线表（顶底粗、栏目细）** |
| **系统架构图排版** | 手动微调各层卡片对齐与间距，极易歪斜 | 不具备架构绘图功能 | **预设表现层/业务层/数据层模块卡片与智能连线拓扑** |
| **数据隐私安全** | 依赖云端服务器，数据库结构语句存在上传隐患 | 本地运行，但缺少论文格式化支持 | **100% 纯前端浏览器沙箱解析，零网络数据外发** |
| **导出印刷画质** | 免费导出受限，常常模糊或带有平台水印 | 截图插入 Word 打印有明显锯齿噪点 | **支持 300DPI 论文级超清 PNG 与无损 SVG 矢量导出** |

---

## 📸 核心图表工作区详解（8 大学术规范图种）

<table border="0">
  <tr>
    <td width="50%">
      <img src="public/screenshots/02-er-workspace.png" alt="SQL转ER图" /><br/>
      <b>📌 1. 学术标准陈氏 ER 属性图（SQL 转 ER 图）</b><br/>
      <sub>直接粘贴 MySQL/PostgreSQL DDL，智能拆解实体矩形、属性椭圆、主键自动加粗下划线标注。</sub>
    </td>
    <td width="50%">
      <img src="public/screenshots/03-overall-er.png" alt="总体ER图" /><br/>
      <b>📌 2. 总体 ER 图（AntV G6 多表全局实体关联图）</b><br/>
      <sub>支持多张建表 SQL 批量导入，力导向算法自动排版多表间的一对多 (1:N)、多对多 (M:N) 拓扑。</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/screenshots/04-linetable.png" alt="学术三线表" /><br/>
      <b>📌 3. 国家标准学术三线表（论文数据库表结构设计）</b><br/>
      <sub>自动提取字段名、数据类型、中文注释与主键，顶底粗线(1.5pt)、栏目细线(0.75pt)，严禁多余竖线。</sub>
    </td>
    <td width="50%">
      <img src="public/screenshots/05-architecture.png" alt="系统架构图" /><br/>
      <b>📌 4. 软件工程系统分层架构图（系统架构设计）</b><br/>
      <sub>展现层、业务逻辑层、数据持久层、基础设施层清晰分层，预设微服务与 MVC 答辩架构模板。</sub>
    </td>
  </tr>
</table>

### 全套毕设与软件工程图表生成矩阵：

1. **SQL 转 ER 属性图（陈氏模型）**：
   - 智能语法分析：支持 `CREATE TABLE` 脚本，自动提取表名实体与列名属性；
   - 严格学术标注：主键自动添加标准下划线，支持复合主键与自增注释；
   - 交互式拖拽：节点智能吸附、连线平滑防遮挡、字号与间距参数灵活可调。
2. **总体 ER 图（全局实体关联关系）**：
   - 多表联合推导：从外键（Foreign Key）与关联字段自动推导表间联系；
   - 现代化视觉：基于 AntV G6 图引擎，透明磨砂网格画布，支持超大图视口缩放与平移。
3. **学术三线表（GB/T 科技论文规范）**：
   - 答辩必备：一键将数据表 DDL 转化为规范的学术三线表（顶线、底线、栏目线）；
   - 多样导出：支持高倍超清图片导出与结构化复制，直插 Word 完美契合版心。
4. **系统分层架构图**：
   - 模块化拖拽布局：支持自由增删层级、调整模块顺序与连接拓扑线；
   - 学术科技美感：蓝白轻量配色，符合软工设计报告（SRS）与毕设论文正文审美。
5. **业务流程图（Flowchart）**：
   - 标准流图元：包含起始/结束框、业务处理框、判定条件菱形框、流向线与分支标签。
6. **UML 用例图（Use Case）**：
   - 参与者 Actor（小人图元）、系统边界矩形、业务用例椭圆及 `<<include>>` / `<<extend>>` 依赖关系。
7. **UML 类图（Class Diagram）**：
   - 规范三格类结构（类名、属性域、方法操作），支持继承（泛化）、实现、聚合与关联多重度标记。
8. **UML 时序图 / 顺序图（Sequence Diagram）**：
   - 极简脚本语法驱动对象生命线与消息流传递，原生支持同步调用、异步返回及 `alt`/`opt`/`loop` 交互片段。

---

## ⚡ 30 秒快速体验（代码示例）

无需任何前期准备，在 **ER 属性图** 或 **学术三线表** 工作区中直接粘贴如下建表 SQL，即可即时体验：

```sql
CREATE TABLE `student` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '学号主键',
  `student_no` varchar(32) NOT NULL COMMENT '学号',
  `name` varchar(50) NOT NULL COMMENT '学生姓名',
  `gender` varchar(8) DEFAULT '未知' COMMENT '性别',
  `major` varchar(100) DEFAULT NULL COMMENT '所学专业',
  `gpa` decimal(3,2) DEFAULT '0.00' COMMENT '平均绩点',
  `enrollment_date` date DEFAULT NULL COMMENT '入学日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_no` (`student_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生基本信息表';
```

👉 **解析结果**：
- **SQL 转 ER 图**：自动识别实体为 **学生**，字段属性椭圆环绕，主键 `id` 自动渲染学术下划线；
- **学术三线表**：自动排版为标准的国标四列/五列三线表格，线宽严格符合规范；
- **高清导出**：右上角一键导出 300DPI PNG 或 SVG，直接插入 Word 毫无毛边。

---

## 🔍 核心检索词与覆盖场景（Keywords & Scenarios）

本工具深度覆盖高校计算机与软工相关场景，支持快速检索与解决：

* 🎓 **毕设论文与答辩场景**：
  `毕业论文画图神器`、`计算机毕设绘图`、`软件工程答辩图表`、`开题报告架构图`、`数据库设计说明书`、`毕设答辩PPT图表`
* 🗄️ **数据库与 ER 建模场景**：
  `SQL转ER图`、`SQL一键生成ER图`、`MySQL建表语句转ER图`、`陈氏ER图在线制作`、`实体属性关系图`、`总体ER图生成器`、`DDL逆向ER图`
* 📋 **学术表格排版场景**：
  `学术三线表`、`论文三线表生成器`、`SQL转三线表`、`国标三线表GB/T`、`数据库结构表排版`、`Word三线表快速制作`
* 🏗️ **系统架构与 UML 建模场景**：
  `系统架构图在线生成`、`软件分层架构图`、`微服务架构拓扑图`、`三层架构图`、`UML类图在线绘制`、`UML时序图生成器`、`UML用例图工具`、`业务流程图排版`

---

## 🔒 隐私与安全性设计

* **100% Client-side 客户端运算**：所有的 SQL AST 语法树解析、图形布局算法与三线表格式化均在**用户本地浏览器沙箱**中运行。
* **零敏感数据上报**：工具不会向任何后端服务器上传您的 SQL 语句或业务结构，即使在完全断网或保密内网环境下也能无损运行。
* **高精度绘图引擎**：基于 DOM/SVG 矢量计算与 Canvas 动态栅格化，导出 300DPI PNG 打印级图片或无损 SVG，杜绝缩放模糊。

---

## 🛠️ 本地开发与构建部署

### 环境要求
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`

### 1. 本地启动开发
```bash
# 克隆仓库
git clone https://github.com/Anlon-27/sql2diagram.git
cd sql2diagram

# 安装依赖
npm install

# 启动本地开发服务 (基于 Vite)
npm run dev
```
启动后在浏览器打开控制台输出的本地地址（默认 `http://localhost:5173`）即可使用。

### 2. 生产环境打包
```bash
npm run build
```
执行完毕后，生成的全部静态产物位于 `dist/` 目录中。

### 3. 一键免费托管（推荐）
由于本项目是 100% 纯前端静态架构，你可以直接将其零成本部署至各大主流平台：

* **Vercel**：在 Vercel 中导入本仓库，构建预设选择 `Vite`，输出目录填写 `dist`，点击 **Deploy** 即可。
* **Cloudflare Pages**：连接 GitHub 仓库，构建命令填写 `npm run build`，输出目录填写 `dist`。
* **GitHub Pages**：在仓库 Settings -> Pages 中开启服务，选择从 Actions 或静态构建分支发布。
* **Nginx 私有化自建**：直接将 `dist/` 静态文件夹放置于服务器，配置静态目录并开启 `try_files $uri $uri/ /index.html;`。

---

## 🎓 论文排版学术规范常见问答 (FAQ)

<details>
<summary><b>Q1: 为什么导师常常驳回 Navicat / PowerDesigner 导出的物理数据模型图？</b></summary>
答：在高校计算机与软工毕业设计评审中，概念模型设计（Conceptual Data Model）与物理数据库实现有着严格的学术区分。数据库软件导出的往往是包含外键约束、字段类型和索引详情的“物理表关系图”，而学术论文正文中必须呈现的是经典的<b>陈氏 ER 模型（Chen's ER Model）</b>，即矩形代表实体、椭圆代表属性、菱形代表关系。使用物理网格图代替 ER 图是毕设答辩常见的扣分点。使用 sql2diagram 可直接通过建表 SQL 一键还原规范的陈氏 ER 图。
</details>

<details>
<summary><b>Q2: 学术论文中的“标准三线表”有什么格式硬性要求？</b></summary>
答：根据国家标准（GB/T）科技论文编写规范，标准三线表由<b>顶线、底线和栏目线</b>三条水平主线组成，严禁出现竖向分割线和单元格网格线。通常顶线与底线线宽设定为 1.5 磅（粗线），栏目线设定为 0.75 磅（细线）。本项目生成的学术三线表严格遵守此比例规范，支持一键直接插入 Word 论文正文。
</details>

<details>
<summary><b>Q3: 系统分层架构图在毕业论文中应该包含哪些层次？</b></summary>
答：标准软件工程毕业设计论文通常建议采用经典分层：展现层/客户端（Web/小程序/APP）、网关及控制层、业务逻辑服务层、数据持久化访问层（DAO/Repository）以及基础设施支撑层（MySQL/Redis/消息队列）。sql2diagram 内置了多种标准分层预设，支持快速生成具有学术美感的系统分层架构图。
</details>

<details>
<summary><b>Q4: 为什么导出的图片插入 Word 打印或转 PDF 会变模糊？</b></summary>
答：普通屏幕显示通常基于 72 或 96 DPI，若直接截屏插入 Word，论文打印时会出现明显的锯齿和毛边。sql2diagram 在导出时自动通过高倍 Canvas 进行超采样，输出标准的 <b>300 DPI 超高清图像</b>，并同时支持 <b>SVG 矢量格式</b>，插入 Word 后任意放大缩放均可保持绝对锐利。
</details>

---

## 🤝 参与贡献与致谢

欢迎提交 Issue 或 Pull Request 共同完善 sql2diagram！
* 如果这个项目在你的毕业论文写作、答辩出图或日常开发中帮到了你，请给项目点一个 **⭐️ Star**，让更多被画图困扰的同学受益！
* 核心底层图形库感谢 [Vue 3](https://github.com/vuejs/core)、[AntV G6](https://github.com/antvis/G6) 及 [CodeMirror](https://github.com/codemirror/dev)。

---

## 📄 开源许可证（严格禁止商用）

本项目遵循 **[CC BY-NC-SA 4.0 (署名-非商业性使用-相同方式共享 4.0 国际版)](LICENSE)** 开源许可协议：

- ✅ **学术与个人免费**：个人学习、高校科研、毕业设计论文排版及答辩出图等**非商业用途完全免费**；
- ❌ **严格禁止商业化**：未经原作者书面许可，**严禁将本项目源码、打包制品用于任何直接或间接的商业营利活动**（包括但不限于封装为收费软件/SaaS 服务、在淘宝/闲鱼等电商平台倒卖转售、用于商业交付或商业培训收费等）。如需商业授权或定制合作，须取得原作者书面同意。
