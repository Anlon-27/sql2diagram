import { ref, computed } from 'vue';

export function useDiagramZoom(options = {}) {
  const {
    min = 0.6,
    max = 1.8,
    step = 0.2,
    defaultZoom = 1
  } = options;

  const previewZoom = ref(defaultZoom);
  const dragRef = ref(null);
  const isDragging = ref(false);
  const dragStart = ref({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const zoomPercentage = computed(() => Math.round(previewZoom.value * 100));
  const canZoomIn = computed(() => previewZoom.value < max);
  const canZoomOut = computed(() => previewZoom.value > min);

  function zoomIn() {
    previewZoom.value = Math.min(max, Number((previewZoom.value + step).toFixed(2)));
  }

  function zoomOut() {
    previewZoom.value = Math.max(min, Number((previewZoom.value - step).toFixed(2)));
  }

  function resetZoom() {
    previewZoom.value = defaultZoom;
  }

  function setZoom(val) {
    previewZoom.value = Math.max(min, Math.min(max, Number(Number(val).toFixed(2))));
  }

  function startDragging(event) {
    if (event.button !== 0 || !dragRef.value) return;
    isDragging.value = true;
    dragStart.value = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: dragRef.value.scrollLeft,
      scrollTop: dragRef.value.scrollTop
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDragging);
  }

  function onMouseMove(event) {
    if (!isDragging.value || !dragRef.value) return;
    const deltaX = event.clientX - dragStart.value.x;
    const deltaY = event.clientY - dragStart.value.y;
    dragRef.value.scrollLeft = dragStart.value.scrollLeft - deltaX;
    dragRef.value.scrollTop = dragStart.value.scrollTop - deltaY;
  }

  function stopDragging() {
    isDragging.value = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', stopDragging);
  }

  return {
    PREVIEW_ZOOM_MIN: min,
    PREVIEW_ZOOM_MAX: max,
    PREVIEW_ZOOM_STEP: step,
    previewZoom,
    zoomPercentage,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    dragRef,
    isDragging,
    startDragging,
    stopDragging
  };
}
