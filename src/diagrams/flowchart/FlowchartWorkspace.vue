<template>
  <div class="flowchart-workspace">
    <div class="left-panel panel">
      <div class="panel-header">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h9m5.25-10.5v10.5m-5.25-10.5v10.5" />
          </svg>
        </span>
        输入流程描述
      </div>
      <div class="panel-body">
        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">节点</label>
            <div class="field-actions">
              <span class="field-meta">{{ nodeCount }} 个</span>
              <button type="button" class="mini-btn" @click="addNodeRow()">新增节点</button>
            </div>
          </div>
          <div class="form-list">
            <div
              v-for="(row, index) in nodeRows"
              :key="row.id"
              class="form-card node-card"
            >
              <div class="row-badge">#{{ index + 1 }}</div>
              <select v-model="row.type" class="select-input type-select">
                <option
                  v-for="option in NODE_TYPE_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <input
                v-model="row.label"
                class="text-input row-input"
                type="text"
                placeholder="节点名称"
              />
              <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeNodeRow(row.id)">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div class="field-hint">
            <span>按流程顺序填写节点</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">连线</label>
            <div class="field-actions">
              <span class="field-meta">{{ linkCount }} 条</span>
              <button type="button" class="mini-btn" @click="addDecisionBranchRows">新增判断分支</button>
              <button type="button" class="mini-btn" @click="addLinkRow()">新增连线</button>
            </div>
          </div>
          <div class="form-list">
            <div
              v-for="(row, index) in linkRows"
              :key="row.id"
              class="form-card link-card"
            >
              <div class="row-badge">#{{ index + 1 }}</div>
              <select v-model="row.sourceNodeId" class="select-input link-select" title="起点节点">
                <option value="">起点</option>
                <option
                  v-for="option in nodeOptions"
                  :key="`source-${row.id}-${option.id}`"
                  :value="option.id"
                >
                  {{ option.text }}
                </option>
              </select>
              <span class="link-arrow">→</span>
              <select v-model="row.targetNodeId" class="select-input link-select" title="终点节点">
                <option value="">终点</option>
                <option
                  v-for="option in nodeOptions"
                  :key="`target-${row.id}-${option.id}`"
                  :value="option.id"
                >
                  {{ option.text }}
                </option>
              </select>
              <input
                v-model="row.label"
                class="text-input row-input branch-input"
                type="text"
                placeholder="分支(选填)"
                title="分支文案（可选，例如：是 / 否）"
              />
              <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeLinkRow(row.id)">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div class="field-hint">
            <span>判断节点可配置“是 / 否”等多条分支，预览会自动左右展开</span>
          </div>
        </div>
        <div class="input-help">
          <span>{{ nodeCount }} 个已命名节点 / {{ linkCount }} 条已配置连线</span>
          <span>默认示例已加载，可直接生成、预览与导出</span>
        </div>
        <div class="btn-group">
          <button type="button" class="btn btn-primary" @click="generateDiagram">生成</button>
          <button type="button" class="btn btn-secondary" @click="clearInput">清空</button>
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5h16.5v15H3.75v-15Zm4.5 3.75h7.5m-7.5 3.75h4.5" />
          </svg>
        </span>
        流程图预览
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
            :style="{ '--flow-preview-scale': previewLayout.displayScale, width: `${previewLayout.displayWidth}px`, height: `${previewLayout.displayHeight}px` }"
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
            <defs>
              <marker
                id="flow-arrow"
                :markerWidth="layout.arrowWidth"
                :markerHeight="layout.arrowWidth"
                :refX="layout.arrowWidth * 0.8"
                :refY="layout.arrowWidth / 2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path :d="`M 0 0 L ${layout.arrowWidth} ${layout.arrowWidth / 2} L 0 ${layout.arrowWidth} z`" fill="#111111" />
              </marker>
            </defs>

            <g class="edge-group">
              <path
                v-for="edge in layout.edges"
                :key="edge.id"
                :d="edge.path"
                fill="none"
                stroke="#111111"
                stroke-linecap="round"
                stroke-linejoin="round"
                :stroke-width="layout.lineWidth"
                marker-end="url(#flow-arrow)"
              />
              <g v-for="edge in layout.edges" :key="`${edge.id}-label`">
                <text
                  v-if="edge.label"
                  :x="edge.labelPoint.x"
                  :y="edge.labelPoint.y"
                  class="edge-label"
                  :style="{ fill: '#111111', stroke: '#ffffff', strokeWidth: `${layout.edgeLabelStrokeWidth}px`, paintOrder: 'stroke', fontSize: `${layout.edgeLabelFontSize}px`, fontWeight: 500, fontFamily: layout.fontFamily }"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                >
                  {{ edge.label }}
                </text>
              </g>
            </g>

            <g class="node-group" v-for="node in layout.nodes" :key="node.id">
              <rect
                v-if="node.type === 'process'"
                :x="node.x"
                :y="node.y"
                :width="node.width"
                :height="node.height"
                fill="#ffffff"
                stroke="#111111"
                :stroke-width="layout.lineWidth"
              />
              <rect
                v-else-if="node.type === 'start' || node.type === 'end'"
                :x="node.x"
                :y="node.y"
                :width="node.width"
                :height="node.height"
                :rx="node.height / 2"
                :ry="node.height / 2"
                fill="#ffffff"
                stroke="#111111"
                :stroke-width="layout.lineWidth"
              />
              <polygon
                v-else-if="node.type === 'decision'"
                :points="node.points"
                fill="#ffffff"
                stroke="#111111"
                :stroke-width="layout.lineWidth"
                stroke-linejoin="round"
              />
              <polygon
                v-else-if="node.type === 'io'"
                :points="node.points"
                fill="#ffffff"
                stroke="#111111"
                :stroke-width="layout.lineWidth"
                stroke-linejoin="round"
              />

              <text
                :x="node.centerX"
                class="node-text"
                :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                <tspan
                  v-for="(line, lineIndex) in node.lines"
                  :key="`${node.id}-line-${lineIndex}`"
                  :x="node.centerX"
                  :y="node.textStartY + lineIndex * node.lineStep"
                >
                  {{ line }}
                </tspan>
              </text>
            </g>
            </svg>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🔀</div>
          <h3>流程图生成</h3>
          <p>左侧输入节点与连线描述后，自动生成自上而下的流程图。</p>
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
  cropSelector: '.edge-group, .node-group',
  padding: 18,
  defaultFileName: 'flowchart'
});

// 3. 执行引擎与调度
const {
  diagramData,
  layout,
  statusMessage,
  statusType,
  scheduleLayout,
  runGenerate
} = useDiagramRunner('flowchart');

const NODE_TYPE_OPTIONS = Object.freeze([
  { value: 'start', label: '开始' },
  { value: 'process', label: '处理' },
  { value: 'decision', label: '判断' },
  { value: 'io', label: '输入输出' },
  { value: 'end', label: '结束' }
]);

let nodeRowSeed = 0;
let linkRowSeed = 0;

function createNodeRow(type = 'process', label = '') {
  return {
    id: `editor-node-${nodeRowSeed += 1}`,
    type,
    label
  };
}

function createLinkRow(sourceNodeId = '', targetNodeId = '', label = '') {
  return {
    id: `editor-link-${linkRowSeed += 1}`,
    sourceNodeId,
    targetNodeId,
    label
  };
}

function createEmptyEditorState() {
  return {
    nodeRows: [createNodeRow('start', '')],
    linkRows: [createLinkRow()]
  };
}

function createEditorStateFromParsed(parsed) {
  const nodeIdMap = new Map();
  const nodeRows = parsed.nodes.map((node) => {
    const row = createNodeRow(node.type, node.label);
    nodeIdMap.set(node.id, row.id);
    return row;
  });
  const linkRows = parsed.links.map((link) =>
    createLinkRow(nodeIdMap.get(link.sourceId) || '', nodeIdMap.get(link.targetId) || '', link.label || '')
  );

  return {
    nodeRows: nodeRows.length > 0 ? nodeRows : [createNodeRow('start', '')],
    linkRows: linkRows.length > 0 ? linkRows : [createLinkRow()]
  };
}

function normalizeText(value) {
  return String(value || '').trim();
}

function applyEditorState(state) {
  nodeRows.value = state.nodeRows.length > 0 ? state.nodeRows : [createNodeRow('start', '')];
  linkRows.value = state.linkRows.length > 0 ? state.linkRows : [createLinkRow()];
}

function addNodeRow(type = 'process', label = '') {
  nodeRows.value.push(createNodeRow(type, label));
}

function removeNodeRow(rowId) {
  nodeRows.value = nodeRows.value.filter((row) => row.id !== rowId);
  linkRows.value = linkRows.value.filter((row) => row.sourceNodeId !== rowId && row.targetNodeId !== rowId);
  if (nodeRows.value.length === 0) {
    nodeRows.value = [createNodeRow('start', '')];
  }
}

function addLinkRow(sourceNodeId = '', targetNodeId = '', label = '') {
  linkRows.value.push(createLinkRow(sourceNodeId, targetNodeId, label));
}

function removeLinkRow(rowId) {
  linkRows.value = linkRows.value.filter((row) => row.id !== rowId);
  if (linkRows.value.length === 0) {
    linkRows.value = [createLinkRow()];
  }
}

function createEditorStateFromDefault() {
  const nodeRows = DEFAULT_EDITOR_STATE.nodes.map((item) => createNodeRow(item.type, item.label));
  const labelMap = new Map(nodeRows.map((row) => [row.label, row.id]));

  return {
    nodeRows,
    linkRows: DEFAULT_EDITOR_STATE.links.map((item) => createLinkRow(labelMap.get(item.sourceLabel) || '', labelMap.get(item.targetLabel) || '', item.label))
  };
}

const initialState = createEditorStateFromDefault();
const nodeRows = ref(initialState.nodeRows);
const linkRows = ref(initialState.linkRows);

const nodeOptions = computed(() =>
  nodeRows.value.map((row, index) => ({
    id: row.id,
    text: normalizeText(row.label) || `未命名节点 ${index + 1}`
  }))
);
const nodeCount = computed(() => nodeRows.value.filter((row) => normalizeText(row.label)).length);
const linkCount = computed(() => linkRows.value.filter((row) => row.sourceNodeId && row.targetNodeId).length);

async function loadDefaultPreview({ announce = false } = {}) {
  const parsed = await parseLocalDiagram('flowchart', DEFAULT_INPUT);
  applyEditorState(createEditorStateFromParsed(parsed));
  diagramData.value = parsed;
  statusType.value = 'success';
  statusMessage.value = announce ? '已恢复默认示例' : '';
}

function clearInput() {
  loadDefaultPreview({ announce: true }).catch((error) => {
    diagramData.value = null;
    statusType.value = 'error';
    statusMessage.value = error.message;
  });
}

function hasEditorContent() {
  if (nodeRows.value.some((row) => normalizeText(row.label))) {
    return true;
  }
  return linkRows.value.some((row) => row.sourceNodeId || row.targetNodeId || normalizeText(row.label));
}

const previewLayout = computed(() => {
  const current = layout.value;
  if (!current) return null;
  return {
    ...current,
    displayScale: current.displayScale * previewZoom.value,
    displayWidth: Math.round(current.displayWidth * previewZoom.value),
    displayHeight: Math.round(current.displayHeight * previewZoom.value)
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
    nodeRows: nodeRows.value,
    linkRows: linkRows.value
  }, '已生成流程图');
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
    await loadDefaultPreview();
  } catch (error) {
    statusType.value = 'error';
    statusMessage.value = error.message || '加载流程图示例失败';
  }
});
</script>

<style scoped>
.flowchart-workspace {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  min-height: 680px;
  box-sizing: border-box;
}

.left-panel {
  width: 348px;
  min-width: 348px;
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
  padding: 14px 16px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.field-meta {
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  color: var(--primary, #024ad8);
  background: var(--primary-soft, #eff6ff);
  padding: 1px 6px;
  border-radius: 4px;
}

.field-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.mini-btn {
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 999px;
  background: var(--primary-soft, #eff6ff);
  color: var(--primary, #024ad8);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s ease;
}

.mini-btn:hover {
  background: #dbeafe;
  border-color: var(--primary, #024ad8);
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-card {
  display: flex;
  align-items: center;
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

.node-card {
  display: grid;
  grid-template-columns: 28px 78px minmax(0, 1fr) 24px;
  gap: 6px;
  align-items: center;
}

.link-card {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto minmax(0, 1fr) minmax(0, 0.8fr) 24px;
  gap: 6px;
  align-items: center;
}

.link-arrow-symbol {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-3, #94a3b8);
  user-select: none;
  text-align: center;
}

.row-badge {
  display: inline-flex;
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
}

.text-input,
.select-input,
.row-input,
.branch-input {
  width: 100%;
  min-height: 30px;
  height: 30px;
  padding: 4px 8px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  box-sizing: border-box;
  color: var(--text, #0f172a);
  background: #ffffff;
  font-size: 12px;
  line-height: 1.55;
  transition: all 0.18s ease;
  font-family: var(--font-body);
}

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  padding-right: 18px !important;
  color: #334155;
  cursor: pointer;
}

.select-input:focus,
.text-input:focus,
.row-input:focus,
.branch-input:focus {
  outline: none;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.row-remove {
  width: 24px;
  height: 24px;
  min-width: 24px;
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

.row-remove svg {
  width: 13px;
  height: 13px;
}

.row-remove:hover {
  background: #fef2f2;
  color: #ef4444;
}

.field-hint,
.input-help {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--text-3);
}

.input-help {
  padding: 10px 12px;
  border: 1px solid rgba(116, 137, 163, 0.12);
  border-radius: 10px;
  background: #fafafa;
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
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
  background: #fff2f0;
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
  transform: scale(var(--flow-preview-scale, 1));
  transform-origin: top center;
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
  .flowchart-workspace {
    flex-direction: column;
    min-height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: 0;
  }

  .node-card,
  .link-card {
    grid-template-columns: 44px minmax(0, 1fr) 36px;
  }

  .type-select,
  .link-select {
    grid-column: 2 / 3;
  }

  .branch-input,
  .row-input {
    grid-column: 1 / 4;
  }

  .link-arrow {
    display: none;
  }

  .branch-input {
    grid-column: 2 / 3;
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
  .flowchart-workspace {
    padding: 8px 10px;
  }

  .field-head,
  .field-actions {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
  }

  .input-help {
    flex-direction: column;
  }

  .btn-group {
    grid-template-columns: 1fr;
  }

  .preview-shell {
  cursor: grab;
    padding: 14px;
  }

  .right-panel {
    min-height: 520px;
  }
}
</style>


