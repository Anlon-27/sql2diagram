<template>
  <section v-if="content" class="seo-content">
    <div class="seo-content-inner">
      <!-- 顶部轻量概览头 -->
      <header class="seo-hero">
        <div class="seo-hero-header">
          <div class="seo-hero-badge">
            <span class="badge-dot"></span>
            <span>说明与指南</span>
          </div>
          <div class="seo-hero-stats">
            <span v-if="content.sections?.length" class="stat-pill">
              <em>{{ content.sections.length }}</em> 说明模块
            </span>
            <span v-if="content.tutorialSteps?.length" class="stat-pill">
              <em>{{ content.tutorialSteps.length }}</em> 上手步骤
            </span>
            <span v-if="content.faq?.length" class="stat-pill">
              <em>{{ content.faq.length }}</em> 常见问题
            </span>
            <span v-if="content.relatedGuides?.length" class="stat-pill">
              <em>{{ content.relatedGuides.length }}</em> 延伸教程
            </span>
          </div>
        </div>

        <h1 class="seo-hero-title">{{ content.h1 }}</h1>
        <p class="seo-hero-desc">{{ content.intro }}</p>

        <div v-if="content.overview?.length" class="seo-hero-tags">
          <span v-for="item in content.overview" :key="item" class="hero-tag">
            {{ item }}
          </span>
        </div>
      </header>

      <!-- 主要内容网格 -->
      <div class="seo-sections-grid">
        <!-- 1. 工具说明 -->
        <section v-if="content.sections?.length" class="seo-block">
          <div class="block-head">
            <span class="block-kicker">Overview</span>
            <h2 class="block-title">工具说明</h2>
          </div>
          <div class="cards-grid">
            <article
              v-for="(section, index) in content.sections"
              :key="section.title"
              class="card-item"
            >
              <div class="card-item-top">
                <h3 class="card-item-title">{{ section.title }}</h3>
                <span class="card-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
              </div>
              <p
                v-for="paragraph in section.paragraphs || []"
                :key="paragraph"
                class="card-item-text"
              >
                {{ paragraph }}
              </p>
              <ul v-if="section.list?.length" class="card-item-list">
                <li v-for="item in section.list" :key="item">{{ item }}</li>
              </ul>
            </article>
          </div>
        </section>

        <!-- 2. 快速上手 -->
        <section v-if="content.tutorialSteps?.length" class="seo-block">
          <div class="block-head">
            <span class="block-kicker">Tutorial</span>
            <h2 class="block-title">快速上手</h2>
          </div>
          <div class="cards-grid">
            <article
              v-for="(item, index) in content.tutorialSteps"
              :key="item.title"
              class="card-item tutorial-card"
            >
              <div class="step-badge">{{ index + 1 }}</div>
              <div class="step-content">
                <h3 class="card-item-title">{{ item.title }}</h3>
                <p class="card-item-text">{{ item.desc }}</p>
              </div>
            </article>
          </div>
        </section>

        <!-- 3. 常见问题 -->
        <section v-if="content.faq?.length" class="seo-block">
          <div class="block-head">
            <span class="block-kicker">FAQ</span>
            <h2 class="block-title">常见问题</h2>
          </div>
          <div class="cards-grid">
            <article
              v-for="(item, index) in content.faq"
              :key="item.q"
              class="card-item faq-card"
            >
              <div class="faq-q-head">
                <span class="faq-tag">Q{{ index + 1 }}</span>
                <h3 class="card-item-title">{{ item.q }}</h3>
              </div>
              <p class="card-item-text faq-answer">{{ item.a }}</p>
            </article>
          </div>
        </section>

        <!-- 4. 相关教程 -->
        <section v-if="content.relatedGuides?.length" class="seo-block">
          <div class="block-head">
            <span class="block-kicker">Guides</span>
            <h2 class="block-title">相关教程</h2>
          </div>
          <div class="guides-grid">
            <a
              v-for="item in content.relatedGuides"
              :key="item.href"
              class="guide-card"
              :href="item.href"
            >
              <div class="guide-info">
                <span class="guide-title">{{ item.title }}</span>
                <span class="guide-subtitle">查看详细教程与规范说明</span>
              </div>
              <div class="guide-arrow-circle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  content: {
    type: Object,
    default: null
  }
});
</script>

<style scoped>
.seo-content {
  margin-top: 24px;
  padding-bottom: 40px;
}

.seo-content-inner {
  width: min(calc(100% - 2 * var(--page-gutter)), var(--content-width));
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Hero 顶部卡片 ── */
.seo-hero {
  position: relative;
  background: var(--surface-solid);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: border-color var(--transition-snappy);
}

.seo-hero-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.seo-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
}

.seo-hero-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-3);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  padding: 3px 9px;
  border-radius: 999px;
}

.stat-pill em {
  font-style: normal;
  font-weight: 700;
  color: var(--primary);
}

.seo-hero-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.35;
  letter-spacing: -0.02em;
  margin: 0 0 8px 0;
}

.seo-hero-desc {
  font-size: 13px;
  line-height: 1.68;
  color: var(--text-2);
  margin: 0;
  max-width: 980px;
}

.seo-hero-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-2);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  padding: 3px 10px;
  border-radius: 6px;
}

/* ── 内容网格区 ── */
.seo-sections-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.seo-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.block-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 2px;
}

.block-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 7px;
  border-radius: 4px;
  line-height: 1.4;
}

.block-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
  margin: 0;
}

/* ── 卡片网格 ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cards-grid > :last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

.card-item {
  position: relative;
  background: var(--surface-solid);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition:
    transform var(--transition-snappy),
    border-color var(--transition-snappy),
    box-shadow var(--transition-snappy);
}

.card-item:hover {
  transform: translateY(-1px);
  border-color: var(--border-strong);
  box-shadow: 0 4px 12px rgba(2, 74, 216, 0.04);
}

.card-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.card-item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  line-height: 1.4;
}

.card-item-index {
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 6px;
  border-radius: 4px;
}

.card-item-text {
  font-size: 12.5px;
  line-height: 1.68;
  color: var(--text-2);
  margin: 6px 0 0 0;
}

.card-item-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 10px 0 0 0;
  padding: 0;
}

.card-item-list li {
  position: relative;
  padding-left: 14px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-2);
}

.card-item-list li::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 0.65em;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
}

/* ── 快速上手卡片 ── */
.tutorial-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.step-content {
  flex: 1;
  min-width: 0;
}

/* ── FAQ 问答卡片 ── */
.faq-q-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.faq-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.faq-answer {
  padding-left: 2px;
}

/* ── 延伸教程卡片 ── */
.guides-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.guides-grid > :last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

.guide-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: var(--surface-solid);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition:
    transform var(--transition-snappy),
    border-color var(--transition-snappy),
    box-shadow var(--transition-snappy);
}

.guide-card:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
  box-shadow: 0 4px 14px rgba(2, 74, 216, 0.08);
}

.guide-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.guide-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  transition: color var(--transition-snappy);
}

.guide-card:hover .guide-title {
  color: var(--primary);
}

.guide-subtitle {
  font-size: 11.5px;
  color: var(--text-3);
}

.guide-arrow-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-soft);
  color: var(--text-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background var(--transition-snappy),
    color var(--transition-snappy),
    transform var(--transition-snappy);
}

.guide-card:hover .guide-arrow-circle {
  background: var(--primary);
  color: #ffffff;
  transform: translateX(2px) translateY(-2px);
}

/* ── 响应式适配 ── */
@media (max-width: 840px) {
  .cards-grid,
  .guides-grid {
    grid-template-columns: 1fr;
  }

  .seo-hero {
    padding: 20px 20px;
  }

  .seo-hero-title {
    font-size: 18px;
  }
}

@media (max-width: 560px) {
  .seo-hero-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .seo-hero-stats {
    width: 100%;
  }

  .card-item,
  .guide-card {
    padding: 14px 16px;
  }
}
</style>
