<template>
  <section class="guide-page">
    <div class="guide-content">
      <div class="guide-icon">🗄️</div>
      <h2>ER 属性图</h2>
      <p class="guide-desc">将 SQL DDL 语句可视化为 ER 属性图，支持主键、外键、字段注释等。</p>

      <div class="guide-steps">
        <div class="guide-step">
          <span class="step-num">1</span>
          <div class="step-text">
            <strong>输入 SQL</strong>
            <span>在左侧编辑器粘贴 CREATE TABLE 语句</span>
          </div>
        </div>
        <div class="guide-step">
          <span class="step-num">2</span>
          <div class="step-text">
            <strong>生成图表</strong>
            <span>点击「生成 ER 图」按钮解析 SQL</span>
          </div>
        </div>
        <div class="guide-step">
          <span class="step-num">3</span>
          <div class="step-text">
            <strong>调整样式</strong>
            <span>通过顶部参数面板调整字体、半径等</span>
          </div>
        </div>
        <div class="guide-step">
          <span class="step-num">4</span>
          <div class="step-text">
            <strong>导出图片</strong>
            <span>点击工具栏导出按钮下载 PNG</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.guide-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.guide-content {
  text-align: center;
  max-width: 560px;
}

.guide-icon {
  font-size: 56px;
  margin-bottom: 14px;
  line-height: 1;
}

.guide-content h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text, #0f172a);
  margin: 0 0 8px 0;
}

.guide-desc {
  font-size: 13.5px;
  color: var(--text-3, #64748b);
  margin: 0 0 28px 0;
  line-height: 1.6;
}

.guide-steps {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  text-align: left;
}

.guide-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #ffffff;
  border-radius: var(--radius-md, 12px);
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.guide-step:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.3);
}

.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--primary-soft, #eff6ff);
  color: var(--primary, #024ad8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: 1px;
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.step-text strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #0f172a);
}

.step-text span {
  font-size: 12px;
  color: var(--text-3, #64748b);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .guide-steps {
    grid-template-columns: 1fr;
  }
}
</style>
