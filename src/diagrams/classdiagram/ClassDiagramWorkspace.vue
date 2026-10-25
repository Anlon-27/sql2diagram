<template>
  <div class="classdiagram-workspace">
    <div class="left-panel panel">
      <div class="panel-header">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15M8.25 4.5v15m7.5-15v15" />
          </svg>
        </span>
        输入类图文本
      </div>
      <div class="panel-body">
        <div class="editor-section">
          <div class="field-head">
            <label class="field-label" for="classdiagram-template">示例模板</label>
            <span class="field-meta">参考示例模板</span>
          </div>
          <select id="classdiagram-template" v-model="selectedTemplateKey" class="select-input template-select">
            <option v-for="template in TEMPLATE_PRESETS" :key="template.key" :value="template.key">{{ template.label }}</option>
          </select>
          <div class="field-hint">
            <span>{{ selectedTemplateDescription }}</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="field-head">
            <label class="field-label">编辑模式</label>
            <span class="field-meta">{{ editorMode === 'form' ? '表单更易用' : `${sourceLineCount} 行源码` }}</span>
          </div>
          <div class="mode-switch">
            <button type="button" class="mode-btn" :class="{ active: editorMode === 'form' }" @click="setEditorMode('form')">表单模式</button>
            <button type="button" class="mode-btn" :class="{ active: editorMode === 'text' }" @click="setEditorMode('text')">源码模式</button>
          </div>
        </div>

        <template v-if="editorMode === 'form'">
          <div class="editor-section">
            <label class="field-label" for="classdiagram-title">图名称</label>
            <input
              id="classdiagram-title"
              v-model="titleInput"
              class="text-input title-input"
              type="text"
              placeholder="例如：电商平台类图"
            />
          </div>

          <div class="editor-section">
            <div class="field-head">
              <label class="field-label">类定义</label>
              <div class="field-actions">
                <span class="field-meta">{{ classCount }} 个</span>
                <button type="button" class="mini-btn" @click="addClassRow()">新增类</button>
              </div>
            </div>
            <div class="form-list">
              <div v-for="(row, index) in classRows" :key="row.id" class="form-card class-card">
                <div class="class-card-head">
                  <div class="row-badge">#{{ index + 1 }}</div>
                  <input v-model="row.name" class="text-input row-input" type="text" placeholder="例如：订单" />
                  <select v-model="row.type" class="select-input compact-select">
                    <option v-for="option in CLASS_TYPE_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                  <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeClassRow(row.id)">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
                <div class="member-grid">
                  <div class="member-column">
                    <label class="member-label">属性</label>
                    <textarea v-model="row.fieldsText" class="member-textarea" placeholder="+订单号: String&#10;+下单时间: Date" />
                  </div>
                  <div class="member-column">
                    <label class="member-label">方法</label>
                    <textarea v-model="row.methodsText" class="member-textarea" placeholder="+创建(): void&#10;+取消(): void" />
                  </div>
                </div>
              </div>
            </div>
            <div class="field-hint">
              <span>每行一条属性或方法，自动生成 UML 类框</span>
            </div>
          </div>

          <div class="editor-section">
            <div class="field-head">
              <label class="field-label">类关系</label>
              <div class="field-actions">
                <span class="field-meta">{{ relationCount }} 条</span>
                <button type="button" class="mini-btn" @click="addRelationRow()">新增关系</button>
              </div>
            </div>
            <div class="form-list">
              <div v-for="(row, index) in relationRows" :key="row.id" class="form-card relation-card">
                <div class="relation-head">
                  <div class="row-badge">#{{ index + 1 }}</div>
                  <select v-model="row.relationType" class="select-input compact-select">
                    <option v-for="option in RELATION_TYPE_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                  <button type="button" class="row-remove" aria-label="删除" title="删除" @click="removeRelationRow(row.id)">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
                <div class="relation-node-row">
                  <label class="relation-field">
                    <span class="relation-field__label">起点类</span>
                    <select v-model="row.sourceNodeId" class="select-input relation-select">
                      <option value="">选择起点类</option>
                      <option v-for="option in classOptions" :key="`source-${row.id}-${option.id}`" :value="option.id">{{ option.text }}</option>
                    </select>
                  </label>
                  <label class="relation-field">
                    <span class="relation-field__label">终点类</span>
                    <select v-model="row.targetNodeId" class="select-input relation-select">
                      <option value="">选择终点类</option>
                      <option v-for="option in classOptions" :key="`target-${row.id}-${option.id}`" :value="option.id">{{ option.text }}</option>
                    </select>
                  </label>
                </div>
                <div class="relation-grid">
                  <label class="relation-field">
                    <span class="relation-field__label">起点多重度</span>
                    <input v-model="row.sourceCardinality" class="text-input row-input" type="text" placeholder='例如：1' />
                  </label>
                  <label class="relation-field">
                    <span class="relation-field__label">终点多重度</span>
                    <input v-model="row.targetCardinality" class="text-input row-input" type="text" placeholder='例如：n' />
                  </label>
                </div>
              </div>
            </div>
            <div class="field-hint">
              <span>关联、依赖、聚合、组合、继承、实现</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="editor-section editor-main">
            <div class="field-head">
              <label class="field-label" for="classdiagram-source">类图源码</label>
              <span class="field-meta">{{ sourceLineCount }} 行</span>
            </div>
            <textarea
              id="classdiagram-source"
              v-model="sourceInput"
              class="source-textarea"
              spellcheck="false"
              placeholder="请输入类图描述文本"
            />
          </div>

          <div class="editor-section">
            <div class="field-label">语法提示</div>
            <div class="syntax-card">
              <div class="syntax-line">`class 用户 { ... }` / `abstract 基础实体 { ... }` / `interface 支付能力 { ... }`</div>
              <div class="syntax-line">属性和方法放在类块中，`--` 后面的内容会进入方法区</div>
              <div class="syntax-line">关系支持 `--&gt;`、`..&gt;`、`o--&gt;`、`*--&gt;`、`--|&gt;`、`..|&gt;`</div>
              <div class="syntax-line">可写多重度：`用户 "1" --&gt; "n" 订单`</div>
            </div>
          </div>
        </template>

        <div class="btn-group">
          <button type="button" class="btn btn-primary" @click="generateDiagram">生成</button>
          <button type="button" class="btn btn-clear" @click="clearInput">清空</button>
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5h15v15h-15zM8.25 8.25h7.5m-7.5 4.5h7.5m-7.5 4.5h7.5" />
          </svg>
        </span>
        类图预览
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
          <div class="diagram-scale" :style="{ '--class-preview-scale': previewLayout.displayScale, width: `${previewLayout.displayWidth}px`, height: `${previewLayout.displayHeight}px` }">
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
                <marker id="class-arrow-open" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="#111111" :stroke-width="layout.lineWidth" stroke-linecap="round" stroke-linejoin="round" />
                </marker>
                <marker id="class-triangle-open" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M 1 1 L 13 7 L 1 13 Z" fill="#ffffff" stroke="#111111" :stroke-width="layout.lineWidth" stroke-linejoin="round" />
                </marker>
                <marker id="class-diamond-open" markerWidth="16" markerHeight="16" refX="14" refY="8" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                  <path d="M 14 8 L 8 2 L 2 8 L 8 14 Z" fill="#ffffff" stroke="#111111" :stroke-width="layout.lineWidth" stroke-linejoin="round" />
                </marker>
                <marker id="class-diamond-solid" markerWidth="16" markerHeight="16" refX="14" refY="8" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                  <path d="M 14 8 L 8 2 L 2 8 L 8 14 Z" fill="#111111" stroke="#111111" :stroke-width="layout.lineWidth" stroke-linejoin="round" />
                </marker>
              </defs>

                <text
                  v-if="layout.title.show"
                  :x="layout.title.centerX"
                  :y="layout.title.y"
                  class="title-text"
                :style="{ fill: '#111111', fontSize: `${layout.title.fontSize}px`, fontWeight: layout.title.fontWeight, fontFamily: layout.fontFamily }"
                text-anchor="middle"
              >
                {{ diagramData.title }}
              </text>

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
                  :marker-start="relation.markerStart"
                  :marker-end="relation.markerEnd"
                />
                <g
                  v-for="relation in layout.relations.filter((item) => item.sourceCardinality && item.sourceCardLabel)"
                  :key="`${relation.id}-source-card`"
                >
                  <text
                    :x="relation.sourceCardLabel.textX"
                    :y="relation.sourceCardLabel.textY"
                    class="relation-cardinality"
                    :style="{ fill: '#111111', stroke: '#ffffff', strokeWidth: `${layout.edgeLabelStrokeWidth}px`, paintOrder: 'stroke', fontSize: `${layout.edgeLabelFontSize}px`, fontWeight: 500, fontFamily: layout.fontFamily }"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    stroke-linejoin="round"
                  >
                    {{ relation.sourceCardinality }}
                  </text>
                </g>
                <g
                  v-for="relation in layout.relations.filter((item) => item.targetCardinality && item.targetCardLabel)"
                  :key="`${relation.id}-target-card`"
                >
                  <text
                    :x="relation.targetCardLabel.textX"
                    :y="relation.targetCardLabel.textY"
                    class="relation-cardinality"
                    :style="{ fill: '#111111', stroke: '#ffffff', strokeWidth: `${layout.edgeLabelStrokeWidth}px`, paintOrder: 'stroke', fontSize: `${layout.edgeLabelFontSize}px`, fontWeight: 500, fontFamily: layout.fontFamily }"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    stroke-linejoin="round"
                  >
                    {{ relation.targetCardinality }}
                  </text>
                </g>
              </g>

              <g v-for="node in layout.nodes" :key="node.id" class="class-node-group">
                <rect :x="node.x" :y="node.y" :width="node.width" :height="node.height" fill="#ffffff" stroke="#111111" :stroke-width="layout.lineWidth" />
                <line :x1="node.x" :y1="node.headerBottomY" :x2="node.x + node.width" :y2="node.headerBottomY" stroke="#111111" :stroke-width="layout.lineWidth" />
                <line :x1="node.x" :y1="node.fieldsBottomY" :x2="node.x + node.width" :y2="node.fieldsBottomY" stroke="#111111" :stroke-width="layout.lineWidth" />

                <text v-if="node.stereotype" :x="node.centerX" :y="node.stereotypeY" :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 500, fontFamily: layout.fontFamily }" text-anchor="middle">
                  {{ node.stereotype }}
                </text>
                <text :x="node.centerX" :y="node.nameY" :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 700, fontStyle: node.nameFontStyle, fontFamily: layout.fontFamily }" text-anchor="middle">
                  {{ node.name }}
                </text>

                <text :x="node.textLeftX" class="member-text" :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }" text-anchor="start">
                  <tspan v-for="(line, lineIndex) in node.fieldLines" :key="`${node.id}-field-${lineIndex}`" :x="node.textLeftX" :y="node.fieldsStartY + lineIndex * node.lineStep">{{ line }}</tspan>
                </text>

                <text :x="node.textLeftX" class="member-text" :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }" text-anchor="start">
                  <tspan v-for="(line, lineIndex) in node.methodLines" :key="`${node.id}-method-${lineIndex}`" :x="node.textLeftX" :y="node.methodsStartY + lineIndex * node.lineStep">{{ line }}</tspan>
                </text>
              </g>
            </svg>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🧩</div>
          <h3>类图生成</h3>
          <p>左侧输入类图文本后，点击生成显示黑白风格 UML 类图。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { DEFAULT_INPUT, TEMPLATE_PRESETS } from './templates.js';
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
  cropSelector: '.class-node-group, .class-relation-group',
  padding: 18,
  defaultFileName: 'class-diagram'
});

// 3. 执行引擎与调度
const {
  diagramData,
  layout,
  statusMessage,
  statusType,
  scheduleLayout,
  runGenerate
} = useDiagramRunner('classdiagram');

const editorMode = ref('form');
const sourceInput = ref(DEFAULT_INPUT);
const selectedTemplateKey = ref(TEMPLATE_PRESETS[0]?.key || '');




const CLASS_TYPE_OPTIONS = Object.freeze([
  { value: 'class', label: '类' },
  { value: 'abstract', label: '抽象类' },
  { value: 'interface', label: '接口' }
]);
const RELATION_TYPE_OPTIONS = Object.freeze([
  { value: 'association', label: '关联' },
  { value: 'dependency', label: '依赖' },
  { value: 'aggregation', label: '聚合' },
  { value: 'composition', label: '组合' },
  { value: 'generalization', label: '继承' },
  { value: 'realization', label: '实现' }
]);

let classRowSeed = 0;
let relationRowSeed = 0;

function createClassRow(type = 'class', name = '', fieldsText = '', methodsText = '') {
  return {
    id: `class-row-${classRowSeed += 1}`,
    type,
    name,
    fieldsText,
    methodsText
  };
}

function createRelationRow(sourceNodeId = '', targetNodeId = '', relationType = 'association', label = '', sourceCardinality = '', targetCardinality = '') {
  return {
    id: `class-relation-row-${relationRowSeed += 1}`,
    sourceNodeId,
    targetNodeId,
    relationType,
    label,
    sourceCardinality,
    targetCardinality
  };
}

function createEditorStateFromParsed(parsed) {
  const classIdMap = new Map();
  const classRows = parsed.nodes.map((node) => {
    const row = createClassRow(
      node.type,
      node.name,
      (node.fields || []).join('\n'),
      (node.methods || []).join('\n')
    );
    classIdMap.set(node.id, row.id);
    return row;
  });
  const relationRows = parsed.relations.map((relation) => createRelationRow(
    classIdMap.get(relation.sourceId) || '',
    classIdMap.get(relation.targetId) || '',
    relation.relationType || 'association',
    relation.label || '',
    relation.sourceCardinality || '',
    relation.targetCardinality || ''
  ));

  return {
    title: parsed.title || '',
    classRows: classRows.length > 0 ? classRows : [createClassRow()],
    relationRows: relationRows.length > 0 ? relationRows : [createRelationRow()]
  };
}

function createEmptyEditorState() {
  return {
    title: '',
    classRows: [createClassRow()],
    relationRows: [createRelationRow()]
  };
}

function createInitialEditorState() {
  const classRows = DEFAULT_EDITOR_STATE.classes.map((item) => createClassRow(item.type, item.name, item.fieldsText, item.methodsText));
  const classIdMap = new Map(classRows.map((row) => [row.name, row.id]));
  return {
    title: DEFAULT_EDITOR_STATE.title,
    classRows,
    relationRows: DEFAULT_EDITOR_STATE.relations.map((item) => createRelationRow(
      classIdMap.get(item.sourceName) || '',
      classIdMap.get(item.targetName) || '',
      item.relationType,
      item.label,
      item.sourceCardinality,
      item.targetCardinality
    ))
  };
}

const initialEditorState = createInitialEditorState();
const titleInput = ref(initialEditorState.title);
const classRows = ref(initialEditorState.classRows);
const relationRows = ref(initialEditorState.relationRows);

const sourceLineCount = computed(() => sourceInput.value.split(/\r?\n/).length);
const selectedTemplateDescription = computed(() =>
  TEMPLATE_PRESETS.find((item) => item.key === selectedTemplateKey.value)?.description || '可切换不同示例模板'
);
const classOptions = computed(() =>
  classRows.value.map((row, index) => ({
    id: row.id,
    text: String(row.name || '').trim() || `未命名类 ${index + 1}`
  }))
);
const classCount = computed(() => classRows.value.filter((row) => String(row.name || '').trim()).length);
const relationCount = computed(() =>
  relationRows.value.filter((row) => row.sourceNodeId && row.targetNodeId).length
);

function applyEditorState(state) {
  titleInput.value = state.title || '';
  classRows.value = state.classRows.length > 0 ? state.classRows : [createClassRow()];
  relationRows.value = state.relationRows.length > 0 ? state.relationRows : [createRelationRow()];
}

function normalizeCardinalityText(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  return text
    .replace(/\*/g, 'n')
    .replace(/0\.\.n/gi, '0..n')
    .replace(/1\.\.n/gi, '1..n')
    .replace(/^n$/i, 'n');
}

async function setEditorMode(nextMode) {
  if (editorMode.value === nextMode) return;

  try {
    if (nextMode === 'form') {
      const parsed = await parseLocalDiagram('classdiagram', sourceInput.value || DEFAULT_INPUT);
      applyEditorState(createEditorStateFromParsed(parsed));
    } else {
      sourceInput.value = await buildLocalDiagramSource('classdiagram', {
        title: titleInput.value,
        classRows: classRows.value,
        relationRows: relationRows.value
      });
    }
    editorMode.value = nextMode;
  } catch (error) {
    statusType.value = 'error';
    statusMessage.value = error.message;
  }
}

function addClassRow(type = 'class', name = '', fieldsText = '', methodsText = '') {
  classRows.value.push(createClassRow(type, name, fieldsText, methodsText));
}

function clearRelationRefs(classRowId) {
  relationRows.value = relationRows.value.filter((row) => row.sourceNodeId !== classRowId && row.targetNodeId !== classRowId);

  if (relationRows.value.length === 0) {
    relationRows.value = [createRelationRow()];
  }
}

function removeClassRow(classRowId) {
  classRows.value = classRows.value.filter((row) => row.id !== classRowId);
  clearRelationRefs(classRowId);
  if (classRows.value.length === 0) {
    classRows.value = [createClassRow()];
  }
}

function addRelationRow(sourceNodeId = '', targetNodeId = '', relationType = 'association', label = '', sourceCardinality = '', targetCardinality = '') {
  relationRows.value.push(createRelationRow(sourceNodeId, targetNodeId, relationType, label, sourceCardinality, targetCardinality));
}

function removeRelationRow(rowId) {
  relationRows.value = relationRows.value.filter((row) => row.id !== rowId);
  if (relationRows.value.length === 0) {
    relationRows.value = [createRelationRow()];
  }
}

async function applySelectedTemplate({ announce = false } = {}) {
  const template = TEMPLATE_PRESETS.find((item) => item.key === selectedTemplateKey.value) || TEMPLATE_PRESETS[0];
  sourceInput.value = template?.source || DEFAULT_INPUT;
  const parsed = await parseLocalDiagram('classdiagram', sourceInput.value);
  applyEditorState(createEditorStateFromParsed(parsed));
  diagramData.value = parsed;
  statusType.value = 'success';
  statusMessage.value = announce ? '模板已载入' : '';
}

function clearInput() {
  applySelectedTemplate({ announce: true }).catch((error) => {
    diagramData.value = null;
    statusType.value = 'error';
    statusMessage.value = error.message;
  });
}

function hasEditorContent() {
  if (editorMode.value === 'text') {
    return Boolean(String(sourceInput.value || '').trim());
  }

  if (String(titleInput.value || '').trim()) {
    return true;
  }

  if (classRows.value.some((row) => String(row.name || '').trim())) {
    return true;
  }

  return relationRows.value.some((row) => (
    row.sourceNodeId
    || row.targetNodeId
    || String(row.sourceCardinality || '').trim()
    || String(row.targetCardinality || '').trim()
  ));
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
    classRows: classRows.value,
    relationRows: relationRows.value
  }, '已生成类图');
}

watch(
  () => [diagramData.value, config],
  ([diagram]) => {
    scheduleLayout(diagram, config, 120);
  },
  { deep: true }
);

watch(selectedTemplateKey, async (nextKey, previousKey) => {
  if (!nextKey || nextKey === previousKey) return;

  try {
    await applySelectedTemplate({ announce: true });
  } catch (error) {
    statusType.value = 'error';
    statusMessage.value = error.message;
  }
});

onMounted(async () => {
  try {
    await applySelectedTemplate();
  } catch (error) {
    statusType.value = 'error';
    statusMessage.value = error.message || '加载类图示例失败';
  }
});
</script>

<style scoped>
.classdiagram-workspace {
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

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.mode-btn {
  min-height: 30px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  background: transparent;
  color: var(--text-2, #64748b);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.18s ease;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  color: var(--text, #0f172a);
}

.mode-btn.active {
  background: #ffffff;
  color: var(--primary, #024ad8);
  font-weight: 600;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 1px 3px rgba(2, 74, 216, 0.1);
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

.text-input,
.select-input,
.title-input,
.row-input {
  min-height: 30px;
  height: 30px;
  padding: 4px 8px;
  font-size: 12px;
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

.source-textarea {
  min-height: 220px;
  padding: 10px 12px;
  resize: vertical;
  font-size: 12px;
  line-height: 1.6;
  font-family: var(--font-mono, monospace);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
}

.select-input:focus,
.text-input:focus,
.source-textarea:focus {
  outline: none;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.field-hint,
.syntax-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-3);
}

.syntax-card {
  padding: 12px 14px;
  border: 1px solid rgba(116, 137, 163, 0.12);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(242, 247, 252, 0.88) 100%);
}

.syntax-line {
  line-height: 1.6;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: border-color 0.18s ease;
}

.form-card:hover {
  border-color: #cbd5e1;
}

.class-card-head {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 78px 24px;
  gap: 6px;
  align-items: center;
}

.relation-head {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 24px;
  gap: 6px;
  align-items: center;
}

.relation-card .relation-select {
  min-width: 0;
}

.relation-grid,
.relation-node-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.relation-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.relation-field__label {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.member-column {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.member-label {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 600;
}

.member-textarea {
  min-height: 48px;
  padding: 4px 6px;
  font-size: 11.5px;
  font-family: var(--font-mono, monospace);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 5px;
  background: #f8fafc;
  resize: vertical;
  line-height: 1.4;
}

.member-textarea:focus {
  background: #ffffff;
  outline: none;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.relation-card .relation-select {
  min-width: 0;
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
  border-radius: 12px;
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
  transform: scale(var(--class-preview-scale, 1));
  transform-origin: top center;
}

.title-text,
.member-text,
.relation-label,
.relation-cardinality {
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

@media (max-width: 1200px) {
  .classdiagram-workspace {
    flex-direction: column;
    min-height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: 0;
  }

  .source-textarea {
    min-height: 300px;
  }

  .member-grid,
  .class-card-head,
  .relation-head,
  .relation-grid {
    grid-template-columns: 1fr;
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
  .classdiagram-workspace {
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

  .mode-switch,
  .btn-group {
    grid-template-columns: 1fr;
  }

  .preview-shell {
  cursor: grab;
    padding: 14px;
  }

  .source-textarea {
    min-height: 240px;
  }

  .member-textarea {
    min-height: 96px;
  }

  .right-panel {
    min-height: 520px;
  }
}

.row-remove {
  width: 36px;
  min-width: 36px;
  min-height: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  color: var(--text-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  justify-self: end;
  align-self: start;
  box-shadow: var(--shadow-inset);
}

.row-remove:hover {
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  background: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.row-remove svg {
  width: 14px;
  height: 14px;
}
</style>
