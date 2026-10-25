<template>
  <div class="usecase-workspace">
    <div class="left-panel panel">
      <div class="panel-header">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75a17.933 17.933 0 0 1-7.5-1.632Z" />
          </svg>
        </span>
        <span>输入用例信息</span>
      </div>
      <div class="panel-body">
        <div class="editor-section editor-section-featured">
          <label class="field-label" for="usecase-system">系统边界名称</label>
          <input
            id="usecase-system"
            v-model="systemInput"
            class="text-input title-input"
            type="text"
            :placeholder="systemPlaceholder"
          />
          <div class="field-hint">
            <span>系统名称显示在边界框顶部</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">参与者</label>
            <span class="field-meta">固定 1 个</span>
          </div>
          <div class="form-card actor-card single-actor-card">
            <div class="row-badge">A</div>
            <input
              v-model="actorRows[0].label"
              class="text-input row-input"
              type="text"
              placeholder="例如：用户"
            />
            <div class="fixed-side-tag">左侧小人</div>
          </div>
          <div class="field-hint">
            <span>参与者固定显示在最左侧</span>
            <span>自动连接第一层用例</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">用例</label>
            <div class="field-actions">
              <span class="field-meta">{{ usecaseCount }} 个</span>
              <button type="button" class="mini-btn" @click="addUsecaseRow()">新增用例</button>
            </div>
          </div>
          <div class="form-list">
            <div
              v-for="(row, index) in usecaseRows"
              :key="row.id"
              class="form-card usecase-card"
            >
              <div class="row-badge">#{{ index + 1 }}</div>
              <input
                v-model="row.label"
                class="text-input row-input"
                type="text"
                placeholder="例如：提交订单"
              />
              <select v-model.number="row.level" class="select-input level-select">
                <option
                  v-for="option in USECASE_LEVEL_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeUsecaseRow(row.id)">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div class="field-hint">
            <span>一级和二级在系统边界内从左到右排布</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">关系</label>
            <div class="field-actions">
              <span class="field-meta">{{ relationCount }} 条</span>
              <button type="button" class="mini-btn" @click="addRelationRow()">新增关系</button>
            </div>
          </div>
          <div class="form-list">
            <div
              v-for="(row, index) in relationRows"
              :key="row.id"
              class="form-card relation-card"
            >
              <div class="row-badge">#{{ index + 1 }}</div>
              <select v-model="row.sourceNodeId" class="select-input relation-select">
                <option value="">起点</option>
                <option
                  v-for="option in getRelationSourceOptions(row)"
                  :key="`source-${row.id}-${option.id}`"
                  :value="option.id"
                >
                  {{ option.text }}
                </option>
              </select>
              <span class="relation-arrow">→</span>
              <select v-model="row.targetNodeId" class="select-input relation-select">
                <option value="">终点</option>
                <option
                  v-for="option in getRelationTargetOptions(row)"
                  :key="`target-${row.id}-${option.id}`"
                  :value="option.id"
                >
                  {{ option.text }}
                </option>
              </select>
              <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeRelationRow(row.id)">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div class="field-hint">
            <span>补充第一层到第二层的关系</span>
            <span>自动使用虚线并显示 &lt;&lt;include&gt;&gt;</span>
          </div>
        </div>

        <div class="input-help">
          <span>{{ actorCount }} 个参与者 / {{ usecaseCount }} 个用例 / {{ relationCount }} 条关系</span>
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </span>
        用例图预览
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
            :style="{ '--usecase-preview-scale': previewLayout.displayScale, width: `${previewLayout.displayWidth}px`, height: `${previewLayout.displayHeight}px` }"
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
                  id="usecase-arrow-open"
                  markerWidth="15"
                  markerHeight="14"
                  refX="13"
                  refY="7"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 1 1 L 13 7 L 1 13" fill="none" stroke="#111111" :stroke-width="layout.includeArrowStrokeWidth" stroke-linecap="round" stroke-linejoin="round" />
                </marker>
                <marker
                  id="usecase-arrow-triangle"
                  markerWidth="14"
                  markerHeight="14"
                  refX="12"
                  refY="7"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 1 7 L 12 1 L 12 13 Z" fill="#ffffff" stroke="#111111" :stroke-width="layout.lineWidth" stroke-linejoin="round" />
                </marker>
              </defs>

              <g class="system-group">
                <rect
                  v-if="layout.system.showBoundary"
                  :x="layout.system.x"
                  :y="layout.system.y"
                  :width="layout.system.width"
                  :height="layout.system.height"
                  fill="none"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                  shape-rendering="crispEdges"
                />
                <text
                  v-if="layout.system.showLabel"
                  :x="layout.system.labelX"
                  :y="layout.system.labelY"
                  :style="{ fill: '#111111', fontSize: `${layout.systemLabelFontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                  text-anchor="middle"
                >
                  {{ diagramData.system }}
                </text>
              </g>

              <g class="relation-group">
                <path
                  v-for="relation in layout.relations"
                  :key="relation.id"
                  :d="relation.path"
                  fill="none"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :stroke-dasharray="relation.dashArray"
                  :marker-end="relation.markerEnd"
                />
                <text
                  v-for="relation in layout.relations.filter((item) => item.displayLabel)"
                  :key="`${relation.id}-label`"
                  :x="relation.labelPoint.x"
                  :y="relation.labelPoint.y"
                  class="relation-label"
                  :style="{ fill: '#111111', stroke: '#ffffff', strokeWidth: `${layout.edgeLabelStrokeWidth}px`, paintOrder: 'stroke', fontSize: `${layout.edgeLabelFontSize}px`, fontWeight: 500, fontFamily: layout.fontFamily }"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                >
                  {{ relation.displayLabel }}
                </text>
              </g>

              <g class="actor-group" v-for="actor in layout.actors" :key="actor.id">
                <circle
                  :cx="actor.figureCenterX"
                  :cy="actor.headCenterY"
                  :r="actor.headRadius"
                  fill="#ffffff"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                />
                <line
                  :x1="actor.figureCenterX"
                  :y1="actor.neckY"
                  :x2="actor.figureCenterX"
                  :y2="actor.torsoBottomY"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                  stroke-linecap="round"
                />
                <line
                  :x1="actor.armLeftX"
                  :y1="actor.armY"
                  :x2="actor.armRightX"
                  :y2="actor.armY"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                  stroke-linecap="round"
                />
                <line
                  :x1="actor.figureCenterX"
                  :y1="actor.torsoBottomY"
                  :x2="actor.legLeftX"
                  :y2="actor.legBottomY"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                  stroke-linecap="round"
                />
                <line
                  :x1="actor.figureCenterX"
                  :y1="actor.torsoBottomY"
                  :x2="actor.legRightX"
                  :y2="actor.legBottomY"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                  stroke-linecap="round"
                />
                <text
                  :x="actor.figureCenterX"
                  class="actor-text"
                  :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                  text-anchor="middle"
                >
                  <tspan
                    v-for="(line, lineIndex) in actor.lines"
                    :key="`${actor.id}-line-${lineIndex}`"
                    :x="actor.figureCenterX"
                    :y="actor.textStartY + lineIndex * actor.lineStep"
                  >
                    {{ line }}
                  </tspan>
                </text>
              </g>

              <g class="usecase-group" v-for="usecase in layout.usecases" :key="usecase.id">
                <ellipse
                  :cx="usecase.centerX"
                  :cy="usecase.centerY"
                  :rx="usecase.width / 2"
                  :ry="usecase.height / 2"
                  fill="#ffffff"
                  stroke="#111111"
                  :stroke-width="layout.lineWidth"
                />
                <text
                  :x="usecase.centerX"
                  class="usecase-text"
                  :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                  text-anchor="middle"
                >
                  <tspan
                    v-for="(line, lineIndex) in usecase.lines"
                    :key="`${usecase.id}-line-${lineIndex}`"
                    :x="usecase.centerX"
                    :y="usecase.textStartY + lineIndex * usecase.lineStep"
                  >
                    {{ line }}
                  </tspan>
                </text>
              </g>
            </svg>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">👤</div>
          <h3>用例图生成</h3>
          <p>左侧填写参与者、用例和关系后，自动生成黑白风格用例图。</p>
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
  cropSelector: '.boundary-rect, .actor-group, .usecase-group, .relation-group',
  padding: 18,
  defaultFileName: 'usecase'
});

// 3. 执行引擎与调度
const {
  diagramData,
  layout,
  statusMessage,
  statusType,
  scheduleLayout,
  runGenerate
} = useDiagramRunner('usecase');

const systemPlaceholder = '例如：电商平台';
const USECASE_LEVEL_OPTIONS = Object.freeze([
  { value: 1, label: '一级' },
  { value: 2, label: '二级' }
]);

let actorRowSeed = 0;
let usecaseRowSeed = 0;
let relationRowSeed = 0;

function createActorRow(label = '', side = 'left') {
  return {
    id: `editor-actor-${actorRowSeed += 1}`,
    label,
    side
  };
}

function createUsecaseRow(label = '', level = 1) {
  return {
    id: `editor-usecase-${usecaseRowSeed += 1}`,
    label,
    level
  };
}

function createRelationRow(sourceNodeId = '', targetNodeId = '', type = 'association', label = '') {
  return {
    id: `editor-relation-${relationRowSeed += 1}`,
    sourceNodeId,
    targetNodeId,
    type,
    label
  };
}

function createEmptyEditorState() {
  return {
    system: '',
    actorRows: [createActorRow('', 'left')],
    usecaseRows: [createUsecaseRow('', 1)],
    relationRows: [createRelationRow()]
  };
}

function createEditorStateFromParsed(parsed) {
  const actorIdMap = new Map();
  const usecaseIdMap = new Map();
  const actorRows = parsed.actors.slice(0, 1).map((actor) => {
    const row = createActorRow(actor.label, actor.side);
    actorIdMap.set(actor.id, row.id);
    return row;
  });
  const usecaseRows = parsed.usecases.map((usecase) => {
    const row = createUsecaseRow(usecase.label, usecase.level);
    usecaseIdMap.set(usecase.id, row.id);
    return row;
  });
  const relationRows = parsed.relations
    .filter((relation) => relation.sourceNodeType === 'usecase' && relation.targetNodeType === 'usecase')
    .map((relation) => createRelationRow(
      usecaseIdMap.get(relation.sourceId) || '',
      usecaseIdMap.get(relation.targetId) || '',
      'include',
      ''
    ));

  return {
    system: parsed.system || '',
    actorRows: actorRows.length > 0 ? actorRows : [createActorRow('', 'left')],
    usecaseRows: usecaseRows.length > 0 ? usecaseRows : [createUsecaseRow('', 1)],
    relationRows: relationRows.length > 0 ? relationRows : [createRelationRow()]
  };
}

function applyEditorState(state) {
  systemInput.value = state.system || '';
  actorRows.value = state.actorRows?.length ? state.actorRows : [createActorRow('', 'left')];
  usecaseRows.value = state.usecaseRows?.length ? state.usecaseRows : [createUsecaseRow('', 1)];
  relationRows.value = state.relationRows?.length ? state.relationRows : [createRelationRow()];
}

function normalizeText(value) {
  return String(value || '').trim();
}

function addUsecaseRow(label = '', level = 1) {
  usecaseRows.value.push(createUsecaseRow(label, level));
}

function removeUsecaseRow(rowId) {
  usecaseRows.value = usecaseRows.value.filter((row) => row.id !== rowId);
  relationRows.value = relationRows.value.filter((row) => row.sourceNodeId !== rowId && row.targetNodeId !== rowId);

  if (usecaseRows.value.length === 0) {
    usecaseRows.value = [createUsecaseRow('', 1)];
  }

  if (relationRows.value.length === 0) {
    relationRows.value = [createRelationRow()];
  }
}

function addRelationRow(sourceNodeId = '', targetNodeId = '', type = 'association', label = '') {
  relationRows.value.push(createRelationRow(sourceNodeId, targetNodeId, type, label));
}

function removeRelationRow(rowId) {
  relationRows.value = relationRows.value.filter((row) => row.id !== rowId);

  if (relationRows.value.length === 0) {
    relationRows.value = [createRelationRow()];
  }
}

function createEditorStateFromDefault() {
  const actorRows = DEFAULT_EDITOR_STATE.actors.map((item) => createActorRow(item.label, 'left'));
  const usecaseRows = DEFAULT_EDITOR_STATE.usecases.map((item) => createUsecaseRow(item.label, item.level));
  const nodeIdMap = new Map();
  actorRows.forEach((row) => nodeIdMap.set(row.label, row.id));
  usecaseRows.forEach((row) => nodeIdMap.set(row.label, row.id));
  return {
    system: DEFAULT_EDITOR_STATE.system,
    actorRows,
    usecaseRows,
    relationRows: DEFAULT_EDITOR_STATE.relations.map((item) => createRelationRow(nodeIdMap.get(item.sourceLabel) || '', nodeIdMap.get(item.targetLabel) || '', item.type, item.label))
  };
}

const initialState = createEditorStateFromDefault();
const systemInput = ref(initialState.system);
const actorRows = ref(initialState.actorRows);
const usecaseRows = ref(initialState.usecaseRows);
const relationRows = ref(initialState.relationRows);



const actorOptions = computed(() => {
  const row = actorRows.value[0];
  if (!row) return [];
  return [{
    id: row.id,
    text: normalizeText(row.label) || '未命名参与者',
    nodeType: 'actor'
  }];
});

const usecaseOptions = computed(() =>
  usecaseRows.value.map((row, index) => ({
    id: row.id,
    text: normalizeText(row.label) || `未命名用例 ${index + 1}`,
    nodeType: 'usecase'
  }))
);

const actorCount = computed(() => (normalizeText(actorRows.value[0]?.label) ? 1 : 0));
const usecaseCount = computed(() => usecaseRows.value.filter((row) => normalizeText(row.label)).length);
const relationCount = computed(() => relationRows.value.filter((row) => row.sourceNodeId && row.targetNodeId).length);

function findNodeTypeById(nodeId) {
  if (actorRows.value.some((row) => row.id === nodeId)) return 'actor';
  if (usecaseRows.value.some((row) => row.id === nodeId)) return 'usecase';
  return null;
}

function getRelationSourceOptions() {
  return usecaseRows.value
    .filter((item) => Number(item.level) === 1)
    .map((item, index) => ({
      id: item.id,
      text: normalizeText(item.label) || `未命名用例 ${index + 1}`,
      nodeType: 'usecase'
    }));
}

function getRelationTargetOptions(row) {
  const sourceType = findNodeTypeById(row.sourceNodeId);
  if (sourceType === 'usecase') {
    return usecaseOptions.value.filter((option) => {
      const rowData = usecaseRows.value.find((item) => item.id === option.id);
      return Number(rowData?.level || 0) === 2;
    });
  }
  return [];
}

async function loadDefaultPreview({ announce = false } = {}) {
  const parsed = await parseLocalDiagram('usecase', DEFAULT_INPUT);
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
  if (normalizeText(systemInput.value)) {
    return true;
  }

  if (normalizeText(actorRows.value[0]?.label)) {
    return true;
  }

  if (usecaseRows.value.some((row) => normalizeText(row.label))) {
    return true;
  }

  return relationRows.value.some((row) => row.sourceNodeId || row.targetNodeId);
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
    system: systemInput.value,
    actorRows: actorRows.value,
    usecaseRows: usecaseRows.value,
    relationRows: relationRows.value
  }, '已生成用例图');
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
    statusMessage.value = error.message || '加载用例图示例失败';
  }
});
</script>

<style scoped>
.usecase-workspace {
  display: flex;
  gap: 14px;
  padding: 0;
  min-height: 680px;
  box-sizing: border-box;
}

.left-panel {
  width: 332px;
  min-width: 332px;
  display: flex;
  flex-direction: column;
}

.left-panel .panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  background: linear-gradient(180deg, rgba(249, 251, 255, 0.72) 0%, rgba(255, 255, 255, 0.82) 100%);
  padding: 14px;
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

.panel-header {
  padding: 18px 20px 16px;
  border-bottom: 1px solid rgba(214, 226, 242, 0.9);
  background:
    radial-gradient(circle at right top, rgba(59, 130, 246, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.92) 100%);
}

.panel-header-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel-header-copy strong {
  font-size: 14px;
  color: #10233f;
}

.panel-header-copy span {
  font-size: 11.5px;
  color: #7588a2;
  font-weight: 500;
}

.panel-header-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-header-preview__main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
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
  padding: 12px;
  border: 1px solid rgba(214, 226, 242, 0.92);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.92) 100%);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.03);
}

.editor-section-featured {
  background:
    radial-gradient(circle at right top, rgba(96, 165, 250, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 247, 255, 0.94) 100%);
}

.field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.field-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #163254;
}

.field-meta {
  font-size: 11px;
  color: #7c90a8;
}

.field-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mini-btn {
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(196, 209, 228, 0.96);
  border-radius: 12px;
  background: #ffffff;
  color: #405a79;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.mini-btn:hover {
  border-color: #b4cbec;
  background: #f8fbff;
  transform: translateY(-1px);
}

.text-input,
.select-input {
  width: 100%;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  box-sizing: border-box;
  color: var(--text, #0f172a);
  background: #ffffff;
  line-height: 1.55;
  transition: all 0.18s ease;
  font-family: var(--font-body);
}

.title-input {
  min-height: 34px;
  padding: 6px 10px;
  font-size: 12.5px;
}

.row-input,
.select-input {
  min-height: 30px;
  height: 30px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
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

.text-input:focus,
.select-input:focus {
  outline: none;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
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

.actor-card {
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
}

.usecase-card {
  grid-template-columns: 28px minmax(0, 1.2fr) minmax(78px, 1fr) 24px;
  align-items: center;
}

.relation-card {
  grid-template-columns: 28px minmax(0, 1fr) auto minmax(0, 1fr) 24px;
  align-items: center;
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

.relation-arrow {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.fixed-side-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
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

.field-hint,
.input-help {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
  line-height: 1.65;
  color: #6f839b;
}

.input-help {
  padding: 12px;
  border: 1px solid rgba(209, 221, 237, 0.94);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 255, 0.92) 100%);
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.status-bar {
  padding: 10px 12px;
  border-radius: 12px;
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
  transform: scale(var(--usecase-preview-scale, 1));
  transform-origin: top center;
}

.title-text,
.actor-text,
.usecase-text,
.relation-label {
  font-family: var(--diagram-font-family, 'Microsoft YaHei', sans-serif);
}

.empty-state {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #66788a;
  text-align: center;
}

.empty-icon {
  font-size: 56px;
}

@media (max-width: 1100px) {
  .usecase-workspace {
    flex-direction: column;
    min-height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: 0;
  }

  .actor-card,
  .usecase-card,
  .relation-card {
    grid-template-columns: 44px minmax(0, 1fr) 36px;
  }

  .level-select,
  .relation-select,
  .relation-arrow,
  .fixed-side-tag,
  .row-input {
    grid-column: 2 / 3;
  }

  .relation-arrow {
    display: none;
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
  .usecase-workspace {
    padding: 0;
  }

  .field-head,
  .field-actions,
  .panel-header-preview {
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
    padding: 14px;
  }

  .right-panel {
    min-height: 520px;
  }
}
</style>
