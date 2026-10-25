import { ref } from 'vue';
import { generateLocalDiagram, calculateLocalDiagramLayout } from '../utils/localDiagramEngine.js';
import { useServerLayoutScheduler } from './useServerLayoutScheduler.js';
import { requestGeneratePermission, commitGenerateSuccess, openLicenseDialog, shouldWarnRemaining } from '../utils/generateAccess.js';

export function useDiagramRunner(type, options = {}) {
  const {
    onSuccess,
    onError
  } = options;

  const diagramData = ref(null);
  const serverLayout = ref(null);
  const statusMessage = ref('');
  const statusType = ref('success');
  const isGenerating = ref(false);

  const { scheduleLayout } = useServerLayoutScheduler({
    runLayout: (diagram, nextConfig, opt) => calculateLocalDiagramLayout(type, diagram, nextConfig, opt),
    applyLayout: (nextLayout) => {
      serverLayout.value = nextLayout;
    },
    clearLayout: () => {
      serverLayout.value = null;
    },
    onError: (error) => {
      console.error(`Load ${type} layout failed`, error);
      if (onError) onError(error);
    }
  });

  async function runGenerate(payload, successMsgPrefix = '已生成') {
    isGenerating.value = true;
    statusMessage.value = '';

    try {
      const decision = await requestGeneratePermission();
      if (!decision.allowed) {
        openLicenseDialog();
        isGenerating.value = false;
        return { allowed: false };
      }

      const result = await generateLocalDiagram(type, payload);
      await commitGenerateSuccess();

      diagramData.value = result.data;
      statusType.value = 'success';
      
      const countText = result.data?.layers?.length 
        ? ` ${result.data.layers.length} 层` 
        : (result.data?.nodes?.length ? ` ${result.data.nodes.length} 个节点` : '');

      statusMessage.value = shouldWarnRemaining(decision.access)
        ? `${successMsgPrefix}${countText}，免费次数即将用完`
        : `${successMsgPrefix}${countText}`;

      if (onSuccess) onSuccess(result.data);
      return { allowed: true, data: result.data };
    } catch (error) {
      diagramData.value = null;
      statusType.value = 'error';
      statusMessage.value = error.message || '生成失败';
      if (onError) onError(error);
      return { allowed: false, error };
    } finally {
      isGenerating.value = false;
    }
  }

  function clearDiagram() {
    diagramData.value = null;
    serverLayout.value = null;
    statusMessage.value = '';
  }

  return {
    diagramData,
    layout: serverLayout,
    statusMessage,
    statusType,
    isGenerating,
    scheduleLayout,
    runGenerate,
    clearDiagram
  };
}
