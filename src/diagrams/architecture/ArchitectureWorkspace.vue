<template>
  <div class="architecture-workspace">
    <div class="left-panel panel">
      <div class="panel-header">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 18.75h16.5M9 6.75h6M9 10.5h6" />
          </svg>
        </span>
        输入架构描述
      </div>
      <div class="panel-body">
        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">系统名称</label>
          </div>
          <input v-model="systemName" class="text-input row-input" type="text" placeholder="例如：体育馆预约管理系统" />
        </div>

        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">第一层</label>
            <div class="field-actions">
              <span class="field-meta">{{ topNodeCount }} 个</span>
              <button type="button" class="mini-btn" @click="addTopNodeRow()">新增模块</button>
            </div>
          </div>
          <div class="form-list">
            <div v-for="(row, index) in topNodeRows" :key="row.id" class="form-card top-node-card">
              <div class="row-badge">#{{ index + 1 }}</div>
              <input v-model="row.name" class="text-input row-input" type="text" placeholder="例如：用户" />
              <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeTopNodeRow(row.id)">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div class="field-hint">
            <span>第一层为上层角色或模块</span>
            <span>第二层模块可选择所属第一层</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">第二层</label>
            <div class="field-actions">
              <span class="field-meta">{{ bottomNodeCount }} 个</span>
              <button type="button" class="mini-btn" @click="addBottomNodeRow()">新增模块</button>
            </div>
          </div>
          <div class="form-list">
            <div v-for="(row, index) in bottomNodeRows" :key="row.id" class="form-card bottom-node-card">
              <div class="row-badge">#{{ index + 1 }}</div>
              <input v-model="row.name" class="text-input row-input" type="text" placeholder="例如：注册登录" />
              <select v-model="row.parentName" class="text-input row-input row-select" title="选择所属第一层">
                <option v-for="option in topNodeOptions" :key="`top-${option}`" :value="option">{{ option }}</option>
              </select>
              <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeBottomNodeRow(row.id)">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div class="field-hint">
            <span>第二层模块自动竖排显示</span>
            <span>选择所属第一层后实时同步预览</span>
          </div>
        </div>

        <div class="input-help">
          <span>{{ topNodeCount }} 个上层模块 / {{ bottomNodeCount }} 个下层模块</span>
          <span>默认示例已加载，可直接生成、预览与导出</span>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" @click="generateDiagram">生成</button>
          <button class="btn btn-secondary" @click="clearInput">清空</button>
        </div>
        <div v-if="statusMessage" class="status-bar" :class="statusType">
          {{ statusMessage }}
        </div>
      </div>
    </div>

    <div class="right-panel panel">
      <div class="panel-header">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v12a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18V6a2.25 2.25 0 0 1 2.25-2.25Zm2.25 4.5h6m-6 4.5h6m-6 4.5h3" />
          </svg>
        </span>
        架构图预览
        <div class="header-actions">
          <ZoomControls
            :percentage="zoomPercentage"
            :can-zoom-in="canZoomIn"
            :can-zoom-out="canZoomOut"
            :disabled="!layout"
            @zoom-in="zoomIn"
            @zoom-out="zoomOut"
            @reset-zoom="resetZoom"
          />
          <button class="btn btn-primary" :disabled="!layout" @click="handleExportPng">导出 PNG</button>
        </div>
      </div>
      <div class="preview-shell" ref="dragRef" :class="{ dragging: isDragging }" @mousedown="startDragging" @mouseleave="stopDragging">
        <div v-if="layout" class="diagram-scroll">
          <div
            class="diagram-scale"
            :style="{ '--architecture-preview-scale': previewLayout.displayScale, width: `${previewLayout.displayWidth}px`, height: `${previewLayout.displayHeight}px` }"
          >
            <svg
              ref="svgRef"
              :width="layout.width"
              :height="layout.height"
              :viewBox="`0 0 ${layout.width} ${layout.height}`"
              class="diagram-svg"
              :style="{ '--diagram-font-family': layout.fontFamily }"
              xmlns="http://www.w3.org/2000/svg"
            >
            <g class="connector-group">
              <rect
                v-for="(rect, index) in layout.connectorRects"
                :key="`connector-${index}`"
                :x="rect.x"
                :y="rect.y"
                :width="rect.width"
                :height="rect.height"
                fill="#111111"
                shape-rendering="crispEdges"
                class="connector-rect"
              />
            </g>

            <g v-if="layout.rootNode" class="root-node-group">
              <rect
                :x="layout.rootNode.x"
                :y="layout.rootNode.y"
                :width="layout.rootNode.width"
                :height="layout.rootNode.height"
                fill="#ffffff"
                shape-rendering="crispEdges"
                class="surface-rect"
              />
              <rect
                v-for="(rect, borderIndex) in layout.rootNode.borderRects"
                :key="`root-border-${borderIndex}`"
                :x="rect.x"
                :y="rect.y"
                :width="rect.width"
                :height="rect.height"
                fill="#111111"
                shape-rendering="crispEdges"
                class="border-rect"
              />
              <text
                :x="layout.rootNode.centerX"
                :y="layout.rootNode.centerY"
                class="node-text"
                :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                {{ layout.rootNode.name }}
              </text>
            </g>

            <g
              v-for="(layer, layerIndex) in layout.layers"
              :key="`layer-${layerIndex}`"
              class="layer-group"
            >
              <g
                v-for="(node, nodeIndex) in layer.nodes"
                :key="`node-${layerIndex}-${nodeIndex}`"
                class="node-group"
              >
                <rect
                  :x="node.x"
                  :y="node.y"
                  :width="node.width"
                  :height="node.height"
                  fill="#ffffff"
                  shape-rendering="crispEdges"
                  class="surface-rect"
                />
                <rect
                  v-for="(rect, borderIndex) in node.borderRects"
                  :key="`node-border-${layerIndex}-${nodeIndex}-${borderIndex}`"
                  :x="rect.x"
                  :y="rect.y"
                  :width="rect.width"
                  :height="rect.height"
                  fill="#111111"
                  shape-rendering="crispEdges"
                  class="border-rect"
                />

                <text
                  v-if="layer.type === 'horizontal'"
                  :x="node.centerX"
                  :y="node.centerY"
                  class="node-text"
                  :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {{ node.name }}
                </text>
                <text
                  v-else
                  class="node-text"
                  :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                  text-anchor="middle"
                >
                  <tspan
                    v-for="(char, charIndex) in node.verticalChars"
                    :key="`char-${layerIndex}-${nodeIndex}-${charIndex}`"
                    :x="node.centerX"
                    :y="node.textStartY + charIndex * node.charStep"
                  >
                    {{ char }}
                  </tspan>
                </text>
              </g>
            </g>
            </svg>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🏗️</div>
          <h3>系统架构图</h3>
          <p>左侧填写系统名称与两层模块关系后，会自动生成系统架构图。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { DEFAULT_INPUT } from './defaultInput.js';
import { DEFAULT_EDITOR_STATE } from './defaultEditorState.js';
import { parseLocalDiagram } from '../../utils/localDiagramEngine.js';
import { useDiagramZoom } from '../../composables/useDiagramZoom.js';
import { useDiagramExport } from '../../composables/useDiagramExport.js';
import { useDiagramRunner } from '../../composables/useDiagramRunner.js';
import ZoomControls from '../../components/workspace/ZoomControls.vue';

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
});

const config = props.config;
const svgRef = ref(null);

// 1. 画布缩放与平移
const {
  previewZoom,
  zoomPercentage,
  canZoomIn,
  canZoomOut,
  zoomIn,
  zoomOut,
  resetZoom,
  dragRef,
  isDragging,
  startDragging,
  stopDragging
} = useDiagramZoom();

// 2. 导出逻辑
const { exportPng } = useDiagramExport({
  svgRef,
  cropSelector: '.connector-group, .root-node-group, .layer-group',
  padding: 18,
  defaultFileName: 'architecture-diagram'
});

// 3. 执行引擎与布局调度
const {
  diagramData,
  layout,
  statusMessage,
  statusType,
  scheduleLayout,
  runGenerate
} = useDiagramRunner('architecture');

let topNodeSeed = 0;
let bottomNodeSeed = 0;

function createTopNodeRow(name = '') {
  return {
    id: `architecture-top-node-${topNodeSeed += 1}`,
    name
  };
}

function createBottomNodeRow(name = '', parentName = '') {
  return {
    id: `architecture-bottom-node-${bottomNodeSeed += 1}`,
    name,
    parentName
  };
}

function createEmptyEditorState() {
  return {
    systemName: '',
    topNodeRows: [createTopNodeRow()],
    bottomNodeRows: [createBottomNodeRow()]
  };
}

function resolveParentName(topNodes, bottomNodeName) {
  return (topNodes || []).find((node) => Array.isArray(node?.targetNames) && node.targetNames.includes(bottomNodeName))?.name || '';
}

function createEditorStateFromParsed(parsed) {
  const firstLayer = parsed.layers[0];
  const secondLayer = parsed.layers[1];

  return {
    systemName: parsed.systemName || '',
    topNodeRows: firstLayer?.nodes?.length
      ? firstLayer.nodes.map((node) => createTopNodeRow(node.name))
      : [createTopNodeRow()],
    bottomNodeRows: secondLayer?.nodes?.length
      ? secondLayer.nodes.map((node) => createBottomNodeRow(node.name, resolveParentName(firstLayer?.nodes || [], node.name)))
      : [createBottomNodeRow()]
  };
}

function applyEditorState(state) {
  systemName.value = String(state.systemName || '').trim();
  topNodeRows.value = state.topNodeRows?.length ? state.topNodeRows : [createTopNodeRow()];
  bottomNodeRows.value = state.bottomNodeRows?.length ? state.bottomNodeRows : [createBottomNodeRow()];
}

const initialState = {
  systemName: DEFAULT_EDITOR_STATE.systemName || '',
  topNodeRows: DEFAULT_EDITOR_STATE.topNodes.map((item) => createTopNodeRow(item.name)),
  bottomNodeRows: DEFAULT_EDITOR_STATE.bottomNodes.map((item) => createBottomNodeRow(item.name, item.parentName))
};
const systemName = ref(initialState.systemName);
const topNodeRows = ref(initialState.topNodeRows);
const bottomNodeRows = ref(initialState.bottomNodeRows);

const topNodeCount = computed(() => topNodeRows.value.filter((row) => String(row.name || '').trim()).length);
const bottomNodeCount = computed(() => bottomNodeRows.value.filter((row) => String(row.name || '').trim()).length);
const topNodeOptions = computed(() =>
  topNodeRows.value
    .map((row) => String(row.name || '').trim())
    .filter(Boolean)
);

watch(topNodeOptions, (options) => {
  if (options.length > 0) {
    bottomNodeRows.value.forEach((row) => {
      if (!row.parentName || !options.includes(row.parentName)) {
        row.parentName = options[0];
      }
    });
  }
}, { immediate: true });

async function applyDefaultExample({ announce = false } = {}) {
  const parsed = await parseLocalDiagram('architecture', DEFAULT_INPUT);
  applyEditorState(createEditorStateFromParsed(parsed));
  diagramData.value = parsed;
  statusType.value = 'success';
  statusMessage.value = announce ? '已恢复默认示例' : '';
}

function clearInput() {
  applyDefaultExample({ announce: true }).catch((error) => {
    statusType.value = 'error';
    statusMessage.value = error.message;
  });
}

function addTopNodeRow(name = '') {
  topNodeRows.value.push(createTopNodeRow(name));
}

function removeTopNodeRow(rowId) {
  topNodeRows.value = topNodeRows.value.filter((row) => row.id !== rowId);
  if (topNodeRows.value.length === 0) {
    topNodeRows.value = [createTopNodeRow()];
  }
}

function addBottomNodeRow(name = '', parentName = '') {
  const defaultParent = parentName || topNodeOptions.value[0] || '';
  bottomNodeRows.value.push(createBottomNodeRow(name, defaultParent));
}

function removeBottomNodeRow(rowId) {
  bottomNodeRows.value = bottomNodeRows.value.filter((row) => row.id !== rowId);
  if (bottomNodeRows.value.length === 0) {
    const defaultParent = topNodeOptions.value[0] || '';
    bottomNodeRows.value = [createBottomNodeRow('', defaultParent)];
  }
}

const previewLayout = computed(() => {
  const current = layout.value;
  if (!current) return null;
  return {
    ...current,
    displayScale: previewZoom.value,
    displayWidth: Math.round(current.width * previewZoom.value),
    displayHeight: Math.round(current.height * previewZoom.value)
  };
});

async function handleExportPng() {
  try {
    await exportPng();
    statusType.value = 'success';
    statusMessage.value = 'PNG 已导出';
  } catch (error) {
    statusType.value = 'error';
    statusMessage.value = '导出 PNG 失败';
  }
}

async function generateDiagram() {
  await runGenerate({
    systemName: systemName.value,
    topNodeRows: topNodeRows.value,
    bottomNodeRows: bottomNodeRows.value
  }, '已生成架构图');
}

watch(
  () => [diagramData.value, config],
  ([diagram]) => {
    scheduleLayout(diagram, config, 120);
  },
  { deep: true }
);

onMounted(async () => {
  try {
    await applyDefaultExample();
  } catch (error) {
    statusType.value = 'error';
    statusMessage.value = error.message || '加载架构图示例失败';
  }
});
</script>

<style scoped>
.architecture-workspace {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  min-height: 680px;
  box-sizing: border-box;
}

.left-panel {
  width: 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
}

.left-panel .panel-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 88px;
  align-self: flex-start;
  max-height: calc(100vh - 104px);
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(116, 137, 163, 0.12);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(242, 247, 252, 0.88) 100%);
  box-shadow: var(--shadow-inset);
}

.field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.field-label {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--text);
}

.field-meta {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-3);
}

.field-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mini-btn {
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  color: var(--text-2);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--shadow-inset);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.mini-btn:hover {
  border-color: rgba(95, 127, 156, 0.18);
  background: rgba(255, 255, 255, 0.94);
  color: var(--text);
  transform: translateY(-1px);
}

.text-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 18px;
  box-sizing: border-box;
  color: var(--text);
  background: rgba(255, 255, 255, 0.94);
  line-height: 1.55;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.title-input {
  min-height: 38px;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
}

.row-input {
  min-height: 30px;
  height: 30px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
}

.textarea-input {
  min-height: 84px;
  padding-top: 12px;
  padding-bottom: 12px;
  resize: vertical;
  line-height: 1.75;
}

.text-input:focus {
  outline: none;
  border-color: rgba(95, 127, 156, 0.36);
  box-shadow: 0 0 0 4px rgba(95, 127, 156, 0.12);
}

.input-help {
  display: flex;
  gap: 10px;
  flex-direction: column;
  padding: 12px 14px;
  border: 1px solid rgba(116, 137, 163, 0.12);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(242, 247, 252, 0.88) 100%);
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-3);
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-card {
  display: grid;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: border-color 0.18s ease;
}

.form-card:hover {
  border-color: #cbd5e1;
}

.top-node-card {
  grid-template-columns: 28px minmax(0, 1fr) 24px;
  align-items: center;
}

.bottom-node-card {
  grid-template-columns: 28px minmax(0, 1.2fr) minmax(88px, 1fr) 24px;
  align-items: center;
}

.bottom-node-card .row-select {
  width: 100%;
}

.row-select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  padding-right: 18px !important;
  color: #334155;
  font-weight: 500;
}

.row-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  min-height: 26px;
  border: 1px solid #dbeafe;
  border-radius: 5px;
  background: #eff6ff;
  color: var(--primary, #024ad8);
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  line-height: 1;
}

.row-remove {
  width: 24px;
  min-width: 24px;
  height: 24px;
  min-height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
}

.row-remove:hover {
  background: #fef2f2;
  color: #ef4444;
}

.row-remove svg {
  width: 13px;
  height: 13px;
}

.field-hint {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-3);
}

.status-bar {
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-bar.success {
  background: #eef8f1;
  color: #18794e;
  border: 1px solid #ccebd7;
}

.status-bar.error {
  background: rgba(239, 68, 68, 0.08);
  color: #cf1322;
  border: 1px solid #ffd1cc;
}

.preview-shell {
  cursor: grab;
  flex: 1;
  overflow: auto;
  padding: 20px 24px 28px;
  background: transparent;
}

.preview-zoom-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 2px;
}

.zoom-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(116, 137, 163, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-inset);
}

.zoom-btn:hover:not(:disabled) {
  border-color: rgba(95, 127, 156, 0.18);
  color: var(--text);
  background: rgba(255, 255, 255, 0.96);
}

.zoom-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.zoom-indicator {
  min-width: 58px;
}

.preview-shell.dragging {
  cursor: grabbing;
  user-select: none;
}

.preview-shell.dragging * {
  user-select: none;
}

.diagram-scroll {
  width: fit-content;
  min-width: fit-content;
  margin: 0 auto;
  padding: 18px;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.diagram-scale {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.diagram-svg {
  display: block;
  overflow: visible;
  background: transparent;
  font-family: var(--diagram-font-family, 'Microsoft YaHei', sans-serif);
  transform: scale(var(--architecture-preview-scale, 1));
  transform-origin: top center;
}

.connector-rect,
.border-rect {
  fill: #111111;
  shape-rendering: crispEdges;
}

.surface-rect {
  fill: #ffffff;
  shape-rendering: crispEdges;
}

.node-text {
  fill: #111111;
  font-family: var(--diagram-font-family, 'Microsoft YaHei', sans-serif);
}

.empty-state {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-2);
  text-align: center;
}

.empty-icon {
  font-size: 56px;
}

@media (max-width: 960px) {
  .architecture-workspace {
    flex-direction: column;
    min-height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: 0;
  }

  .right-panel {
    position: static;
    top: auto;
    align-self: stretch;
    max-height: none;
    min-height: 640px;
  }
}

@media (max-width: 640px) {
  .architecture-workspace {
    padding: 8px 10px;
  }

  .header-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
  }

  .field-head,
  .field-actions {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .btn-group {
    grid-template-columns: 1fr;
  }

  .top-node-card,
  .bottom-node-card {
    grid-template-columns: 1fr;
  }

  .targets-input {
    grid-column: auto;
  }

  .preview-shell {
  cursor: grab;
    padding: 14px;
  }

  .right-panel {
    min-height: 480px;
  }
}
</style>
