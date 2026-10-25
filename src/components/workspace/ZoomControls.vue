<template>
  <div class="preview-zoom-group">
    <button 
      class="zoom-btn" 
      type="button" 
      :disabled="disabled || !canZoomOut" 
      title="缩小"
      @click="$emit('zoom-out')"
    >-</button>
    <button 
      class="zoom-btn zoom-indicator" 
      type="button" 
      :disabled="disabled" 
      title="重置缩放比例"
      @click="$emit('reset-zoom')"
    >{{ percentage }}%</button>
    <button 
      class="zoom-btn" 
      type="button" 
      :disabled="disabled || !canZoomIn" 
      title="放大"
      @click="$emit('zoom-in')"
    >+</button>
  </div>
</template>

<script setup>
defineProps({
  percentage: {
    type: Number,
    default: 100
  },
  canZoomIn: {
    type: Boolean,
    default: true
  },
  canZoomOut: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['zoom-in', 'zoom-out', 'reset-zoom']);
</script>

<style scoped>
.preview-zoom-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 2px;
}

.zoom-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  cursor: pointer;
  transition: all 0.18s ease;
}

.zoom-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  color: #0f172a;
  background: #f8fafc;
}

.zoom-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.zoom-indicator {
  min-width: 52px;
}
</style>
