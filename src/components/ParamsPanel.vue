<template>
  <section class="params-panel" id="params-panel">
    <div class="params-header" @click="toggleCollapse">
      <div class="params-header__copy">
        <span class="params-header__eyebrow">Visual Controls</span>
        <div class="params-header__title-row">
          <strong>参数面板</strong>
          <span>{{ groupCount }} 组 / {{ controlCount }} 项</span>
        </div>
      </div>

      <div class="params-header__actions">
        <button class="params-reset" type="button" @click.stop="$emit('reset')">恢复默认</button>
        <span class="params-arrow" :class="{ collapsed: isCollapsed }">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor" class="svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>
    </div>

    <div class="params-body" :class="{ collapsed: isCollapsed }" :style="{ '--params-columns': schema.columns || 4 }">
      <div v-for="group in resolvedGroups" :key="group.id" class="param-group" :class="`group-${group.id}`">
        <div class="param-group__head">
          <h4><span class="dot" :class="group.dotColor"></span>{{ group.label }}</h4>
        </div>

        <div v-for="control in group.controls" :key="control.key" class="param-row">
          <template v-if="control.type === 'slider'">
            <label>{{ control.label }}</label>
            <input
              :value="getControlValue(control)"
              @input="setControlValue(control, Number($event.target.value))"
              :min="control.min"
              :max="control.max"
              :step="control.step"
              type="range"
              class="param-slider"
            >
            <span class="param-value">{{ getControlValue(control) }}{{ control.unit || '' }}</span>
          </template>

          <template v-else-if="control.type === 'toggle'">
            <label
              v-if="!isEditingLabel(control)"
              class="param-toggle-label"
              :class="{ 'param-toggle-label--editable': Boolean(control.editableLabelKey) }"
              :title="control.editableLabelKey ? '双击修改列名' : ''"
              @dblclick="startLabelEdit(control)"
            >{{ getControlLabel(control) }}</label>
            <input
              v-else
              ref="editingLabelInput"
              v-model.trim="editingLabel.value"
              type="text"
              class="param-label-input"
              @blur="saveLabelEdit(control)"
              @keyup.enter="saveLabelEdit(control)"
              @keyup.escape="cancelLabelEdit"
            >
            <label class="toggle-switch">
              <input v-model="effectiveConfig[control.key]" type="checkbox">
              <span class="toggle-slider"></span>
            </label>
          </template>

          <template v-else-if="control.type === 'select'">
            <label>{{ control.label }}</label>
            <select v-model="effectiveConfig[control.key]" class="param-select">
              <option v-for="opt in control.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </template>

          <template v-else-if="control.type === 'color'">
            <label>{{ control.label }}</label>
            <div class="color-row">
              <input v-model="effectiveConfig[control.key]" type="color" class="param-color">
              <span class="param-value">{{ effectiveConfig[control.key] }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';

const props = defineProps({
  schema: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  context: {
    type: Object,
    default: null
  }
});

const effectiveConfig = computed(() => {
  if (props.config && Object.keys(props.config).length > 0) {
    return props.config;
  }
  return props.modelValue || props.config || {};
});

defineEmits(['reset']);

const isCollapsed = ref(false);
const editingLabel = ref({
  key: '',
  value: ''
});
const groupCount = computed(() => props.schema?.groups?.length || 0);
const controlCount = computed(() =>
  resolvedGroups.value.reduce((sum, group) => sum + (group.controls?.length || 0), 0)
);
const resolvedGroups = computed(() => {
  const groups = props.schema?.groups || [];
  return groups.map((group) => {
    if (group.id === 'column-widths') {
      return {
        ...group,
        controls: resolveColumnWidthControls(group.controls || [])
      };
    }
    return group;
  });
});

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function resolveColumnWidthControls(controls) {
  const context = props.context || {};
  const mode = context.mode || 'sql';

  if (mode === 'custom') {
    const customColumns = Array.isArray(context.customColumns) ? context.customColumns : [];
    return customColumns.map((column, index) => ({
      key: `CUSTOM_COL_WIDTH_${index}`,
      type: 'slider',
      label: column.label || `列${index + 1}`,
      min: 10,
      max: 70,
      step: 1,
      unit: '%',
      valueGetter: () => Number(column.width || 0),
      valueSetter: (value) => column.onChange?.(value)
    }));
  }

  const visibleKeys = new Set(Array.isArray(context.visibleColumnKeys) ? context.visibleColumnKeys : []);
  if (!visibleKeys.size) {
    return controls;
  }
  return controls.filter((control) => visibleKeys.has(control.key));
}

function getControlValue(control) {
  if (typeof control.valueGetter === 'function') {
    return control.valueGetter();
  }
  return effectiveConfig.value?.[control.key];
}

function setControlValue(control, value) {
  if (typeof control.valueSetter === 'function') {
    control.valueSetter(value);
    return;
  }
  if (effectiveConfig.value) {
    effectiveConfig.value[control.key] = value;
  }
}

function getControlLabel(control) {
  if (control.editableLabelKey) {
    return effectiveConfig.value?.[control.editableLabelKey] || control.label;
  }
  return control.label;
}

function isEditingLabel(control) {
  return Boolean(control.editableLabelKey) && editingLabel.value.key === control.editableLabelKey;
}

function startLabelEdit(control) {
  if (!control.editableLabelKey) return;
  editingLabel.value = {
    key: control.editableLabelKey,
    value: getControlLabel(control)
  };
  nextTick(() => {
    const input = document.querySelector('.param-label-input');
    if (input) {
      input.focus();
      input.select();
    }
  });
}

function saveLabelEdit(control) {
  if (!control.editableLabelKey || editingLabel.value.key !== control.editableLabelKey) return;
  const nextValue = editingLabel.value.value?.trim() || control.label;
  if (effectiveConfig.value) {
    effectiveConfig.value[control.editableLabelKey] = nextValue;
  }
  editingLabel.value = { key: '', value: '' };
}

function cancelLabelEdit() {
  editingLabel.value = { key: '', value: '' };
}
</script>

<style scoped>
.params-panel {
  --params-blue: #3b82f6;
  --params-blue-strong: #2563eb;
  --params-blue-soft: rgba(59, 130, 246, 0.08);
  --params-blue-border: rgba(59, 130, 246, 0.14);
  --params-blue-muted: #64748b;
  --params-white: #ffffff;
  --params-surface: #f8fbff;
  --params-line: #e8f0fe;
  overflow: hidden;
  border: 1px solid var(--params-blue-border);
  border-radius: var(--radius-lg);
  background: var(--params-white);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.05), 0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.params-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--params-line);
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  cursor: pointer;
}

.params-header__copy {
  min-width: 0;
}

.params-header__eyebrow {
  color: var(--params-blue-strong);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.params-header__title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.params-header__title-row strong {
  color: #1e293b;
  font-size: 18px;
  line-height: 1.1;
  font-family: var(--font-display);
  font-weight: 700;
}

.params-header__title-row span {
  color: var(--params-blue-muted);
  font-size: 13px;
  font-weight: 600;
}

.params-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.params-reset {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(59, 130, 246, 0.22);
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.08);
  color: var(--params-blue-strong);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.params-reset:hover {
  transform: translateY(-1px);
  border-color: var(--params-blue);
  background: var(--params-blue);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.params-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid var(--params-line);
  background: #ffffff;
  color: var(--params-blue);
  transition: transform 0.22s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.params-arrow.collapsed {
  transform: rotate(-90deg);
}

.params-body {
  display: grid;
  grid-template-columns: repeat(var(--params-columns), minmax(0, 1fr));
  gap: 14px;
  padding: 18px 18px 20px;
  max-height: 1400px;
  overflow: hidden;
  background: #ffffff;
  transition: max-height 0.35s ease, padding 0.35s ease, opacity 0.35s ease;
}

.params-body.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 16px 14px;
  border: 1px solid var(--params-line);
  border-radius: 8px;
  background: var(--params-surface);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.param-group__head {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--params-line);
}

.param-group h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.dot-orange,
.dot-blue,
.dot-green,
.dot-check {
  background: var(--params-blue);
}

.param-row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 58px;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.param-row label {
  color: #475569;
  font-size: 13px;
  font-weight: 500;
}

.param-row:has(.toggle-switch) {
  grid-template-columns: minmax(0, 1fr) auto;
}

.param-row:has(.param-select),
.param-row:has(.param-color) {
  grid-template-columns: 72px minmax(0, 1fr);
}

.group-column-visibility .param-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 12px;
  width: 100%;
}

.group-column-visibility .param-row label {
  min-width: 0;
  line-height: 1.45;
}

.param-toggle-label {
  min-width: 0;
}

.param-toggle-label--editable {
  cursor: text;
  user-select: none;
}

.param-toggle-label--editable:hover {
  color: var(--params-blue);
}

.param-label-input {
  width: 100%;
  min-width: 0;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--params-line);
  border-radius: 4px;
  background: #ffffff;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.param-label-input:focus {
  background: #ffffff;
  border-color: var(--params-blue);
  box-shadow: 0 0 0 3px var(--params-blue-soft);
}

.group-column-visibility .toggle-switch {
  justify-self: end;
}

.toggle-switch .toggle-slider {
  border-color: #dbeafe;
  background: #eff6ff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.toggle-switch .toggle-slider::before {
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.12);
}

.toggle-switch input:checked + .toggle-slider {
  border-color: var(--params-blue);
  background: var(--params-blue);
  box-shadow: 0 0 0 3px var(--params-blue-soft);
}

.toggle-switch input:checked + .toggle-slider::before {
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.22);
}

.group-column-visibility {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.param-slider {
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--params-blue-soft), #eaf2ff);
  outline: none;
}

.param-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: var(--params-blue);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.param-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.param-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: var(--params-blue);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.param-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.param-select {
  width: 100%;
  min-width: 0;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--params-line);
  border-radius: 4px;
  background: #ffffff;
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 0 rgba(59, 130, 246, 0.03);
}

.param-select option {
  color: #1e293b;
}

.param-select:focus {
  outline: none;
  background: #ffffff;
  border-color: var(--params-blue);
  box-shadow: 0 0 0 3px var(--params-blue-soft);
}

.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.param-color {
  width: 42px;
  height: 32px;
  border: 1px solid var(--params-line);
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  padding: 3px;
}

.param-color::-webkit-color-swatch-wrapper {
  padding: 0;
}

.param-color::-webkit-color-swatch,
.param-color::-moz-color-swatch {
  border: none;
  border-radius: 8px;
}

.param-value {
  color: var(--params-blue-muted);
  font-size: 12.5px;
  font-weight: 600;
  text-align: right;
  font-family: var(--font-body);
}

@media (max-width: 1180px) {
  .params-body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .params-panel {
    border-radius: 20px;
  }

  .params-header,
  .params-body {
    padding-left: 16px;
    padding-right: 16px;
  }

  .params-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .params-header__actions {
    width: 100%;
    justify-content: space-between;
  }

  .params-body {
    grid-template-columns: 1fr;
  }

  .group-column-visibility .param-row {
    width: 100%;
  }

  .group-column-visibility {
    grid-template-columns: 1fr;
  }
}
</style>

