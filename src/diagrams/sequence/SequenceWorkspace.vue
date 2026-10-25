<template>
  <div class="sequence-workspace">
    <div class="left-panel panel">
      <div class="panel-header">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15M8.25 4.5v15m7.5-15v15" />
          </svg>
        </span>
        输入时序图描述
      </div>
      <div class="panel-body">
        <div class="editor-section template-section">
          <div class="field-head">
            <label class="field-label" for="sequence-template">示例模板</label>
            <span class="field-meta">{{ selectedTemplate?.description || '选择后可一键载入' }}</span>
          </div>
          <div class="template-row">
            <select id="sequence-template" v-model="selectedTemplateKey" class="select-input template-select">
              <option v-for="template in TEMPLATE_PRESETS" :key="template.key" :value="template.key">
                {{ template.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="editor-section editor-main">
          <div class="field-head">
            <label class="field-label" for="sequence-source">时序图源码</label>
            <span class="field-meta">{{ editorSummary }}</span>
          </div>
          <textarea
            id="sequence-source"
            v-model="sourceInput"
            class="source-input"
            spellcheck="false"
            placeholder="例如：actor 用户&#10;participant 登录页&#10;participant 服务端&#10;database 数据库&#10;用户 -> 登录页: 输入账号密码"
          ></textarea>
        </div>

        <div class="syntax-grid">
          <div class="syntax-card">
            <h4>参与者</h4>
            <code>actor 用户</code>
            <code>participant Web前端</code>
            <code>database 用户库</code>
          </div>
          <div class="syntax-card">
            <h4>消息</h4>
            <code>A -&gt; B: 同步请求</code>
            <code>A --&gt;&gt; B: 异步返回</code>
            <code>A -&gt; A: 自调用</code>
          </div>
          <div class="syntax-card">
            <h4>备注</h4>
            <code>note over A: 说明</code>
            <code>note left of A: 本地校验</code>
            <code>note over A,B: 共享上下文</code>
          </div>
          <div class="syntax-card">
            <h4>分支块</h4>
            <code>alt 条件成立</code>
            <code>else 条件不成立</code>
            <code>opt / loop / end</code>
          </div>
        </div>

        <div class="input-help">
          <span>参与者、同步/返回消息、激活条、alt / opt / loop 片段</span>
          <span>默认示例已加载，可直接生成、预览与导出</span>
        </div>

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
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5h15v15h-15zM8.25 8.25h7.5m-7.5 3.75h7.5m-7.5 3.75h5.25" />
          </svg>
        </span>
        时序图预览
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
            :style="{ '--sequence-preview-scale': previewLayout.displayScale, width: `${previewLayout.displayWidth}px`, height: `${previewLayout.displayHeight}px` }"
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
                <marker id="sequence-arrow-solid" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#111111" />
                </marker>
                <marker id="sequence-arrow-open" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
                  <path d="M 0 1 L 10 6 L 0 11" fill="none" stroke="#111111" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                </marker>
              </defs>

              <g :transform="`translate(${layout.contentTranslateX}, 0)`">
                <text
                  :x="layout.title.centerX - layout.contentTranslateX"
                  :y="layout.title.y"
                  text-anchor="middle"
                  :style="{ fill: '#111111', fontSize: `${layout.title.fontSize}px`, fontWeight: layout.title.fontWeight, fontFamily: layout.fontFamily }"
                >
                  {{ diagramData.title }}
                </text>
                <g class="lifeline-group">
                  <line
                    v-for="lifeline in layout.lifelines"
                    :key="`${lifeline.id}-lifeline`"
                    :x1="lifeline.x"
                    :y1="lifeline.y1"
                    :x2="lifeline.x"
                    :y2="lifeline.y2"
                    stroke="#111111"
                    :stroke-width="layout.lineWidth"
                    stroke-dasharray="7 6"
                    stroke-linecap="round"
                  />
                </g>

                <g class="activation-group">
                  <rect
                    v-for="activation in layout.activations"
                    :key="activation.id"
                    :x="activation.x"
                    :y="activation.y"
                    :width="activation.width"
                    :height="activation.height"
                    fill="#ffffff"
                    stroke="#111111"
                    :stroke-width="layout.lineWidth"
                  />
                </g>

                <g class="group-group">
                  <g v-for="group in layout.groups" :key="group.id">
                    <rect
                      :x="group.x"
                      :y="group.y"
                      :width="group.width"
                      :height="group.height"
                      fill="none"
                      stroke="#111111"
                      :stroke-width="layout.lineWidth"
                    />
                    <path
                      :d="group.tagPath"
                      fill="#ffffff"
                      stroke="#111111"
                      :stroke-width="layout.lineWidth"
                      stroke-linejoin="round"
                    />
                    <text
                      :x="group.keywordX"
                      :y="group.keywordY"
                      :style="{ fill: '#111111', fontSize: `${layout.groupKeywordFontSize}px`, fontWeight: 700, fontFamily: layout.fontFamily }"
                      dominant-baseline="middle"
                    >
                      {{ group.keyword }}
                    </text>
                    <text
                      v-if="group.label"
                      :x="group.labelX"
                      :y="group.labelY"
                      :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 500, fontFamily: layout.fontFamily }"
                      dominant-baseline="middle"
                    >
                      {{ group.label }}
                    </text>
                    <g v-for="separator in group.separators" :key="`${group.id}-${separator.y}`">
                      <line
                        :x1="group.x"
                        :y1="separator.y"
                        :x2="group.x + group.width"
                        :y2="separator.y"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                        stroke-dasharray="7 5"
                      />
                      <path
                        :d="separator.tagPath"
                        fill="#ffffff"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                        stroke-linejoin="round"
                      />
                      <text
                        :x="separator.textX"
                        :y="separator.textY"
                        :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 600, fontFamily: layout.fontFamily }"
                        stroke-linejoin="round"
                        dominant-baseline="middle"
                      >
                        {{ separator.label }}
                      </text>
                    </g>
                  </g>
                </g>

                <g class="message-group">
                  <g v-for="message in layout.messages" :key="message.id">
                    <path
                      :d="message.path"
                      fill="none"
                      stroke="#111111"
                      :stroke-width="layout.lineWidth"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :stroke-dasharray="message.dashArray"
                      :marker-end="message.markerEnd"
                    />
                    <rect
                      :x="message.labelX - message.labelBoxWidth / 2"
                      :y="message.labelTopY"
                      :width="message.labelBoxWidth"
                      :height="message.labelBoxHeight"
                      rx="4"
                      fill="#ffffff"
                    />
                    <text
                      :x="message.labelX"
                      text-anchor="middle"
                      :style="{ fill: '#111111', stroke: '#ffffff', strokeWidth: `${layout.textHaloWidth}px`, paintOrder: 'stroke', fontSize: `${layout.fontSize}px`, fontWeight: message.fontWeight, fontStyle: message.fontStyle, fontFamily: layout.fontFamily }"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                    >
                      <tspan
                        v-for="(line, lineIndex) in message.labelLines"
                        :key="`${message.id}-label-${lineIndex}`"
                        :x="message.labelX"
                        :y="message.labelStartY + lineIndex * message.labelLineStep"
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>
                </g>

                <g class="note-group">
                  <g v-for="note in layout.notes" :key="note.id">
                    <path
                      :d="note.path"
                      fill="#ffffff"
                      stroke="#111111"
                      :stroke-width="layout.lineWidth"
                      stroke-linejoin="round"
                    />
                    <path
                      :d="note.foldPath"
                      fill="none"
                      stroke="#111111"
                      :stroke-width="layout.lineWidth"
                      stroke-linejoin="round"
                    />
                    <text
                      :x="note.textX"
                      :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: layout.fontWeight, fontFamily: layout.fontFamily }"
                      text-anchor="middle"
                    >
                      <tspan
                        v-for="(line, lineIndex) in note.lines"
                        :key="`${note.id}-line-${lineIndex}`"
                        :x="note.textX"
                        :y="note.textStartY + lineIndex * note.lineStep"
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>
                </g>

                <g class="participant-group">
                  <g v-for="participant in layout.participants" :key="participant.id">
                    <g v-if="participant.type === 'actor'">
                      <circle
                        :cx="participant.figureCenterX"
                        :cy="participant.headCenterY"
                        :r="participant.headRadius"
                        fill="#ffffff"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                      />
                      <line
                        :x1="participant.figureCenterX"
                        :y1="participant.bodyTopY"
                        :x2="participant.figureCenterX"
                        :y2="participant.bodyBottomY"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                        stroke-linecap="round"
                      />
                      <line
                        :x1="participant.figureCenterX - participant.armHalfWidth"
                        :y1="participant.armY"
                        :x2="participant.figureCenterX + participant.armHalfWidth"
                        :y2="participant.armY"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                        stroke-linecap="round"
                      />
                      <line
                        :x1="participant.figureCenterX"
                        :y1="participant.bodyBottomY"
                        :x2="participant.figureCenterX - participant.legSpread"
                        :y2="participant.legBottomY"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                        stroke-linecap="round"
                      />
                      <line
                        :x1="participant.figureCenterX"
                        :y1="participant.bodyBottomY"
                        :x2="participant.figureCenterX + participant.legSpread"
                        :y2="participant.legBottomY"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                        stroke-linecap="round"
                      />
                      <text
                        :x="participant.centerX"
                        text-anchor="middle"
                        :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 600, fontFamily: layout.fontFamily }"
                      >
                        <tspan
                          v-for="(line, lineIndex) in participant.nameLines"
                          :key="`${participant.id}-name-${lineIndex}`"
                          :x="participant.centerX"
                          :y="participant.nameTextStartY + lineIndex * participant.nameLineStep"
                        >
                          {{ line }}
                        </tspan>
                      </text>
                      <rect
                        :x="participant.footerX"
                        :y="participant.footerY"
                        :width="participant.footerWidth"
                        :height="participant.footerHeight"
                        fill="#ffffff"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                      />
                      <text
                        :x="participant.footerCenterX"
                        text-anchor="middle"
                        :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 600, fontFamily: layout.fontFamily }"
                      >
                        <tspan
                          v-for="(line, lineIndex) in participant.nameLines"
                          :key="`${participant.id}-footer-name-${lineIndex}`"
                          :x="participant.footerCenterX"
                          :y="participant.footerNameTextStartY + lineIndex * participant.nameLineStep"
                        >
                          {{ line }}
                        </tspan>
                      </text>
                    </g>
                    <g v-else>
                      <rect
                        :x="participant.x"
                        :y="participant.y"
                        :width="participant.width"
                        :height="participant.height"
                        fill="#ffffff"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                      />
                      <text
                        :x="participant.centerX"
                        text-anchor="middle"
                        :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 600, fontFamily: layout.fontFamily }"
                      >
                        <tspan
                          v-for="(line, lineIndex) in participant.nameLines"
                          :key="`${participant.id}-name-${lineIndex}`"
                          :x="participant.centerX"
                          :y="participant.nameTextStartY + lineIndex * participant.nameLineStep"
                        >
                          {{ line }}
                        </tspan>
                      </text>
                      <rect
                        :x="participant.footerX"
                        :y="participant.footerY"
                        :width="participant.footerWidth"
                        :height="participant.footerHeight"
                        fill="#ffffff"
                        stroke="#111111"
                        :stroke-width="layout.lineWidth"
                      />
                      <text
                        :x="participant.footerCenterX"
                        text-anchor="middle"
                        :style="{ fill: '#111111', fontSize: `${layout.fontSize}px`, fontWeight: 600, fontFamily: layout.fontFamily }"
                      >
                        <tspan
                          v-for="(line, lineIndex) in participant.nameLines"
                          :key="`${participant.id}-footer-name-${lineIndex}`"
                          :x="participant.footerCenterX"
                          :y="participant.footerNameTextStartY + lineIndex * participant.nameLineStep"
                        >
                          {{ line }}
                        </tspan>
                      </text>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">⏱️</div>
          <h3>时序图生成</h3>
          <p>左侧输入参与者、消息和分支块语法后，即可自动生成黑白风格时序图。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { DEFAULT_INPUT, TEMPLATE_PRESETS } from './templates.js';

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
  cropSelector: '.sequence-group',
  padding: 18,
  defaultFileName: 'sequence-diagram'
});

// 3. 执行引擎与调度
const {
  diagramData,
  layout,
  statusMessage,
  statusType,
  scheduleLayout,
  runGenerate
} = useDiagramRunner('sequence');

const sourceInput = ref(DEFAULT_INPUT);
const selectedTemplateKey = ref(TEMPLATE_PRESETS[0]?.key || '');




const selectedTemplate = computed(() =>
  TEMPLATE_PRESETS.find((template) => template.key === selectedTemplateKey.value) || TEMPLATE_PRESETS[0] || null
);

const editorSummary = computed(() => {
  if (diagramData.value) {
    const messageCount = diagramData.value.items.filter((item) => item.kind === 'message').length;
    const noteCount = diagramData.value.items.filter((item) => item.kind === 'note').length;
    const blockCount = diagramData.value.groups.length;
    return `${diagramData.value.participants.length} 个参与者 / ${messageCount} 条消息 / ${noteCount} 个备注 / ${blockCount} 个片段`;
  }

  const lineCount = sourceInput.value.split(/\r?\n/).filter((line) => line.trim()).length;
  return `${lineCount} 行描述`;
});

async function loadPreviewFromSource(source, { announce = false, message = '已恢复默认示例' } = {}) {
  const parsed = await parseLocalDiagram('sequence', source);
  sourceInput.value = source;
  diagramData.value = parsed;
  statusType.value = 'success';
  statusMessage.value = announce ? message : '';
}

function applySelectedTemplate() {
  if (!selectedTemplate.value) return;
  loadPreviewFromSource(selectedTemplate.value.source, {
    announce: true,
    message: '示例模板已载入'
  }).catch((error) => {
    statusType.value = 'error';
    statusMessage.value = error.message;
  });
}

function clearInput() {
  applySelectedTemplate();
}

function hasEditorContent() {
  return Boolean(String(sourceInput.value || '').trim());
}

async function generateDiagram() {
  if (!hasEditorContent()) {
    diagramData.value = null;
    statusType.value = 'success';
    statusMessage.value = '';
    return;
  }

  try {
    const decision = await requestGeneratePermission();
    if (!decision.allowed) {
      openLicenseDialog();
      return;
    }

    const parsed = await parseLocalDiagram('sequence', sourceInput.value);
    await commitGenerateSuccess();
    diagramData.value = parsed;
    statusType.value = 'success';
    statusMessage.value = shouldWarnRemaining(decision.access)
      ? `已生成 ${parsed.participants.length} 个参与者、${parsed.items.filter((item) => item.kind === 'message').length} 条消息、${parsed.items.filter((item) => item.kind === 'note').length} 个备注，免费次数即将用完`
      : `已生成 ${parsed.participants.length} 个参与者、${parsed.items.filter((item) => item.kind === 'message').length} 条消息、${parsed.items.filter((item) => item.kind === 'note').length} 个备注`;
  } catch (error) {
    diagramData.value = null;
    statusType.value = 'error';
    statusMessage.value = error.message;
  }
}



watch(
  () => [diagramData.value, config],
  ([diagram]) => {
    scheduleLayout(diagram, config, 120);
  },
  { deep: true }
);

watch(selectedTemplateKey, (nextKey, previousKey) => {
  if (!nextKey || nextKey === previousKey) return;
  applySelectedTemplate();
});



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

onMounted(() => {
  applySelectedTemplate();
});
</script>

<style scoped>
.sequence-workspace {
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

.editor-main {
  flex: 1;
  min-height: 240px;
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

.template-row {
  display: flex;
  width: 100%;
}

.source-input,
.select-input {
  width: 100%;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  background: #ffffff;
  color: var(--text, #0f172a);
  transition: all 0.18s ease;
  font-family: var(--font-body);
}

.select-input {
  height: 30px;
  min-height: 30px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  padding-right: 18px !important;
  color: #334155;
  cursor: pointer;
}

.source-input {
  flex: 1;
  min-height: 220px;
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.6;
  font-size: 12px;
  white-space: pre;
  overflow: auto;
  font-family: var(--font-mono, monospace);
}

.source-input:focus,
.select-input:focus {
  outline: none;
  border-color: var(--primary, #024ad8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.syntax-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.syntax-card {
  padding: 8px 10px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.syntax-card h4 {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text, #0f172a);
  margin: 0;
}

.syntax-card code {
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--primary-soft, #eff6ff);
  color: #1e3a8a;
  font-size: 10.5px;
  line-height: 1.4;
  font-family: var(--font-mono, monospace);
}

.input-help {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid rgba(116, 137, 163, 0.12);
  border-radius: 10px;
  background: #fafafa;
  font-size: 11.5px;
  color: var(--text-3);
  line-height: 1.5;
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
  transform: scale(var(--sequence-preview-scale, 1));
  transform-origin: top center;
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

@media (max-width: 1180px) {
  .sequence-workspace {
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
    min-height: 620px;
  }
}

@media (max-width: 768px) {
  .syntax-grid,
  .btn-group,
  .template-row {
    grid-template-columns: 1fr;
  }

  .preview-shell {
  cursor: grab;
    padding: 16px;
  }
}

@media (max-width: 640px) {
  .sequence-workspace {
    padding: 8px 10px;
  }

  .field-head {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
  }

  .source-input {
    min-height: 240px;
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


