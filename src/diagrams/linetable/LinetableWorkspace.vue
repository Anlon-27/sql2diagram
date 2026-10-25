<template>
  <div class="linetable-workspace">
    <!-- Left: SQL Input Panel -->
    <div class="left-panel panel">
      <div class="panel-header">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </span> {{ inputMode === 'custom' ? '自定义三线表' : '输入 SQL 语句' }}
      </div>
      <div class="panel-body">
        <div class="mode-switch">
          <button class="mode-btn" :class="{ active: inputMode === 'sql' }" @click="switchMode('sql')">SQL模式</button>
          <button class="mode-btn" :class="{ active: inputMode === 'custom' }" @click="switchMode('custom')">自定义表格</button>
        </div>
        <template v-if="inputMode === 'sql'">
          <textarea
            v-model="sql"
            class="sql-input"
            :placeholder="placeholder"
          ></textarea>
          <div class="sql-footer">
            <span class="char-count" :class="{ warn: sql.length > 80000 }">{{ sql.length }} 字符</span>
          </div>
          <div class="btn-group">
            <!-- 上传文件 (左上 - 浅蓝色) -->
            <button @click="openFile" class="btn-action btn-action--upload" title="上传 SQL 文件">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              上传文件
            </button>
            <input ref="fileInput" type="file" accept=".sql,.txt,.md" style="display:none" @change="onFileChange">

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
        </template>
        <template v-else>
          <div class="custom-form">
            <!-- 1. 表标题 -->
            <div class="custom-group">
              <div class="custom-group-head">
                <label class="custom-label">表标题</label>
              </div>
              <input v-model="customTable.title" class="custom-input" placeholder="例如：表1 用户信息表" />
            </div>

            <!-- 2. 表头列管理 (胶囊流排布) -->
            <div class="custom-group">
              <div class="custom-group-head">
                <div class="label-with-count">
                  <label class="custom-label">表头列</label>
                  <span class="count-badge">{{ customTable.headers.length }} 列</span>
                </div>
                <button class="link-btn link-btn--primary" @click="addCustomColumn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  新增列
                </button>
              </div>
              <div class="custom-headers-flow">
                <div
                  v-for="(header, colIndex) in customTable.headers"
                  :key="`col-${colIndex}`"
                  class="col-pill"
                >
                  <span class="col-pill-idx">{{ colIndex + 1 }}</span>
                  <input
                    v-model="customTable.headers[colIndex]"
                    class="col-pill-input"
                    :placeholder="`列${colIndex + 1}`"
                    :title="`编辑第 ${colIndex + 1} 列表头名称`"
                  />
                  <button
                    class="col-pill-del"
                    title="删除该列"
                    :disabled="customTable.headers.length <= 1"
                    @click="removeCustomColumn(colIndex)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. 表格数据行 (自适应行卡片流，彻底告别横向滑动) -->
            <div class="custom-group">
              <div class="custom-group-head">
                <div class="label-with-count">
                  <label class="custom-label">表格数据</label>
                  <span class="count-badge">{{ customTable.rows.length }} 行</span>
                </div>
                <div class="custom-actions">
                  <button class="link-btn link-btn--primary" @click="addCustomRow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    新增行
                  </button>
                  <button class="link-btn" @click="showPasteImport = !showPasteImport" title="从 Excel/Markdown 快速粘贴表格">
                    📋 粘贴导入
                  </button>
                  <button class="link-btn" @click="fillCustomExample">示例</button>
                </div>
              </div>

              <!-- 快速粘贴导入抽屉 -->
              <div v-if="showPasteImport" class="paste-import-panel">
                <div class="paste-import-head">
                  <span>直接粘贴 Excel / TSV / Markdown 表格文本：</span>
                  <button class="paste-import-close" @click="showPasteImport = false">×</button>
                </div>
                <textarea
                  v-model="pasteImportText"
                  class="paste-import-textarea"
                  placeholder="例如：
序号	姓名	角色
1	张三	管理员
2	李四	普通用户"
                ></textarea>
                <div class="paste-import-actions">
                  <button class="btn-action btn-action--generate" style="height: 32px; font-size: 12px;" @click="handlePasteImport">确认解析导入</button>
                  <button class="link-btn" style="min-height: 32px;" @click="showPasteImport = false">取消</button>
                </div>
              </div>

              <!-- 自适应纵向行卡片流 -->
              <div class="custom-row-cards">
                <div
                  v-for="(row, rowIndex) in customTable.rows"
                  :key="`row-${rowIndex}`"
                  class="custom-row-card"
                >
                  <div class="row-card-head">
                    <span class="row-card-idx">第 {{ rowIndex + 1 }} 行</span>
                    <div class="row-card-actions">
                      <button
                        class="row-mini-btn"
                        title="复制并插入此行"
                        @click="duplicateCustomRow(rowIndex)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        复制
                      </button>
                      <button
                        class="row-mini-btn row-mini-btn--danger"
                        title="删除本行"
                        :disabled="customTable.rows.length <= 1"
                        @click="removeCustomRow(rowIndex)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        删除
                      </button>
                    </div>
                  </div>
                  <div class="row-cells-grid" :style="{ '--col-count': customTable.headers.length }">
                    <div
                      v-for="(cell, colIndex) in row"
                      :key="`cell-${rowIndex}-${colIndex}`"
                      class="cell-field"
                    >
                      <label class="cell-label" :title="customTable.headers[colIndex] || `列${colIndex + 1}`">
                        {{ customTable.headers[colIndex] || `列${colIndex + 1}` }}
                      </label>
                      <input
                        v-model="customTable.rows[rowIndex][colIndex]"
                        class="cell-input"
                        :placeholder="`输入${customTable.headers[colIndex] || `列${colIndex + 1}`}`"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部操作按钮组 -->
            <div class="btn-group">
              <!-- 清空 (左下 - 浅红色) -->
              <button @click="clearCustomTable" class="btn-action btn-action--clear" title="清空自定义表格">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21q.497.376 1.062.634.636.277.976.882a1.125 1.125 0 0 1 .622 1.014v5.236a.75.75 0 0 1-.75.75H6.33a.75.75 0 0 1-.75-.75v-5.236c0-.41.187-.785.498-1.032a1.124 1.124 0 0 1 1.016-.882q.592-.26 1.112-.634M12 2.25v2.25m-6.75 1.5h13.5a2.25 2.25 0 0 1 2.25 2.25v1.5a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75v-1.5A2.25 2.25 0 0 1 7.5 6Z" />
                </svg>
                清空
              </button>
              <!-- 生成 (右下 - 核心亮蓝渐变) -->
              <button @click="generateCustomTable" class="btn-action btn-action--generate">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653Z" />
                </svg>
                生成
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Right: Preview Panel -->
    <div class="right-panel">
      <div class="preview-header" v-if="tables.length > 0">
        <span>预览 ({{ tables.length }} 张表)</span>
        <div class="preview-actions">
          <button class="btn-sm" type="button" @click="exportPreviewPng">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V3.75m0 12.75 4.5-4.5m-4.5 4.5-4.5-4.5M4.5 19.5h15" />
            </svg>
            导出 PNG
          </button>
        </div>
      </div>
      <div ref="previewRef" class="preview-body">
        <template v-if="tables.length > 0">
          <div
            v-for="(table, idx) in tables"
            :key="idx"
            class="three-line-table"
            :style="tableStyle"
          >
            <div class="table-title" :style="titleStyle">{{ getTableTitle(table, idx) }}</div>
            <table :style="tableFrameStyle">
              <thead>
                <tr :style="headerStyle">
                  <template v-if="table.customTable">
                    <th
                      v-for="(header, headerIndex) in table.headers"
                      :key="`custom-head-${headerIndex}`"
                      :style="{ width: `${getCustomColumnWidths(table)[headerIndex]}%`, fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }"
                    >{{ header }}</th>
                  </template>
                  <template v-else>
                    <th v-if="props.config.SHOW_IDX" :style="{ width: props.config.COL_IDX_WIDTH + '%', fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }">{{ props.config.LABEL_IDX || '序号' }}</th>
                    <th v-if="props.config.SHOW_NAME" :style="{ width: props.config.COL_NAME_WIDTH + '%', fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }">{{ props.config.LABEL_NAME || '字段名称' }}</th>
                    <th v-if="props.config.SHOW_TYPE" :style="{ width: props.config.COL_TYPE_WIDTH + '%', fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }">{{ props.config.LABEL_TYPE || '类型' }}</th>
                    <th v-if="props.config.SHOW_LEN" :style="{ width: props.config.COL_LEN_WIDTH + '%', fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }">{{ props.config.LABEL_LEN || '长度' }}</th>
                    <th v-if="props.config.SHOW_NULL" :style="{ width: props.config.COL_NULL_WIDTH + '%', fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }">{{ props.config.LABEL_NULL || '允许空' }}</th>
                    <th v-if="props.config.SHOW_DEFAULT" :style="{ width: props.config.COL_DEFAULT_WIDTH + '%', fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }">{{ props.config.LABEL_DEFAULT || '默认值' }}</th>
                    <th v-if="props.config.SHOW_COMMENT" :style="{ width: props.config.COL_COMMENT_WIDTH + '%', fontFamily: headerFontFamily, fontSize: cellFontSize, ...headerCellStyle }">{{ props.config.LABEL_COMMENT || '字段说明' }}</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <template v-if="table.customTable">
                  <tr v-for="(row, rowIndex) in table.rows" :key="`custom-row-${rowIndex}`">
                    <td
                      v-for="(cell, colIndex) in row"
                      :key="`custom-cell-${rowIndex}-${colIndex}`"
                      :style="{ width: `${getCustomColumnWidths(table)[colIndex]}%`, fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(rowIndex === table.rows.length - 1 ? bodyLastCellStyle : {}) }"
                    >{{ cell || (props.config.EMPTY_PLACEHOLDER || '-') }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="(col, cIdx) in table.columns" :key="cIdx">
                    <td v-if="props.config.SHOW_IDX" :style="{ width: props.config.COL_IDX_WIDTH + '%', fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(cIdx === table.columns.length - 1 ? bodyLastCellStyle : {}) }">{{ cIdx + 1 }}</td>
                    <td v-if="props.config.SHOW_NAME" :style="{ width: props.config.COL_NAME_WIDTH + '%', fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(cIdx === table.columns.length - 1 ? bodyLastCellStyle : {}) }">{{ col.name || (props.config.EMPTY_PLACEHOLDER || '-') }}</td>
                    <td v-if="props.config.SHOW_TYPE" :style="{ width: props.config.COL_TYPE_WIDTH + '%', fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(cIdx === table.columns.length - 1 ? bodyLastCellStyle : {}) }">{{ getBaseType(col.type) || (props.config.EMPTY_PLACEHOLDER || '-') }}</td>
                    <td v-if="props.config.SHOW_LEN" :style="{ width: props.config.COL_LEN_WIDTH + '%', fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(cIdx === table.columns.length - 1 ? bodyLastCellStyle : {}) }">{{ getLength(col.type) || (props.config.EMPTY_PLACEHOLDER || '-') }}</td>
                    <td v-if="props.config.SHOW_NULL" :style="{ width: props.config.COL_NULL_WIDTH + '%', fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(cIdx === table.columns.length - 1 ? bodyLastCellStyle : {}) }">{{ col.nullable ? '是' : '否' }}</td>
                    <td v-if="props.config.SHOW_DEFAULT" :style="{ width: props.config.COL_DEFAULT_WIDTH + '%', fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(cIdx === table.columns.length - 1 ? bodyLastCellStyle : {}) }">{{ col.defaultValue || (props.config.EMPTY_PLACEHOLDER || '-') }}</td>
                    <td v-if="props.config.SHOW_COMMENT" :style="{ width: props.config.COL_COMMENT_WIDTH + '%', fontFamily: cellFontFamily, fontSize: cellFontSize, ...bodyCellStyle, ...(cIdx === table.columns.length - 1 ? bodyLastCellStyle : {}) }" @dblclick="startEdit(idx, cIdx, 'comment', col.comment)">
                      <template v-if="editingCell && editingCell.tableIdx === idx && editingCell.colIdx === cIdx && editingCell.field === 'comment'">
                        <input ref="editInput" v-model="editingCell.value" @blur="saveEdit(editingCell.value)" @keyup.enter="saveEdit(editingCell.value)" @keyup.escape="cancelEdit()" :style="{ fontFamily: cellFontFamily }" class="cell-edit-input" />
                      </template>
                      <template v-else>{{ col.comment || (props.config.EMPTY_PLACEHOLDER || '-') }}</template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="empty-preview">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;color:#ccc;">
            <path d="M3 10h18M3 14h18M3 6h18M3 18h18" />
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <p>{{ inputMode === 'custom' ? '请在左侧填写表头和数据后生成' : '请在左侧输入 SQL 并生成' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { parseSql, serializeSql } from '../../utils/sqlParser.js';
import { filterSql } from '../../utils/sqlInput.js';
import { PRESET_SQL } from '../../utils/constants.js';
import { downloadBlob } from '../../utils/exportImage.js';
import { openLicenseDialog, requestGeneratePermission, commitGenerateSuccess, shouldWarnRemaining } from '../../utils/generateAccess.js';
import { showToast } from '../../utils/toast.js';

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
});

const sql = ref(PRESET_SQL);
const inputMode = ref('sql');
const originalSql = ref('');
const tables = ref([]);
const fileInput = ref(null);
const previewRef = ref(null);

const editingCell = ref(null); // { tableIdx, colIdx, value }
const customTable = ref(createEmptyCustomTable());
const showPasteImport = ref(false);
const pasteImportText = ref('');

const placeholder = `请输入 CREATE TABLE 语句，支持多个表...

示例：
CREATE TABLE users (
  id INT PRIMARY KEY COMMENT '用户ID',
  name VARCHAR(50) COMMENT '用户名'
) COMMENT='用户基本信息';`;

function getFontStack() {
  const cnFont = props.config.CN_FONT_FAMILY || 'SimSun, serif';
  const enFont = props.config.EN_FONT_FAMILY || 'Times New Roman, serif';
  return `${enFont}, ${cnFont}`;
}

function createEmptyCustomTable() {
  return {
    title: '表1 自定义三线表',
    headers: ['项目', '内容', '说明'],
    widths: [33, 34, 33],
    rows: [
      ['用户名称', '张三', '示例数据'],
      ['账号状态', '启用', '可按需修改']
    ]
  };
}

// Dynamic styles from config
const lineStyle = computed(() => {
  const c = props.config;
  return c.LINE_STYLE || 'solid';
});

const topColor = computed(() => {
  const c = props.config;
  return c.TOP_LINE_COLOR || '#000000';
});

const midColor = computed(() => {
  const c = props.config;
  return c.MIDDLE_LINE_COLOR || '#000000';
});

const botColor = computed(() => {
  const c = props.config;
  return c.BOTTOM_LINE_COLOR || '#000000';
});

const tableStyle = computed(() => ({
  fontFamily: getFontStack(),
  lineHeight: props.config.CELL_LINE_HEIGHT || 1.5,
  textAlign: 'left'
}));

const titleStyle = computed(() => ({
  fontFamily: getFontStack(),
  fontSize: `${props.config.CAPTION_FONT_SIZE || 14}px`,
  color: '#000000'
}));

const tableFrameStyle = computed(() => ({
  borderTop: `${props.config.TOP_LINE_WIDTH}px ${lineStyle.value} ${topColor.value}`
}));

const headerCellStyle = computed(() => ({
  textAlign: props.config.HEADER_CENTERED ? 'center' : 'left',
  borderBottom: `${props.config.MIDDLE_LINE_WIDTH}px ${lineStyle.value} ${midColor.value}`
}));

const bodyCellStyle = computed(() => ({
  textAlign: props.config.CELL_CENTERED ? 'center' : 'left'
}));

const bodyLastCellStyle = computed(() => ({
  borderBottom: `${props.config.BOTTOM_LINE_WIDTH}px ${lineStyle.value} ${botColor.value}`
}));

const headerStyle = computed(() => ({
  borderTop: `${props.config.TOP_LINE_WIDTH}px ${lineStyle.value} ${topColor.value}`,
  borderBottom: `${props.config.MIDDLE_LINE_WIDTH}px ${lineStyle.value} ${midColor.value}`
}));

const headerFontFamily = computed(() => getFontStack());

const cellFontFamily = computed(() => getFontStack());

const cellFontSize = computed(() => `${props.config.CELL_FONT_SIZE || 14}px`);

function getBaseType(typeStr) {
  if (!typeStr) return '';
  const match = typeStr.match(/^([a-zA-Z_]+)/);
  return match ? match[1].toUpperCase() : typeStr;
}

function getLength(typeStr) {
  if (!typeStr) return '';
  const match = typeStr.match(/\((\d+)\)/);
  return match ? match[1] : '';
}

function openFile() {
  fileInput.value?.click();
}

function switchMode(mode) {
  inputMode.value = mode;
  if (mode === 'custom') {
    tables.value = [buildCustomPreviewTable()];
    return;
  }
  loadSqlPreview().catch((error) => {
    tables.value = [];
    console.error(error);
  });
}

function onFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    sql.value = e.target.result;
  };
  reader.readAsText(file);
  event.target.value = '';
}

async function onGenerate() {
  if (!sql.value.trim()) {
    showToast('请输入 SQL 语句', 'warn');
    return;
  }
  try {
    const decision = await requestGeneratePermission();
    if (!decision.allowed) {
      openLicenseDialog();
      return;
    }

    const parsed = parseSql(filterSql(sql.value));
    if (parsed.length === 0) {
      showToast('未能解析出任何 CREATE TABLE 语句，请检查 SQL 格式', 'error');
      return;
    }
    originalSql.value = sql.value;
    tables.value = parsed;
    await commitGenerateSuccess();
    if (shouldWarnRemaining(decision.access)) {
      showToast('生成成功，免费次数即将用完', 'warn');
    }
  } catch (e) {
    showToast('解析失败: ' + (e.message || '请确认 SQL 内容格式正确'), 'error');
    console.error(e);
  }
}

async function loadSqlPreview() {
  if (!sql.value.trim()) {
    tables.value = [];
    return;
  }

  const parsed = parseSql(sql.value);
  if (parsed.length === 0) {
    tables.value = [];
    return;
  }

  originalSql.value = sql.value;
  tables.value = parsed;
}

function normalizeCustomRows(rows, columnCount) {
  return rows.map((row) => {
    const nextRow = Array.isArray(row) ? [...row] : [];
    while (nextRow.length < columnCount) nextRow.push('');
    return nextRow.slice(0, columnCount);
  });
}

function normalizeCustomWidths(widths, columnCount) {
  const nextWidths = Array.isArray(widths) ? widths.map((item) => Math.max(10, Number(item) || 10)) : [];
  while (nextWidths.length < columnCount) nextWidths.push(100);
  const trimmed = nextWidths.slice(0, columnCount);
  const total = trimmed.reduce((sum, item) => sum + item, 0) || 1;
  const normalized = trimmed.map((item) => Math.round((item / total) * 100));
  const diff = 100 - normalized.reduce((sum, item) => sum + item, 0);
  if (normalized.length > 0) {
    normalized[normalized.length - 1] += diff;
  }
  return normalized;
}

function addCustomColumn() {
  customTable.value.headers.push(`列${customTable.value.headers.length + 1}`);
  customTable.value.widths = normalizeCustomWidths([...customTable.value.widths, 20], customTable.value.headers.length);
  customTable.value.rows = normalizeCustomRows(customTable.value.rows, customTable.value.headers.length);
}

function removeCustomColumn(colIndex) {
  if (customTable.value.headers.length <= 1) return;
  customTable.value.headers.splice(colIndex, 1);
  customTable.value.widths.splice(colIndex, 1);
  customTable.value.widths = normalizeCustomWidths(customTable.value.widths, customTable.value.headers.length);
  customTable.value.rows = customTable.value.rows.map((row) => row.filter((_, index) => index !== colIndex));
}

function addCustomRow() {
  customTable.value.rows.push(Array.from({ length: customTable.value.headers.length }, () => ''));
}

function removeCustomRow(rowIndex) {
  if (customTable.value.rows.length <= 1) return;
  customTable.value.rows.splice(rowIndex, 1);
}

function duplicateCustomRow(rowIndex) {
  const source = customTable.value.rows[rowIndex];
  if (!source) return;
  customTable.value.rows.splice(rowIndex + 1, 0, [...source]);
}

function handlePasteImport() {
  const text = pasteImportText.value.trim();
  if (!text) {
    showPasteImport.value = false;
    return;
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return;

  let parsedHeaders = [];
  const parsedRows = [];

  const isMarkdown = lines[0].includes('|');
  if (isMarkdown) {
    const cleanLines = lines.filter((l) => !l.trim().match(/^\|?\s*[-:]+[-| :]*\s*\|?$/));
    if (cleanLines.length > 0) {
      parsedHeaders = cleanLines[0].split('|').map((s) => s.trim()).filter((s, idx, arr) => {
        if ((idx === 0 || idx === arr.length - 1) && s === '') return false;
        return true;
      });
      for (let i = 1; i < cleanLines.length; i++) {
        const row = cleanLines[i].split('|').map((s) => s.trim()).filter((s, idx, arr) => {
          if ((idx === 0 || idx === arr.length - 1) && s === '') return false;
          return true;
        });
        if (row.length > 0) parsedRows.push(row);
      }
    }
  } else {
    const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(',') ? ',' : ' ');
    parsedHeaders = lines[0].split(delimiter).map((s) => s.trim()).filter(Boolean);
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(delimiter).map((s) => s.trim());
      if (row.length > 0) parsedRows.push(row);
    }
  }

  if (parsedHeaders.length > 0) {
    customTable.value.headers = parsedHeaders;
    customTable.value.widths = normalizeCustomWidths([], parsedHeaders.length);
    customTable.value.rows = normalizeCustomRows(parsedRows.length > 0 ? parsedRows : [Array(parsedHeaders.length).fill('')], parsedHeaders.length);
    tables.value = [buildCustomPreviewTable()];
    showToast('已成功导入表格数据', 'success');
  }

  pasteImportText.value = '';
  showPasteImport.value = false;
}

function clearCustomTable() {
  customTable.value = createEmptyCustomTable();
  tables.value = [buildCustomPreviewTable()];
}

function fillCustomExample() {
  customTable.value = {
    title: '表1 项目成员信息表',
    headers: ['序号', '姓名', '角色', '联系方式', '备注'],
    widths: [12, 18, 18, 24, 28],
    rows: [
      ['1', '张三', '产品经理', '13800000000', '负责需求分析'],
      ['2', '李四', '后端开发', '13900000000', '负责接口与数据库'],
      ['3', '王五', '前端开发', '13700000000', '负责页面交互']
    ]
  };
  if (inputMode.value === 'custom') {
    tables.value = [buildCustomPreviewTable()];
  }
}

function buildCustomPreviewTable() {
  const headers = customTable.value.headers
    .map((item, index) => String(item || '').trim() || `列${index + 1}`);
  const widths = normalizeCustomWidths(customTable.value.widths, headers.length);
  const rows = normalizeCustomRows(customTable.value.rows, headers.length)
    .filter((row) => row.some((cell) => String(cell || '').trim()));

  return {
    customTable: true,
    name: 'custom_table',
    comment: customTable.value.title?.trim() || '自定义三线表',
    title: customTable.value.title?.trim() || '自定义三线表',
    headers,
    widths,
    rows: rows.length > 0 ? rows : [Array.from({ length: headers.length }, () => '')]
  };
}

async function generateCustomTable() {
  if (!customTable.value.headers.some((item) => String(item || '').trim())) {
    showToast('请至少填写一个表头', 'warn');
    return;
  }
  tables.value = [buildCustomPreviewTable()];
}

function onClear() {
  sql.value = PRESET_SQL;
  loadSqlPreview().catch((error) => {
    tables.value = [];
    console.error(error);
  });
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

function getTableTitle(table, idx) {
  if (table?.customTable) {
    return table.title || table.comment || `表${idx + 1} 自定义三线表`;
  }
  return `表${idx + 1} ${table.comment || table.name}`;
}

function estimateTextUnits(value) {
  return String(value || '').split('').reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 2 : 1), 0);
}

function getCustomColumnWidths(table) {
  if (!table?.customTable || !Array.isArray(table.headers) || table.headers.length === 0) {
    return [];
  }

  if (Array.isArray(table.widths) && table.widths.length === table.headers.length) {
    return normalizeCustomWidths(table.widths, table.headers.length);
  }

  const scores = table.headers.map((header, colIndex) => {
    const headerUnits = estimateTextUnits(header) + 4;
    const rowUnits = (table.rows || []).reduce((maxUnits, row) => {
      return Math.max(maxUnits, estimateTextUnits(row?.[colIndex]) + 2);
    }, 0);
    return Math.max(headerUnits, rowUnits, 8);
  });

  const total = scores.reduce((sum, item) => sum + item, 0) || 1;
  const widths = scores.map((score) => Math.round((score / total) * 100));
  const diff = 100 - widths.reduce((sum, item) => sum + item, 0);
  widths[widths.length - 1] += diff;
  return widths;
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTableRows(table) {
  if (table?.customTable) {
    return {
      headers: table.headers || [],
      rows: table.rows || []
    };
  }

  const headers = [];
  if (props.config.SHOW_IDX) headers.push(props.config.LABEL_IDX || '序号');
  if (props.config.SHOW_NAME) headers.push(props.config.LABEL_NAME || '字段名称');
  if (props.config.SHOW_TYPE) headers.push(props.config.LABEL_TYPE || '类型');
  if (props.config.SHOW_LEN) headers.push(props.config.LABEL_LEN || '长度');
  if (props.config.SHOW_NULL) headers.push(props.config.LABEL_NULL || '允许空');
  if (props.config.SHOW_DEFAULT) headers.push(props.config.LABEL_DEFAULT || '默认值');
  if (props.config.SHOW_COMMENT) headers.push(props.config.LABEL_COMMENT || '字段说明');

  const rows = (table.columns || []).map((col, index) => {
    const row = [];
    if (props.config.SHOW_IDX) row.push(String(index + 1));
    if (props.config.SHOW_NAME) row.push(col.name || (props.config.EMPTY_PLACEHOLDER || '-'));
    if (props.config.SHOW_TYPE) row.push(getBaseType(col.type) || (props.config.EMPTY_PLACEHOLDER || '-'));
    if (props.config.SHOW_LEN) row.push(getLength(col.type) || (props.config.EMPTY_PLACEHOLDER || '-'));
    if (props.config.SHOW_NULL) row.push(col.nullable ? '是' : '否');
    if (props.config.SHOW_DEFAULT) row.push(col.defaultValue || (props.config.EMPTY_PLACEHOLDER || '-'));
    if (props.config.SHOW_COMMENT) row.push(col.comment || (props.config.EMPTY_PLACEHOLDER || '-'));
    return row;
  });

  return { headers, rows };
}

function buildTableSvgMarkup(table, tableIndex = 0) {
  const { headers, rows } = getTableRows(table);
  const columnWidths = table?.customTable
    ? getCustomColumnWidths(table)
    : headers.map(() => Math.round(100 / Math.max(headers.length, 1)));

  const width = 1400;
  const captionFontSize = Number(props.config.CAPTION_FONT_SIZE || 14);
  const cellFontSizeNumber = Number(props.config.CELL_FONT_SIZE || 14);
  const rowHeight = Math.max(42, Math.round(cellFontSizeNumber * 2.4));
  const captionHeight = 42;
  const outerPadding = 28;
  const tableWidth = width - outerPadding * 2;
  const headerY = outerPadding + captionHeight;
  const contentRows = Math.max(rows.length, 1);
  const height = outerPadding * 2 + captionHeight + (contentRows + 1) * rowHeight + 8;
  const fontFamily = escapeXml(getFontStack());
  const title = escapeXml(getTableTitle(table, tableIndex));
  const topLineWidth = Number(props.config.TOP_LINE_WIDTH || 2);
  const middleLineWidth = Number(props.config.MIDDLE_LINE_WIDTH || 1);
  const bottomLineWidth = Number(props.config.BOTTOM_LINE_WIDTH || 2);
  const textAnchor = props.config.CELL_CENTERED ? 'middle' : 'start';
  const headerTextAnchor = props.config.HEADER_CENTERED ? 'middle' : 'start';

  const columnXs = [];
  let cursor = outerPadding;
  columnWidths.forEach((percent) => {
    columnXs.push(cursor);
    cursor += tableWidth * (percent / 100);
  });

  const cellsSvg = [];
  headers.forEach((header, columnIndex) => {
    const cellWidth = tableWidth * (columnWidths[columnIndex] / 100);
    const x = columnXs[columnIndex];
    const textX = props.config.HEADER_CENTERED ? x + cellWidth / 2 : x + 10;
    const textY = headerY + rowHeight / 2 + cellFontSizeNumber * 0.35;
    cellsSvg.push(
      `<text x="${textX}" y="${textY}" font-family="${fontFamily}" font-size="${cellFontSizeNumber}" fill="#111111" text-anchor="${headerTextAnchor}">${escapeXml(header)}</text>`
    );
  });

  rows.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const cellWidth = tableWidth * (columnWidths[columnIndex] / 100);
      const x = columnXs[columnIndex];
      const y = headerY + rowHeight * (rowIndex + 1);
      const textX = props.config.CELL_CENTERED ? x + cellWidth / 2 : x + 10;
      const textY = y + rowHeight / 2 + cellFontSizeNumber * 0.35;
      cellsSvg.push(
        `<text x="${textX}" y="${textY}" font-family="${fontFamily}" font-size="${cellFontSizeNumber}" fill="#111111" text-anchor="${textAnchor}">${escapeXml(cell || (props.config.EMPTY_PLACEHOLDER || '-'))}</text>`
      );
    });
  });

  const topLineY = headerY;
  const middleLineY = headerY + rowHeight;
  const bottomLineY = headerY + rowHeight * (contentRows + 1);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff" />
  <text x="${width / 2}" y="${outerPadding + captionFontSize}" font-family="${fontFamily}" font-size="${captionFontSize}" fill="#111111" text-anchor="middle">${title}</text>
  <line x1="${outerPadding}" y1="${topLineY}" x2="${outerPadding + tableWidth}" y2="${topLineY}" stroke="#111111" stroke-width="${topLineWidth}" />
  <line x1="${outerPadding}" y1="${middleLineY}" x2="${outerPadding + tableWidth}" y2="${middleLineY}" stroke="#111111" stroke-width="${middleLineWidth}" />
  <line x1="${outerPadding}" y1="${bottomLineY}" x2="${outerPadding + tableWidth}" y2="${bottomLineY}" stroke="#111111" stroke-width="${bottomLineWidth}" />
  ${cellsSvg.join('\n  ')}
</svg>`;
}

function loadSvgImage(svgMarkup) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('三线表 PNG 导出失败'));
    };
    image.src = url;
  });
}

async function exportPreviewPng() {
  if (!tables.value.length) return;

  const tableSvgs = tables.value.map((table, index) => buildTableSvgMarkup(table, index));
  const images = await Promise.all(tableSvgs.map((svg) => loadSvgImage(svg)));
  const gap = 32;
  const width = Math.max(...images.map((image) => image.width));
  const height = images.reduce((sum, image) => sum + image.height, 0) + gap * Math.max(images.length - 1, 0);
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext('2d');
  if (!context) return;

  context.setTransform(2, 0, 0, 2, 0, 0);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  let offsetY = 0;
  images.forEach((image) => {
    context.drawImage(image, 0, offsetY, image.width, image.height);
    offsetY += image.height + gap;
  });

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) {
        resolve(nextBlob);
        return;
      }
      reject(new Error('三线表 PNG 导出失败'));
    }, 'image/png');
  });

  downloadBlob(blob, 'academic-linetable.png');
}

// 双击单元格编辑
function startEdit(tableIdx, colIdx, field, value) {
  editingCell.value = { tableIdx, colIdx, field, value };
  nextTick(() => {
    const input = document.querySelector('.cell-edit-input');
    if (input) {
      input.focus();
      input.select();
    }
  });
}

function saveEdit(newVal) {
  if (!editingCell.value) return;
  const { tableIdx, colIdx, field } = editingCell.value;
  const table = tables.value[tableIdx];
  if (!table) return;
  const col = table.columns[colIdx];
  if (!col) return;
  col[field] = newVal;
  editingCell.value = null;
  syncSqlToEditor();
}

function cancelEdit() {
  editingCell.value = null;
}

async function syncSqlToEditor() {
  if (inputMode.value !== 'sql') return;
  if (!originalSql.value || tables.value.length === 0) return;

  try {
    const sqlText = serializeSql(tables.value);
    originalSql.value = sqlText;
    sql.value = sqlText;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  loadSqlPreview().catch((error) => {
    console.error('加载三线表示例失败', error);
  });
});

function getParamsPanelContext() {
  if (inputMode.value === 'custom') {
    return {
      mode: 'custom',
      customColumns: customTable.value.headers.map((header, index) => ({
        label: String(header || '').trim() || `列${index + 1}`,
        width: customTable.value.widths[index] || 0,
        onChange: (value) => {
          customTable.value.widths[index] = Number(value || 0);
          if (tables.value[0]?.customTable) {
            tables.value = [buildCustomPreviewTable()];
          }
        }
      }))
    };
  }

  return {
    mode: 'sql',
    visibleColumnKeys: [
      props.config.SHOW_NAME ? 'COL_NAME_WIDTH' : null,
      props.config.SHOW_TYPE ? 'COL_TYPE_WIDTH' : null,
      props.config.SHOW_COMMENT ? 'COL_COMMENT_WIDTH' : null,
      props.config.SHOW_LEN ? 'COL_LEN_WIDTH' : null,
      props.config.SHOW_NULL ? 'COL_NULL_WIDTH' : null,
      props.config.SHOW_DEFAULT ? 'COL_DEFAULT_WIDTH' : null,
      props.config.SHOW_IDX ? 'COL_IDX_WIDTH' : null
    ].filter(Boolean)
  };
}

defineExpose({
  getParamsPanelContext
});
</script>

<style scoped>
.linetable-workspace {
  display: flex;
  height: calc(100vh - 56px);
  overflow: hidden;
}

/* Left Panel */
.left-panel {
  width: 300px;
  min-width: 300px;
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-sizing: border-box;
}

.left-panel .panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mode-btn {
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.74);
  color: var(--text-2);
  border-radius: 999px;
  padding: 9px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-inset);
}

.mode-btn.active {
  background: linear-gradient(135deg, #6785a1 0%, #5f7f9c 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 14px 24px rgba(95, 127, 156, 0.16);
}

.custom-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.custom-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.label-with-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.custom-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.count-badge {
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  color: var(--primary, #024ad8);
  background: var(--primary-soft, #eff6ff);
  padding: 1px 6px;
  border-radius: 4px;
}

.custom-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.custom-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  min-height: 36px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--text, #0f172a);
  background: #ffffff;
  transition: all 0.18s ease;
}

.custom-input:focus {
  outline: none;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* ── 表头列胶囊流 ── */
.custom-headers-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.col-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px 4px 2px 6px;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.col-pill:focus-within {
  background: #ffffff;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.col-pill-idx {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--primary, #024ad8);
  font-family: var(--font-mono, monospace);
  flex-shrink: 0;
}

.col-pill-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  width: 58px;
  padding: 2px 0;
}

.col-pill-del {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.18s ease;
}

.col-pill-del:hover:not(:disabled) {
  background: #fef2f2;
  color: #ef4444;
}

.col-pill-del:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* ── 快速粘贴导入抽屉 ── */
.paste-import-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #f0f7ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-top: 4px;
}

.paste-import-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  font-weight: 600;
  color: #1e40af;
}

.paste-import-close {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
}

.paste-import-textarea {
  width: 100%;
  min-height: 80px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  font-family: "JetBrains Mono", Consolas, monospace;
  box-sizing: border-box;
  resize: vertical;
}

.paste-import-actions {
  display: flex;
  gap: 6px;
}

/* ── 数据行卡片流 (自适应纵向平铺，无横向拖动) ── */
.custom-row-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 2px;
}

.custom-row-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.custom-row-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

.row-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
  border-bottom: 1px dashed #e2e8f0;
}

.row-card-idx {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
}

.row-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.row-mini-btn:hover:not(:disabled) {
  border-color: var(--primary, #024ad8);
  color: var(--primary, #024ad8);
  background: #eff6ff;
}

.row-mini-btn--danger:hover:not(:disabled) {
  border-color: #fecaca;
  color: #ef4444;
  background: #fef2f2;
}

.row-mini-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* 单元格自适应网格 */
.row-cells-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(105px, 1fr));
  gap: 6px;
}

.cell-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cell-label {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  height: 28px;
  padding: 2px 6px;
  font-size: 12px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.cell-input:focus {
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.link-btn {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 600;
  min-height: 26px;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.18s ease;
}

.link-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.link-btn--primary {
  background: var(--primary-soft, #eff6ff);
  border-color: rgba(59, 130, 246, 0.25);
  color: var(--primary, #024ad8);
}

.link-btn--primary:hover {
  background: #dbeafe;
  border-color: var(--primary, #024ad8);
}

.char-count.warn {
  color: #ff4d4f;
  font-weight: 600;
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
  color: #2563eb;
}

.btn-action--upload:hover {
  background: #dbeafe;
  border-color: #bfdbfe;
  color: #1d4ed8;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.08);
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

/* 4. 生成 (右下 - 核心亮蓝渐变) */
.btn-action--generate {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.22);
}

.btn-action--generate:hover {
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.32);
}

.sql-input {
  width: 100%;
  flex: 1;
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.94);
  transition: border-color 0.2s;
}

.sql-input:focus {
  outline: none;
  border-color: rgba(95, 127, 156, 0.36);
  box-shadow: 0 0 0 4px rgba(95, 127, 156, 0.12);
}

.sql-input::placeholder {
  color: var(--text-3);
}

.sql-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.char-count {
  font-size: 12px;
  color: var(--text-3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
}

.btn-clear {
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-clear:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background: #fff1f0;
}

.btn-clear:active {
  background: #ffccc7;
}

/* Right Panel */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: calc(100vh - 56px);
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(116, 137, 163, 0.1);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
  background: transparent;
}

.preview-actions {
  display: flex;
  gap: 4px;
}

.btn-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.78);
  color: var(--text-2);
  border: 1px solid rgba(116, 137, 163, 0.12);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  user-select: none;
}

.btn-sm .svg-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.btn-sm:hover {
  background: rgba(255, 255, 255, 0.94);
  color: var(--text);
  border-color: rgba(95, 127, 156, 0.18);
}

.btn-sm:active {
  background: rgba(242, 247, 252, 0.9);
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  background: transparent;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-3);
  gap: 8px;
  font-size: 14px;
}

/* Three-line Table */
.three-line-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text);
  align-items: center;
  width: min(100%, 980px);
}

.table-title {
  color: var(--text);
  text-align: center;
  font-size: 14px;
  font-weight: normal;
  font-family: var(--cn-font, 'SimSun', serif);
}

.three-line-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  font-family: var(--cn-font, 'SimSun', serif);
}

.three-line-table th,
.three-line-table td {
  padding: 10px 14px;
  border: none;
  text-align: left;
  vertical-align: middle;
  font-family: var(--cn-font, 'SimSun', serif);
  font-size: 14px;
  font-weight: normal;
}

.three-line-table thead th {
  background: #ffffff;
  font-family: var(--cn-font, 'SimSun', serif);
  padding-top: 12px;
  padding-bottom: 10px;
}

.three-line-table thead tr {
  border: none;
}

.three-line-table tbody tr td {
  background: #ffffff;
  position: relative;
  cursor: default;
}

.three-line-table tbody tr td:hover {
  background: rgba(242, 247, 252, 0.88);
}

.cell-edit-input {
  width: 100%;
  border: 1px solid rgba(95, 127, 156, 0.34);
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  text-align: center;
  background: #fff;
}

/* Usage Guide */
.usage-guide {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px 40px;
  background: #fff;
}

.usage-guide h3 {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.usage-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.usage-step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.step-num {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.usage-step h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.usage-step p {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .linetable-workspace {
    flex-direction: column;
    height: auto;
    min-height: auto;
    overflow: visible;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    min-width: 0;
    height: auto;
  }

  .left-panel {
    overflow: visible;
  }

  .right-panel {
    min-height: 520px;
  }

  .sql-input {
    min-height: 220px;
  }

  .custom-row-cards {
    max-height: 320px;
  }
}

@media (max-width: 768px) {
  .usage-steps {
    grid-template-columns: repeat(2, 1fr);
  }

  .preview-body {
    padding: 12px 16px 20px;
    gap: 16px;
  }

  .preview-header {
    padding: 8px 12px;
    font-size: 12px;
    flex-wrap: wrap;
    gap: 4px;
  }

  .preview-actions {
    gap: 2px;
  }

  .btn-sm {
    padding: 4px 6px;
    font-size: 11px;
  }

  .three-line-table {
    align-items: flex-start;
    width: 100%;
  }

  .three-line-table table {
    min-width: 400px;
  }

  .three-line-table th,
  .three-line-table td {
    padding: 6px 8px;
    font-size: 12px;
  }

  .three-line-table thead th {
    padding-top: 8px;
    padding-bottom: 6px;
  }

  .table-title {
    font-size: 12px;
    text-align: left;
  }

  .workspace-container {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .left-panel .panel-body {
    padding: 12px;
  }

  .btn-group {
    grid-template-columns: 1fr;
  }

  .mode-switch {
    grid-template-columns: 1fr;
  }

  .custom-group {
    padding: 14px;
  }

  .custom-column-row {
    grid-template-columns: 1fr;
  }

  .row-action-col {
    width: 56px;
    min-width: 56px;
    max-width: 56px;
  }

  .preview-header {
    padding: 10px 12px;
    font-size: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .preview-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .preview-body {
    padding: 10px;
  }

  .usage-steps {
    grid-template-columns: 1fr;
  }

  .three-line-table table {
    min-width: 560px;
  }
}
</style>
