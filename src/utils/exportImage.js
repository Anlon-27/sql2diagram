function getSvgRoot(svgMarkup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const svg = doc.documentElement;

  if (!svg || svg.nodeName.toLowerCase() !== 'svg') {
    throw new Error('SVG 内容无效');
  }

  return svg;
}

function parseNumericSize(value) {
  if (!value) return null;
  const match = String(value).trim().match(/^([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

function getSvgDimensions(svgMarkup) {
  const svg = getSvgRoot(svgMarkup);
  const width = parseNumericSize(svg.getAttribute('width'));
  const height = parseNumericSize(svg.getAttribute('height'));

  if (width && height) {
    return { width, height };
  }

  const viewBox = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  if (viewBox.length === 4 && Number.isFinite(viewBox[2]) && Number.isFinite(viewBox[3])) {
    return { width: viewBox[2], height: viewBox[3] };
  }

  throw new Error('无法识别 SVG 尺寸');
}

function createObjectUrlFromSvg(svgMarkup) {
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('SVG 图片加载失败'));
    image.src = url;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error('PNG 生成失败'));
    }, 'image/png');
  });
}

function cloneSvgWithNamespaces(svgElement) {
  const clone = svgElement.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  return clone;
}

function getSafeBBox(targetElement) {
  if (!targetElement || typeof targetElement.getBBox !== 'function') return null;
  try {
    const box = targetElement.getBBox();
    if (!Number.isFinite(box.x) || !Number.isFinite(box.y) || !Number.isFinite(box.width) || !Number.isFinite(box.height)) {
      return null;
    }
    return box;
  } catch {
    return null;
  }
}

function getMergedBBox(elements) {
  const boxes = (elements || [])
    .map((element) => getSafeBBox(element))
    .filter(Boolean);

  if (boxes.length === 0) return null;

  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY)
  };
}

export function buildCroppedSvgMarkup(svgElement, targetSelector, padding = 24) {
  if (!svgElement) return null;

  const clone = cloneSvgWithNamespaces(svgElement);
  const matchedNodes = targetSelector ? Array.from(svgElement.querySelectorAll(targetSelector)) : [svgElement];
  const box = getMergedBBox(matchedNodes);
  if (!box) {
    return new XMLSerializer().serializeToString(clone);
  }

  const safePadding = Math.max(0, Number(padding) || 0);
  const x = box.x - safePadding;
  const y = box.y - safePadding;
  const width = Math.max(1, box.width + safePadding * 2);
  const height = Math.max(1, box.height + safePadding * 2);

  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);

  return new XMLSerializer().serializeToString(clone);
}

export async function exportSvgMarkupToPngBlob(svgMarkup, scale = 2) {
  const { width, height } = getSvgDimensions(svgMarkup);
  const requestedScale = Math.max(1, Number(scale) || 2);
  const preferredScale = Math.max(3, requestedScale);
  const maxOutputPixels = 40_000_000;
  const maxScaleByPixels = Math.sqrt(maxOutputPixels / Math.max(1, width * height));
  const safeScale = Math.max(1, Math.min(6, preferredScale, maxScaleByPixels));
  const objectUrl = createObjectUrlFromSvg(svgMarkup);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const image = await loadImageFromUrl(objectUrl);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * safeScale));
    canvas.height = Math.max(1, Math.round(height * safeScale));

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 不可用');
    }

    context.setTransform(safeScale, 0, 0, safeScale, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
