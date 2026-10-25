<template>
  <div class="home-root">
    <!-- Hero Section -->
    <section class="home-hero">
      <div class="home-hero__shell">
        <!-- 首页右上角操作区 (VIP/卡密激活) -->
        <div class="home-header-actions">
          <div v-if="accessState?.licensed" class="home-license-badge" title="尊贵的 VIP 授权用户" @click="$emit('openLicense')">
            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>VIP 剩余：{{ remainingTimeText }}</span>
          </div>
          <button
            v-else-if="showActivateBtn"
            type="button"
            class="home-activate-btn"
            title="输入卡密激活无限制使用"
            @click="$emit('openLicense')"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>激活码兑换</span>
          </button>
        </div>

        <div class="home-hero__content-wrap">
          <!-- Left Content -->
          <div class="home-hero__body">
            <span class="home-hero__badge">Graduation Project Diagram Toolkit</span>
            <h1 class="home-hero__title">毕设 ER 图与数据库三线表在线生成</h1>
            <p class="home-hero__desc">粘贴 SQL 建表语句，快速生成毕业设计可用的 ER 图、三线表和系统设计图</p>

            <div class="home-hero__chips" aria-label="常用搜索场景">
              <span>MySQL 建表语句</span>
              <span>数据库设计章节</span>
              <span>论文插图 PNG</span>
            </div>
            
            <div class="home-hero__actions">
              <button class="hp-btn hp-btn--primary" @click="$emit('go', 'er')">
                生成毕设 ER 图
                <span class="btn-arrow">→</span>
              </button>
              <button class="hp-btn hp-btn--outline" @click="$emit('go', 'linetable')">
                SQL 转三线表
              </button>
            </div>

            <!-- Metrics -->
            <div class="home-hero__metrics">
              <div class="metric-box metric-box--strong">
                <span class="metric-box__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5V5.8A2.8 2.8 0 0 1 6.8 3h10.4A2.8 2.8 0 0 1 20 5.8v13.7"/>
                    <path d="M8 7h8M8 11h8M8 15h5"/>
                  </svg>
                </span>
                <span class="metric-box__text">
                  <strong class="metric-box__value">SQL</strong> 直接解析
                </span>
              </div>
              <div class="metric-box-divider">|</div>
              <div class="metric-box">
                <span class="metric-box__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="17" x2="9" y2="10"/>
                    <line x1="13" y1="17" x2="13" y2="12"/>
                    <line x1="17" y1="17" x2="17" y2="8"/>
                  </svg>
                </span>
                <span class="metric-box__text">
                  <strong class="metric-box__value">PNG</strong> 导出格式
                </span>
              </div>
              <div class="metric-box-divider">|</div>
              <div class="metric-box">
                <span class="metric-box__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </span>
                <span class="metric-box__text">
                  <strong class="metric-box__value">{{ availableCount }}</strong> 统一工作区
                </span>
              </div>
            </div>
          </div>

          <!-- Right 3D Illustration -->
          <div class="home-hero__visual-container">
            <div class="home-hero__visual">
              <img src="/home_hero_visual.png?v=3" alt="3D 学术图表示意" class="hero-3d-img" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Workspaces (Unified Large Grid) -->
    <section class="home-section workspace-section">
      <div class="home-section__shell">
        <div class="home-section__head">
          <span class="home-section__eyebrow">Workspace</span>
          <h2>按毕业设计章节选择图表</h2>
          <p>数据库设计、系统设计、需求分析和交互流程常用图表集中在一个工作区。</p>
        </div>
        <div class="workflow-strip" aria-label="快速使用流程">
          <div class="workflow-step">
            <strong>1</strong>
            <span>粘贴 SQL 或填写结构</span>
          </div>
          <div class="workflow-step">
            <strong>2</strong>
            <span>自动排版并微调样式</span>
          </div>
          <div class="workflow-step">
            <strong>3</strong>
            <span>导出 PNG 插入论文</span>
          </div>
        </div>
        <div class="ws-grid ws-grid--all">
          <button
            v-for="tool in allTools"
            :key="tool.type"
            class="ws-card"
            @click="$emit('go', tool.type)"
          >
            <span class="ws-card__icon" v-html="tool.icon"></span>
            <div class="ws-card__body">
              <strong class="ws-card__title">{{ tool.title }}</strong>
              <p class="ws-card__desc">{{ tool.desc }}</p>
              <span class="ws-card__tag">{{ tool.tag }}</span>
            </div>
            <span class="ws-card__arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Bottom Features horizontal bar -->
    <section class="home-features">
      <div class="home-section__shell">
        <div class="features-bar">
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </span>
            <div class="feature-item__body">
              <strong class="feature-item__title">学术标准</strong>
              <span class="feature-item__desc">遵循学术规范，输出专业图表</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            </span>
            <div class="feature-item__body">
              <strong class="feature-item__title">高效生成</strong>
              <span class="feature-item__desc">智能解析，一键生成图表</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12"/>
              </svg>
            </span>
            <div class="feature-item__body">
              <strong class="feature-item__title">多种导出</strong>
              <span class="feature-item__desc">PNG 高清导出，即用即得</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
            <div class="feature-item__body">
              <strong class="feature-item__title">隐私安全</strong>
              <span class="feature-item__desc">本地处理，数据安全不泄露</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getRemainingTimeText, shouldShowActivateButton } from '../utils/access.js';

const props = defineProps({
  availableCount: {
    type: Number,
    default: 8
  },
  accessState: {
    type: Object,
    default: () => ({})
  }
});

const remainingTimeText = computed(() => {
  return getRemainingTimeText(props.accessState?.expiresAt);
});

const showActivateBtn = computed(() => {
  return shouldShowActivateButton(props.accessState);
});

defineEmits(['go', 'openLicense']);

const allTools = [
  {
    type: 'er',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`,
    title: 'SQL 转 ER 图',
    desc: '粘贴 MySQL 建表语句，生成毕业设计数据库 ER 属性图',
    tag: '数据库设计'
  },
  {
    type: 'linetable',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>`,
    title: '学术三线表',
    desc: '将数据库字段结构整理为论文可用的规范三线表',
    tag: '表结构说明'
  },
  {
    type: 'overall-er',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/></svg>`,
    title: '总体 ER 图',
    desc: '解析多表 SQL 关系，生成数据库总体实体关系图',
    tag: '多表关系'
  },
  {
    type: 'architecture',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>`,
    title: '系统架构图',
    desc: '整理系统分层与模块依赖，适合总体设计章节',
    tag: '总体设计'
  },
  {
    type: 'flowchart',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="6" rx="2"/><polygon points="12 11 20 15 12 19 4 15"/><path d="M12 9v2"/></svg>`,
    title: '流程图',
    desc: '快速构建业务流程、审批流程和系统流程图',
    tag: '业务流程'
  },
  {
    type: 'usecase',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    title: '用例图',
    desc: '梳理参与者、系统边界和 include 用例关系',
    tag: '需求分析'
  },
  {
    type: 'classdiagram',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    title: '类图',
    desc: '展现类结构、属性方法、继承实现和关联关系',
    tag: '面向对象设计'
  },
  {
    type: 'sequence',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="18" y1="14" x2="6" y2="14"/></svg>`,
    title: '时序图',
    desc: '展现登录、下单、审批等交互流程和调用顺序',
    tag: '交互设计'
  }
];
</script>

<style scoped>
/* ─── Layout ─── */
.home-root {
  padding: 0 var(--page-gutter);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.home-hero__shell,
.home-section__shell {
  width: min(100%, 1080px);
  margin: 0 auto;
  position: relative;
}

/* ─── Hero Section (左右分栏) ─── */
.home-hero {
  padding-top: 60px;
  padding-bottom: 24px;
}

.home-hero__content-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.home-hero__body {
  flex: 1;
  text-align: left;
  max-width: 560px;
}

.home-hero__badge {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-hero__title {
  margin-top: 18px;
  font-family: var(--font-display);
  font-size: clamp(34px, 4.1vw, 50px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: 0;
  color: #0f172a;
}

.home-hero__desc {
  margin-top: 16px;
  color: #475569;
  font-size: 16px;
  line-height: 1.7;
  max-width: 620px;
}

.home-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.home-hero__chips span {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(2, 74, 216, 0.14);
  border-radius: 6px;
  background: #ffffff;
  color: var(--primary-deep);
  font-size: 12px;
  font-weight: 650;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.home-hero__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 32px;
}

/* ─── Buttons ─── */
.hp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-sizing: border-box;
}

.hp-btn--primary {
  border: none;
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 8px 18px -4px rgba(2, 74, 216, 0.28);
}

.hp-btn--primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 22px -4px rgba(2, 74, 216, 0.36);
}

.btn-arrow {
  font-size: 16px;
  line-height: 1;
}

.hp-btn--outline {
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
}

.hp-btn--outline:hover {
  border-color: #94a3b8;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.04);
}

/* ─── Metrics ─── */
.home-hero__metrics {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 36px;
}

.metric-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
}

.metric-box--strong {
  padding: 0 10px;
  border: 1px solid rgba(2, 74, 216, 0.12);
  border-radius: 6px;
  background: rgba(2, 74, 216, 0.04);
}

.metric-box__icon {
  color: #2563eb;
  display: inline-flex;
  align-items: center;
}

.metric-box__icon svg {
  width: 15px;
  height: 15px;
}

.metric-box__text {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.metric-box__value {
  color: #0f172a;
  font-weight: 700;
}

.metric-box-divider {
  color: #e2e8f0;
  font-size: 13px;
  user-select: none;
}

/* 右侧 3D 渲染图与浮空/遮罩动画 */
.home-hero__visual-container {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  max-width: 480px;
  position: relative;
}

/* 3D 渲染插画背部柔和蓝色霓虹光晕 */
.home-hero__visual-container::before {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  filter: blur(40px);
  right: 15%;
  top: 10%;
  z-index: 0;
  pointer-events: none;
}

.home-hero__visual {
  width: 100%;
  animation: floatAnimation 6s ease-in-out infinite;
}

.hero-3d-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  mix-blend-mode: multiply; /* 滤除白底 */
  filter: brightness(1.05) contrast(1.08) saturate(1.02); /* 提亮对比度以漂白偏灰背景 */
  mask-image: radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0.7) 82%, rgba(0,0,0,0) 96%);
  -webkit-mask-image: radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0.7) 82%, rgba(0,0,0,0) 96%); /* 羽化边缘淡出到透明，消除矩形色块 */
}

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ─── Workspaces Section (Unified 2-column Grid) ─── */
.workspace-section {
  padding-top: 26px;
  padding-bottom: 40px;
}

.home-section__head {
  display: grid;
  gap: 8px;
  max-width: 720px;
  margin-bottom: 18px;
}

.home-section__eyebrow {
  color: var(--primary);
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-section__head h2 {
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.home-section__head p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.workflow-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.workflow-step {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 10px 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  color: #475569;
  font-size: 13px;
  font-weight: 650;
}

.workflow-step strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: #ffffff;
  font-size: 12px;
  flex-shrink: 0;
}

.ws-grid--all {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.ws-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.035);
  cursor: pointer;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
  width: 100%;
  min-height: 126px;
}

.ws-card:hover {
  transform: translateY(-4px);
  border-color: #cbd5e1;
  box-shadow: 0 20px 38px rgba(15, 23, 42, 0.08);
}

.ws-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 8px;
  background: rgba(2, 74, 216, 0.07);
  color: var(--primary);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.ws-card__icon :deep(svg) {
  width: 24px;
  height: 24px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ws-card:hover .ws-card__icon :deep(svg) {
  transform: scale(1.08);
}

.ws-card:hover .ws-card__icon {
  background: var(--primary);
  color: #ffffff;
}

.ws-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.ws-card__tag {
  display: inline-flex;
  align-self: flex-start;
  min-height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 5px;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.ws-card__title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.ws-card__desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
  /* 支持最多两行溢出省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-card__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.25s ease;
}

.ws-card__arrow svg {
  width: 14px;
  height: 14px;
}

.ws-card:hover .ws-card__arrow {
  background: #2563eb;
  color: #ffffff;
  transform: translateX(2px);
}

/* ─── Bottom Features Horizontal Bar ─── */
.home-features {
  padding-top: 12px;
  padding-bottom: 56px;
}

.features-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 22px;
  background: #f8fbff;
  border: 1px solid rgba(219, 234, 254, 0.8);
  border-radius: 10px;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.05);
}

.feature-item__icon svg {
  width: 18px;
  height: 18px;
}

.feature-item__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.feature-item__title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}

.feature-item__desc {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

/* ─── Responsive ─── */
@media (max-width: 960px) {
  .home-hero__content-wrap {
    flex-direction: column-reverse;
    text-align: center;
    gap: 24px;
  }

  .home-hero__body {
    max-width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .home-hero__title {
    font-size: 38px;
  }

  .home-hero__desc {
    max-width: 560px;
  }

  .home-hero__chips {
    justify-content: center;
  }

  .home-hero__visual-container {
    max-width: 320px;
    justify-content: center;
  }

  .home-hero__metrics {
    justify-content: center;
  }

  .ws-grid--all {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .workflow-strip {
    grid-template-columns: 1fr;
  }

  .features-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* 针对手机等窄屏折叠为单列 */
@media (max-width: 768px) {
  .ws-grid--all {
    grid-template-columns: 1fr;
  }

  .home-section__head h2 {
    font-size: 24px;
  }

  .features-bar {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }
}

@media (max-width: 640px) {
  .home-hero {
    padding-top: 36px;
  }

  .home-hero__title {
    font-size: 32px;
  }

  .home-hero__chips span {
    font-size: 11px;
  }

  .ws-card {
    padding: 20px;
    gap: 16px;
  }

  .ws-card__icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 12px;
  }

  .ws-card__title {
    font-size: 15px;
  }

  .ws-card__desc {
    font-size: 12px;
  }

  .features-bar {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }

  .feature-item__desc {
    white-space: normal;
  }
}

@media (max-width: 480px) {
  .home-root {
    padding: 0 12px;
  }

  .home-hero__actions {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }

  .hp-btn {
    width: 100%;
  }

  .home-hero__metrics {
    flex-direction: column;
    gap: 8px;
  }

  .metric-box-divider {
    display: none;
  }
}

/* 首页右上角操作区 */
.home-header-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.home-license-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  background: rgba(2, 74, 216, 0.05);
  border: 1px solid rgba(2, 74, 216, 0.15);
  border-radius: 999px;
  color: var(--primary-deep);
  font-size: 13.5px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: var(--shadow-inset);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-license-badge:hover {
  background: rgba(2, 74, 216, 0.08);
  border-color: rgba(2, 74, 216, 0.25);
  transform: translateY(-1px);
}

.home-activate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  color: #374151;
  font-size: 13.5px;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.home-activate-btn:hover {
  background: #f9fafb;
  border-color: #024ad8;
  color: #024ad8;
  box-shadow: 0 4px 12px rgba(2, 74, 216, 0.12);
  transform: translateY(-1px);
}

.badge-icon {
  width: 15px;
  height: 15px;
  color: var(--primary);
  flex-shrink: 0;
}

.btn-icon {
  width: 15px;
  height: 15px;
  color: inherit;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .home-header-actions {
    position: static;
    margin-bottom: 20px;
    justify-content: flex-end;
  }
}
</style>

