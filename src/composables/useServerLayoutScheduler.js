import { onBeforeUnmount } from 'vue';

export function useServerLayoutScheduler({ runLayout, applyLayout, clearLayout, onError }) {
  let layoutTimer = null;
  let layoutRequestSeed = 0;
  let activeAbortController = null;

  function clearLayoutTimer() {
    if (layoutTimer) {
      clearTimeout(layoutTimer);
      layoutTimer = null;
    }
  }

  function cancelActiveRequest() {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
  }

  async function executeLayout(diagram, config) {
    const requestId = layoutRequestSeed += 1;
    cancelActiveRequest();
    activeAbortController = new AbortController();

    try {
      const nextLayout = await runLayout(diagram, config, {
        signal: activeAbortController.signal
      });
      if (requestId !== layoutRequestSeed) return;
      activeAbortController = null;
      applyLayout(nextLayout);
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }
      if (requestId !== layoutRequestSeed) return;
      activeAbortController = null;
      clearLayout();
      onError?.(error);
    }
  }

  function scheduleLayout(diagram, config, delay = 70) {
    clearLayoutTimer();

    if (!diagram) {
      layoutRequestSeed += 1;
      cancelActiveRequest();
      clearLayout();
      return;
    }

    layoutTimer = setTimeout(() => {
      executeLayout(diagram, config);
    }, delay);
  }

  onBeforeUnmount(() => {
    clearLayoutTimer();
    cancelActiveRequest();
  });

  return {
    scheduleLayout
  };
}
