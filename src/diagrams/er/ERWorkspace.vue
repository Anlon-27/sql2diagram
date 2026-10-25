<template>
  <div class="er-workspace">
    <div class="er-layout">
      <!-- Left: SQL Input -->
      <div class="er-sql-column">
        <SqlEditor
          ref="sqlEditor"
          :initialSql="initialSql"
          @generate="onGenerate"
        />
      </div>

      <!-- Center: ER Diagram Preview -->
      <ErDiagram
        class="er-preview-column"
        ref="erDiagram"
        :table="currentTable"
        :config="config"
        :currentIndex="currentIndex"
        :total="tables.length"
        @prev="prevTable"
        @next="nextTable"
        @exportAll="exportAll"
        @updateComment="onUpdateComment"
      />

      <!-- Right: Entity List -->
      <div class="er-list-column">
        <TableList
          :tables="tables"
          v-model:activeIndex="currentIndex"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import JSZip from 'jszip';
import { PRESET_SQL } from '../../utils/constants.js';
import { parseSql, serializeSql } from '../../utils/sqlParser.js';
import { downloadBlob, exportSvgMarkupToPngBlob } from '../../utils/exportImage.js';
import { openLicenseDialog, requestGeneratePermission, commitGenerateSuccess, shouldWarnRemaining } from '../../utils/generateAccess.js';
import { defaultConfig } from './defaultConfig.js';
import { showToast } from '../../utils/toast.js';
import SqlEditor from './components/SqlEditor.vue';
import ErDiagram from './components/ErDiagram.vue';
import TableList from './components/TableList.vue';

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
});

const initialSql = PRESET_SQL;
const sqlEditor = ref(null);
const originalSql = ref('');
const tables = ref([]);
const currentIndex = ref(0);
const tableConfigs = ref({});
const erDiagram = ref(null);
// Computed
const currentTable = computed(() => {
  if (tables.value.length === 0) return null;
  return tables.value[currentIndex.value];
});

// 全局配置项（不随表切换而变化）
const GLOBAL_KEYS = new Set(['SHOW_FK_WAVY', 'SHOW_WATERMARK', 'FONT_FAMILY', 'FONT_WEIGHT', 'COMPACT_ATTR_LAYOUT']);

// Config helpers
function saveConfig(tableName) {
  const snapshot = {};
  for (const key in props.config) {
    if (GLOBAL_KEYS.has(key)) continue;
    snapshot[key] = props.config[key];
  }
  tableConfigs.value[tableName] = snapshot;
}

function loadConfig(tableName) {
  // 保存全局项当前值
  const globalValues = {};
  for (const key of GLOBAL_KEYS) {
    globalValues[key] = props.config[key];
  }
  // 重置为默认
  Object.keys(props.config).forEach(k => delete props.config[k]);
  Object.assign(props.config, defaultConfig);
  // 恢复全局项
  Object.assign(props.config, globalValues);
  // 加载表专属配置
  if (tableConfigs.value[tableName]) {
    Object.assign(props.config, tableConfigs.value[tableName]);
  } else {
    // 首次进入某张表时给出推荐半径，后续保留用户手动调整结果
    autoAdjustRadius();
  }
}

// Switch table sync
watch(currentIndex, (newIdx, oldIdx) => {
  if (oldIdx !== undefined && tables.value[oldIdx]) {
    saveConfig(tables.value[oldIdx].name);
  }
  if (tables.value[newIdx]) {
    loadConfig(tables.value[newIdx].name);
  }
});

// 当用户手动调整半径滑块时，自动跟随调整字体
watch(() => props.config.RADIUS, (newRadius) => {
  if (newRadius) autoFontSize(newRadius);
});

// Actions
async function onGenerate(sql) {
  try {
    const decision = await requestGeneratePermission();
    if (!decision.allowed) {
      return;
    }

    const parsed = parseSql(sql);
    if (parsed.length === 0) {
      showToast('未能解析出任何 CREATE TABLE 语句，请检查 SQL 格式', 'error');
      return;
    }
    originalSql.value = sql;
    tables.value = parsed;
    currentIndex.value = 0;
    tableConfigs.value = {};
    // 重置为默认
    Object.keys(props.config).forEach(k => delete props.config[k]);
    Object.assign(props.config, defaultConfig);
    autoAdjustRadius();
    await commitGenerateSuccess();
    if (shouldWarnRemaining(decision.access)) {
      showToast('生成成功，免费次数即将用完', 'warn');
    }
  } catch (e) {
    showToast('解析失败: ' + (e.message || '请确认 SQL 内容格式正确'), 'error');
    console.error(e);
  }
}

function prevTable() {
  if (tables.value.length === 0) return;
  currentIndex.value = (currentIndex.value - 1 + tables.value.length) % tables.value.length;
}

function nextTable() {
  if (tables.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % tables.value.length;
}

function autoAdjustRadius() {
  const table = tables.value[currentIndex.value];
  if (!table) return;
  const attrCount = table.columns.length;
  const gap = 20;
  const arcPerAttr = 2 * props.config.ATTR_RX + gap;
  const minRadius = (attrCount * arcPerAttr) / (2 * Math.PI);

  let recommended = Math.max(minRadius, 220);
  recommended = Math.min(recommended, 800);

  props.config.RADIUS = Math.round(recommended);
  autoFontSize(props.config.RADIUS);
}

function autoFontSize(radius) {
  if (radius > 460) props.config.FONT_SIZE = 24;
  else if (radius > 380) props.config.FONT_SIZE = 22;
  else if (radius > 310) props.config.FONT_SIZE = 20;
}

// 更新备注并同步到左侧 SQL
function onUpdateComment(payload) {
  const table = tables.value.find(t => t.name === payload.tableName);
  if (!table) return;

  if (payload.type === 'table') {
    table.comment = payload.newComment;
  } else {
    const col = table.columns.find(c => c.name === payload.columnName);
    if (col) col.comment = payload.newComment;
  }

  syncSqlToEditor();
}

// 根据当前 tables 数据重新生成 SQL，同步到编辑器
async function syncSqlToEditor() {
  if (!originalSql.value || tables.value.length === 0) return;

  try {
    const sql = serializeSql(tables.value);
    originalSql.value = sql;
    if (sqlEditor.value) {
      sqlEditor.value.setSql(sql);
    }
  } catch (error) {
    console.error(error);
  }
}

async function exportAll() {
  if (tables.value.length === 0) return;

  const savedIndex = currentIndex.value;

  try {
    const zip = new JSZip();

    for (let i = 0; i < tables.value.length; i++) {
      currentIndex.value = i;
      await nextTick();

      if (erDiagram.value?.waitForRenderedTable) {
        await erDiagram.value.waitForRenderedTable(tables.value[i].name);
      } else {
        await new Promise(r => setTimeout(r, 250));
      }

      if (erDiagram.value) {
        const svgMarkup = erDiagram.value.getSvgMarkup?.();
        if (svgMarkup) {
          const tableName = getExportTableName(tables.value[i]);
          const blob = await exportSvgMarkupToPngBlob(svgMarkup, 2);
          zip.file(`${tableName}_属性图.png`, blob);
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `ER属性图批量导出_${formatExportTimestamp()}.zip`);
  } catch (e) {
    console.error(e);
    showToast('批量导出失败', 'error');
  } finally {
    currentIndex.value = savedIndex;
  }
}

async function loadDemoPreview() {
  try {
    const parsed = parseSql(initialSql);
    if (parsed.length === 0) return;
    originalSql.value = initialSql;
    tables.value = parsed;
    currentIndex.value = 0;
    tableConfigs.value = {};
    Object.keys(props.config).forEach(k => delete props.config[k]);
    Object.assign(props.config, defaultConfig);
    autoAdjustRadius();
  } catch (e) {
    console.error('加载 ER 示例失败', e);
  }
}

onMounted(() => {
  loadDemoPreview();
});

function getExportTableName(table) {
  const rawName = table?.comment || table?.name || 'ER图';
  return String(rawName).replace(/[\\/:*?"<>|]/g, '_').trim() || 'ER图';
}

function formatExportTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hour}${minute}`;
}
</script>

<style scoped>
.er-workspace {
  display: contents;
}

.er-layout {
  display: grid;
  grid-template-columns: clamp(240px, 22vw, 316px) minmax(0, 0.9fr) clamp(220px, 20vw, 280px);
  gap: 24px;
  padding: 12px 0;
  align-items: stretch;
}

.er-sql-column,
.er-list-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.er-preview-column {
  min-width: 0;
  height: 100%;
}

.er-sql-column :deep(.sql-panel) {
  height: 100%;
  min-height: 560px;
}

.er-list-column :deep(.table-list-panel) {
  height: 100%;
  min-height: 560px;
}

.er-sql-column :deep(.panel-body),
.er-list-column :deep(.panel-body) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.er-preview-column :deep(.canvas-panel) {
  height: 100%;
  min-height: 560px;
}

@media (max-width: 980px) {
  .er-layout {
    grid-template-columns: 1fr;
  }

  .er-sql-column :deep(.sql-panel),
  .er-list-column :deep(.table-list-panel) {
    min-height: auto;
  }

  .er-list-column :deep(.panel-body) {
    max-height: none;
  }

  .er-preview-column :deep(.canvas-panel) {
    min-height: 560px;
  }
}

@media (max-width: 640px) {
  .er-layout {
    padding: 0;
    gap: 8px;
  }
}
</style>
