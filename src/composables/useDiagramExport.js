import { ref } from 'vue';
import { exportSvgMarkupToPngBlob, downloadBlob, buildCroppedSvgMarkup } from '../utils/exportImage.js';

export function useDiagramExport(options = {}) {
  const {
    svgRef,
    cropSelector = '',
    padding = 18,
    defaultFileName = 'diagram'
  } = options;

  const isExporting = ref(false);
  const exportError = ref(null);

  function buildExportMarkup(customSelector) {
    const el = typeof svgRef === 'function' ? svgRef() : svgRef?.value;
    if (!el) return null;
    const selector = customSelector || cropSelector;
    if (selector) {
      return buildCroppedSvgMarkup(el, selector, padding);
    }
    return el.outerHTML;
  }

  async function exportPng(fileName = defaultFileName, customSelector = '') {
    const markup = buildExportMarkup(customSelector);
    if (!markup) return null;

    isExporting.value = true;
    exportError.value = null;

    try {
      const fullXml = markup.startsWith('<?xml') ? markup : `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
      const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
      const blob = await exportSvgMarkupToPngBlob(fullXml, scale);
      
      const targetName = typeof fileName === 'function' ? fileName() : fileName;
      downloadBlob(blob, targetName.endsWith('.png') ? targetName : `${targetName}.png`);
      return blob;
    } catch (err) {
      console.error('Export PNG failed:', err);
      exportError.value = err;
      throw err;
    } finally {
      isExporting.value = false;
    }
  }

  return {
    isExporting,
    exportError,
    buildExportMarkup,
    exportPng
  };
}
