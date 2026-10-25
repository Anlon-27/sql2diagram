import { onBeforeUnmount, ref } from 'vue';

export function useDragPan() {
  const dragRef = ref(null);
  const isDragging = ref(false);

  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let startScrollTop = 0;
  let pendingDx = 0;
  let pendingDy = 0;
  let animationFrameId = 0;

  function applyPendingScroll() {
    animationFrameId = 0;
    if (!isDragging.value || !dragRef.value) return;

    dragRef.value.scrollLeft = startScrollLeft - pendingDx;
    dragRef.value.scrollTop = startScrollTop - pendingDy;
  }

  function stopDragging() {
    isDragging.value = false;
    pendingDx = 0;
    pendingDy = 0;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
  }

  function handleMouseMove(event) {
    if (!isDragging.value || !dragRef.value) return;

    pendingDx = event.clientX - startX;
    pendingDy = event.clientY - startY;

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(applyPendingScroll);
    }
  }

  function handleMouseUp() {
    stopDragging();
  }

  function startDragging(event) {
    if (!dragRef.value) return;
    if (event.button !== 0) return;

    startX = event.clientX;
    startY = event.clientY;
    startScrollLeft = dragRef.value.scrollLeft;
    startScrollTop = dragRef.value.scrollTop;
    isDragging.value = true;

    event.preventDefault();
  }

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  onBeforeUnmount(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });

  return {
    dragRef,
    isDragging,
    startDragging,
    stopDragging
  };
}
