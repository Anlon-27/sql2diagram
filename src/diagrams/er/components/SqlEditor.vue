<template>
  <div class="panel sql-panel">
    <div class="panel-header">
      <span class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      </span> 输入 SQL 语句
    </div>
    <div class="panel-body">
      <textarea
        v-model="sql"
        class="sql-input"
        :placeholder="placeholder"
      ></textarea>
      <div class="sql-footer">
        <span class="char-count" :class="{ warn: sql.length > 80000 }">
          {{ sql.length }} 字符
        </span>
      </div>
      <div class="btn-group">
        <!-- 上传文件 (左上 - 浅蓝色) -->
        <button @click="openFile" class="btn-action btn-action--upload" title="上传 SQL 文件">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          上传文件
        </button>
        <input ref="fileInput" type="file" accept=".sql,.txt,.md,.doc" style="display:none" @change="onFileChange">
        
        <!-- 导出 SQL (右上 - 浅绿色) -->
        <button @click="onExportSql" class="btn-action btn-action--export" title="导出 SQL 文件">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          导出 SQL
        </button>

        <!-- 清空 (左下 - 浅红色) -->
        <button @click="onClear" class="btn-action btn-action--clear" title="清空内容">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21q.497.376 1.062.634.636.277.976.882a1.125 1.125 0 0 1 .622 1.014v5.236a.75.75 0 0 1-.75.75H6.33a.75.75 0 0 1-.75-.75v-5.236c0-.41.187-.785.498-1.032a1.124 1.124 0 0 1 1.016-.882q.592-.26 1.112-.634M12 2.25v2.25m-6.75 1.5h13.5a2.25 2.25 0 0 1 2.25 2.25v1.5a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75v-1.5A2.25 2.25 0 0 1 7.5 6Z" />
          </svg>
          清空
        </button>

        <!-- 生成 (右下 - 亮眼深蓝渐变) -->
        <button @click="onGenerate" class="btn-action btn-action--generate">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653Z" />
          </svg>
          生成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { filterSql } from '../../../utils/sqlInput.js';
import { showToast } from '../../../utils/toast.js';

const props = defineProps({
  initialSql: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['generate']);

const sql = ref(props.initialSql);
const fileInput = ref(null);

const placeholder = `请输入 CREATE TABLE 语句，支持多个表...

示例：
CREATE TABLE users (
  id INT PRIMARY KEY COMMENT '用户ID',
  name VARCHAR(50) COMMENT '用户名'
) COMMENT='用户基本信息';`;

function openFile() {
  fileInput.value?.click();
}

function onFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    // 上传后自动过滤无关内容（INSERT/VALUES 等），保留有用的 SQL
    sql.value = filterSql(e.target.result);
  };
  reader.readAsText(file);
  event.target.value = '';
}

function onGenerate() {
  if (!sql.value.trim()) {
    showToast('请输入 SQL 语句', 'warn');
    return;
  }
  emit('generate', sql.value);
}

function onClear() {
  sql.value = '';
}

function onExportSql() {
  if (!sql.value.trim()) {
    showToast('请先输入内容', 'warn');
    return;
  }
  const blob = new Blob([sql.value], { type: 'text/sql;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'export.sql';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

defineExpose({ setSql });
function setSql(val) {
  sql.value = val;
}
</script>

<style scoped>
.sql-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}

.sql-input {
  flex: 1 1 auto;
  min-height: 420px;
}

/* 2×2 对称操作按钮组 */
.btn-group {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
}

/* 精致按钮样式基础定义 */
.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn-action:hover {
  transform: translateY(-1.5px);
}

.btn-action:active {
  transform: translateY(0);
}

.btn-action .svg-icon {
  width: 15px;
  height: 15px;
  stroke-width: 2.2px;
}

/* 1. 上传文件 (左上 - 浅蓝色) */
.btn-action--upload {
  background: #eff6ff;
  border-color: #dbeafe;
  color: var(--primary);
}

.btn-action--upload:hover {
  background: #dbeafe;
  border-color: #bfdbfe;
  color: var(--primary-deep);
  box-shadow: 0 4px 10px rgba(2, 74, 216, 0.08);
}

/* 2. 导出 SQL (右上 - 浅绿色) */
.btn-action--export {
  background: #f0fdf4;
  border-color: #dcfce7;
  color: #16a34a;
}

.btn-action--export:hover {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #15803d;
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.08);
}

/* 3. 清空 (左下 - 浅红色) */
.btn-action--clear {
  background: #fef2f2;
  border-color: #fee2e2;
  color: #dc2626;
}

.btn-action--clear:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
  box-shadow: 0 4px 10px rgba(220, 38, 38, 0.08);
}

/* 4. 生成 (右下 - 核心主色蓝) */
.btn-action--generate {
  background: var(--primary);
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 74, 216, 0.25);
}

.btn-action--generate:hover {
  background: var(--primary-hover);
  box-shadow: 0 6px 16px rgba(2, 74, 216, 0.35);
}

.sql-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.char-count {
  font-size: 11px;
  color: var(--text-3);
}

.char-count.warn {
  color: var(--danger);
}

@media (max-width: 768px) {
  .btn-group {
    gap: 6px;
  }

  .btn-action {
    height: 36px;
    font-size: 12px;
    border-radius: 8px;
  }

  .sql-input {
    min-height: 320px !important;
    font-size: 13px;
  }

  .char-count {
    font-size: 11px;
  }
}

@media (max-width: 560px) {
  .btn-group {
    grid-template-columns: repeat(2, 1fr); /* 依然保持 2×2 排列以节省高度空间 */
    gap: 6px;
  }

  .sql-input {
    min-height: 260px !important;
  }
}
</style>
