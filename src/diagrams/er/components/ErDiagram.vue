<template>
  <div class="panel canvas-panel">
    <!-- Toolbar -->
    <div class="canvas-toolbar">
      <button @click="$emit('prev')" class="btn-icon" title="上一个表">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <span class="table-indicator">
        {{ total > 0 ? (currentIndex + 1) + ' / ' + total : '暂无数据' }}
      </span>
      <button @click="$emit('next')" class="btn-icon" title="下一个表">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <div class="toolbar-spacer"></div>
      <button @click="zoomIn" class="btn-icon" title="放大">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
        </svg>
      </button>
      <button @click="zoomOut" class="btn-icon" title="缩小">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
        </svg>
      </button>
      <button @click="resetZoom" class="btn-icon" title="重置缩放">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
      <button @click="exportImage" class="btn-export">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        导出图片
      </button>
      <button @click="$emit('exportAll')" class="btn-export">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
        批量导出
      </button>
    </div>

    <!-- Canvas Area -->
    <div class="canvas-area" ref="canvasArea">
      <svg
        v-if="layoutData"
        ref="svgEl"
        :viewBox="viewBoxVal"
        :width="svgWidth"
        :height="svgHeight"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g ref="contentGroup">
          <!-- Lines -->
          <line
            v-for="(attr, i) in entity.attributes"
            :key="'line-'+i"
            :x1="getConnectorStart(attr).x"
            :y1="getConnectorStart(attr).y"
            :x2="getConnectorEnd(attr).x"
            :y2="getConnectorEnd(attr).y"
            stroke="#444"
            :stroke-width="config.CONN_LINE_WIDTH"
          />

          <!-- Entity Rect -->
          <rect
            :x="entity.x"
            :y="entity.y"
            :width="entity.width"
            :height="entity.height"
            fill="#ffffff"
            stroke="#333"
            :stroke-width="config.ENTITY_BORDER_WIDTH"
          />
          <text
            :x="entity.cx"
            :y="entity.cy + 6"
            text-anchor="middle"
            :font-size="config.FONT_SIZE"
            :font-family="config.FONT_FAMILY"
            :font-weight="config.FONT_WEIGHT"
            fill="#333"
            style="cursor: pointer"
            @dblclick="startEdit($event, entity.table, 'comment')"
          >{{ entity.table.comment || entity.table.name }}</text>

          <!-- Attributes -->
          <g v-for="(attr, i) in entity.attributes" :key="'attr-'+i">
            <ellipse
              :cx="attr.cx"
              :cy="attr.cy"
              :rx="attr.rx"
              :ry="attr.ry"
              fill="#ffffff"
              stroke="#333"
              :stroke-width="config.ATTR_BORDER_WIDTH"
            />
            <text
              :x="attr.cx"
              :y="attr.cy + 5"
              text-anchor="middle"
              :font-size="config.FONT_SIZE"
              :font-family="config.FONT_FAMILY"
              :font-weight="config.FONT_WEIGHT"
              fill="#333"
              :text-decoration="attr.column.isPrimaryKey && config.SHOW_PK_UNDERLINE ? 'underline' : 'none'"
              style="cursor: pointer"
              @dblclick="startEdit($event, attr.column, 'comment')"
            >{{ attr.column.comment || attr.column.name }}</text>

            <!-- Wavy Line for FK -->
            <path
              v-if="attr.column.isForeignKey && config.SHOW_FK_WAVY"
              :d="getWavyPath(attr)"
              fill="none"
              stroke="#333"
              stroke-width="1.5"
            />
          </g>
        </g>
      </svg>
      
      <!-- Placeholder -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <text x="50%" y="50%" text-anchor="middle" fill="#bbb" font-size="15" font-family="Microsoft YaHei">
            请输入 SQL 语句并点击「生成 ER 图」
        </text>
      </svg>

      <!-- Edit Input Overlay -->
      <input 
        v-if="editing.show"
        ref="editInput"
        v-model="editing.value"
        type="text"
        class="svg-text-editor"
        :style="editInputStyle"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.esc="cancelEdit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { downloadBlob, exportSvgMarkupToPngBlob } from '../../../utils/exportImage.js';
import { showToast } from '../../../utils/toast.js';

const props = defineProps({
  table: Object,
  config: Object,
  currentIndex: Number,
  total: Number
});

const emit = defineEmits(['prev', 'next', 'exportAll', 'update:table', 'updateComment']);

// Zoom State
const zoom = ref(1);

const layoutData = ref(null);
const lastRenderedTableName = ref('');

function buildLocalLayout(table, config) {
  if (!table || !Array.isArray(table.columns) || table.columns.length === 0) {
    return null;
  }

  const fontSize = Number(config.FONT_SIZE || 20);
  const entityWidth = Math.max(220, Math.round((String(table.comment || table.name || '').length + 4) * fontSize * 0.9));
  const entityHeight = Math.max(72, Math.round(fontSize * 3.2));
  const radius = Number(config.RADIUS || 260) * (config.COMPACT_ATTR_LAYOUT ? 0.72 : 1);
  const attrRx = Number(config.ATTR_RX || 84);
  const attrRy = Number(config.ATTR_RY || 26);
  const centerX = radius + attrRx + 120;
  const centerY = radius + attrRy + 120;
  const linePadding = 36;

  const attributes = table.columns.map((column, index) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / table.columns.length);
    const cx = centerX + Math.cos(angle) * radius;
    const cy = centerY + Math.sin(angle) * radius;
    return {
      column,
      cx,
      cy,
      rx: attrRx,
      ry: attrRy
    };
  });

  const minX = Math.min(centerX - entityWidth / 2, ...attributes.map((attr) => attr.cx - attr.rx)) - linePadding;
  const maxX = Math.max(centerX + entityWidth / 2, ...attributes.map((attr) => attr.cx + attr.rx)) + linePadding;
  const minY = Math.min(centerY - entityHeight / 2, ...attributes.map((attr) => attr.cy - attr.ry)) - linePadding;
  const maxY = Math.max(centerY + entityHeight / 2, ...attributes.map((attr) => attr.cy + attr.ry)) + linePadding;

  return {
    totalWidth: Math.ceil(maxX - minX),
    totalHeight: Math.ceil(maxY - minY),
    entities: [{
      table,
      x: centerX - entityWidth / 2 - minX,
      y: centerY - entityHeight / 2 - minY,
      width: entityWidth,
      height: entityHeight,
      cx: centerX - minX,
      cy: centerY - minY,
      attributes: attributes.map((attr) => ({
        ...attr,
        cx: attr.cx - minX,
        cy: attr.cy - minY
      }))
    }]
  };
}

const entity = computed(() => {
  return layoutData.value?.entities?.[0] || null;
});

const viewBoxVal = computed(() => {
  if (!layoutData.value) return '0 0 800 600';
  return `0 0 ${layoutData.value.totalWidth} ${layoutData.value.totalHeight}`;
});

const svgWidth = computed(() => {
  if (!layoutData.value) return 800;
  return Math.max(1, Math.round(layoutData.value.totalWidth * zoom.value));
});

const svgHeight = computed(() => {
  if (!layoutData.value) return 600;
  return Math.max(1, Math.round(layoutData.value.totalHeight * zoom.value));
});

// Zoom Actions
function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.2, 5);
}
function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.2, 0.2);
}
function resetZoom() {
  zoom.value = 1;
}

watch(
  () => props.table,
  (table) => {
    layoutData.value = buildLocalLayout(table, props.config);
    lastRenderedTableName.value = layoutData.value?.entities?.[0]?.table?.name || '';
  },
  { immediate: true }
);

watch(
  () => props.config,
  (config) => {
    layoutData.value = buildLocalLayout(props.table, config);
    lastRenderedTableName.value = layoutData.value?.entities?.[0]?.table?.name || '';
  },
  { deep: true }
);

// Editing Logic
const editing = ref({
  show: false,
  x: 0,
  y: 0,
  width: 100,
  height: 30,
  value: '',
  targetObj: null,
  targetProp: '',
  fontSize: 14,
  fontFamily: ''
});

const editInputStyle = computed(() => {
    return {
        position: 'absolute',
        left: editing.value.x + 'px',
        top: editing.value.y + 'px',
        transform: 'translate(-50%, -50%)',
        minWidth: Math.max(editing.value.width + 20, 80) + 'px',
        height: (editing.value.height + 10) + 'px',
        fontSize: editing.value.fontSize + 'px',
        fontFamily: editing.value.fontFamily,
        textAlign: 'center',
        zIndex: 1000
    };
});

function startEdit(event, targetObj, prop) {
    const textEl = event.target;
    // Get absolute position relative to canvas-area
    // We need to use getBoundingClientRect
    const rect = textEl.getBoundingClientRect();
    const container = textEl.closest('.canvas-area');
    const containerRect = container.getBoundingClientRect();

    editing.value = {
        show: true,
        x: rect.left - containerRect.left + container.scrollLeft + rect.width / 2,
        y: rect.top - containerRect.top + container.scrollTop + rect.height / 2,
        width: rect.width,
        height: rect.height,
        value: targetObj[prop] || targetObj.name,
        targetObj: targetObj,
        targetProp: prop,
        fontSize: parseFloat(textEl.getAttribute('font-size')),
        fontFamily: textEl.getAttribute('font-family')
    };
    
    nextTick(() => {
        // focus input
        const input = document.querySelector('.svg-text-editor');
        if(input) input.focus();
    });
}

function finishEdit() {
    if (editing.value.show && editing.value.targetObj) {
        const val = editing.value.value.trim();
        if (val) {
            editing.value.targetObj[editing.value.targetProp] = val;
            // 判断是表注释还是列注释，通知父组件
            const isTable = editing.value.targetObj === props.table;
            if (isTable) {
                emit('updateComment', {
                    type: 'table',
                    tableName: props.table.name,
                    newComment: val
                });
            } else {
                // 找到对应的列
                const col = editing.value.targetObj;
                emit('updateComment', {
                    type: 'column',
                    tableName: props.table.name,
                    columnName: col.name,
                    newComment: val
                });
            }
        }
    }
    editing.value.show = false;
}

function cancelEdit() {
    editing.value.show = false;
}

function getConnectorStart(attr) {
    if (!entity.value) return { x: 0, y: 0 };
    return getRectBoundaryPoint(entity.value, attr.cx, attr.cy);
}

function getConnectorEnd(attr) {
    if (!entity.value) return { x: attr.cx, y: attr.cy };
    return getEllipseBoundaryPoint(attr, entity.value.cx, entity.value.cy);
}

function getRectBoundaryPoint(rect, targetX, targetY) {
    const dx = targetX - rect.cx;
    const dy = targetY - rect.cy;

    if (dx === 0 && dy === 0) {
        return { x: rect.cx, y: rect.cy };
    }

    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const scale = 1 / Math.max(Math.abs(dx) / halfW, Math.abs(dy) / halfH);

    return {
        x: rect.cx + dx * scale,
        y: rect.cy + dy * scale
    };
}

function getEllipseBoundaryPoint(attr, targetX, targetY) {
    const dx = targetX - attr.cx;
    const dy = targetY - attr.cy;

    if (dx === 0 && dy === 0) {
        return { x: attr.cx, y: attr.cy };
    }

    const scale = 1 / Math.sqrt((dx * dx) / (attr.rx * attr.rx) + (dy * dy) / (attr.ry * attr.ry));

    return {
        x: attr.cx + dx * scale,
        y: attr.cy + dy * scale
    };
}

// Wavy Path Generator
function getWavyPath(attr) {
    const text = attr.column.comment || attr.column.name;
    let estimatedWidth = 0;
    const fs = props.config.FONT_SIZE;
    for (let char of text) {
        estimatedWidth += (char.charCodeAt(0) > 255) ? fs : fs * 0.6;
    }

    const width = estimatedWidth;
    const cx = attr.cx;
    const cy = attr.cy + fs/2 + 4;
    const startX = cx - width / 2;

    const waveAmplitude = 1.5;
    const waveLength = 6.5;
    const steps = Math.ceil(width / waveLength);

    let d = `M ${startX} ${cy}`;
    for (let i = 0; i < steps; i++) {
        let midX = startX + i * waveLength + waveLength / 2;
        let endX = startX + (i + 1) * waveLength;
        d += ` Q ${startX + i * waveLength + waveLength / 4} ${cy - waveAmplitude} ${midX} ${cy}`;
        d += ` Q ${startX + i * waveLength + waveLength * 3 / 4} ${cy + waveAmplitude} ${endX} ${cy}`;
    }
    return d;
}

// Export Logic Helpers
const svgEl = ref(null);
const contentGroup = ref(null);

function getSvgMarkup() {
    if (!svgEl.value || !contentGroup.value) return '';

    const bbox = contentGroup.value.getBBox();
    const strokePadding = Math.max(
        Number(props.config.CONN_LINE_WIDTH || 0),
        Number(props.config.ENTITY_BORDER_WIDTH || 0),
        Number(props.config.ATTR_BORDER_WIDTH || 0),
        props.config.SHOW_FK_WAVY ? 1.5 : 0
    );
    const exportPadding = Math.max(18, Math.ceil(strokePadding * 4));
    const x = Math.floor(bbox.x - exportPadding);
    const y = Math.floor(bbox.y - exportPadding);
    const width = Math.ceil(bbox.width + exportPadding * 2);
    const height = Math.ceil(bbox.height + exportPadding * 2);

    const clonedSvg = svgEl.value.cloneNode(true);
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('viewBox', `${x} ${y} ${Math.max(1, width)} ${Math.max(1, height)}`);
    clonedSvg.setAttribute('width', `${Math.max(1, width)}`);
    clonedSvg.setAttribute('height', `${Math.max(1, height)}`);
    clonedSvg.removeAttribute('style');

    const serializer = new XMLSerializer();
    return serializer.serializeToString(clonedSvg);
}

async function exportImage() {
    try {
        const svgMarkup = getSvgMarkup();
        if (!svgMarkup) return;
        const blob = await exportSvgMarkupToPngBlob(svgMarkup, 2);
        downloadBlob(blob, (props.table.comment || props.table.name) + '_属性图.png');
    } catch (e) {
        console.error('Export failed', e);
        showToast('导出失败', 'error');
    }
}

async function waitForRenderedTable(tableName, timeoutMs = 5000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        if (lastRenderedTableName.value === tableName && getSvgMarkup()) {
            return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error('ER 预览渲染超时');
}

defineExpose({ getSvgMarkup, waitForRenderedTable });
</script>

<style scoped>
/* Inherits from main.css */
</style>
