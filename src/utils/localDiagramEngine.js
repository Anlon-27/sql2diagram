function getFontFamily(config = {}) {
  return config.CN_FONT_FAMILY || 'Microsoft YaHei, SimHei, sans-serif';
}

function getFontSize(config = {}) {
  return Number(config.FONT_SIZE || 14);
}

function getLineWidth(config = {}) {
  return Number(config.LINE_WIDTH || config.STROKE_WIDTH || 2);
}

function estimateTextWidth(text, fontSize = 14) {
  const value = String(text || '');
  let width = 0;
  for (const char of value) {
    width += /[ -~]/.test(char) ? fontSize * 0.6 : fontSize;
  }
  return Math.max(fontSize * 2, width);
}

function wrapText(text, maxWidth, fontSize = 14) {
  const value = String(text || '').trim();
  if (!value) return [''];
  const lines = [];
  let current = '';
  for (const char of value) {
    const next = current + char;
    if (estimateTextWidth(next, fontSize) > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function normalizeText(value) {
  return String(value || '').trim();
}

function makeId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

function mid(a, b) {
  return (a + b) / 2;
}

function rectsIntersect(a, b) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createEdgeLabelBox(text, centerX, centerY, fontSize = 12) {
  const rawWidth = [...String(text || '')].reduce((sum, char) => (
    sum + (/[ -~]/.test(char) ? fontSize * 0.58 : fontSize * 0.88)
  ), 0);
  const width = Math.max(18, rawWidth + 6);
  const height = Math.max(fontSize + 4, 16);
  return {
    text,
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    textX: centerX,
    textY: centerY
  };
}

function createRectBorderRects(x, y, width, height, strokeWidth) {
  return [
    { x, y, width, height: strokeWidth },
    { x, y: y + height - strokeWidth, width, height: strokeWidth },
    { x, y, width: strokeWidth, height },
    { x: x + width - strokeWidth, y, width: strokeWidth, height }
  ];
}

function resolveFlowchartNodeType(typeText) {
  const value = normalizeText(typeText);
  if (value === '开始' || value === 'start') return 'start';
  if (value === '结束' || value === 'end') return 'end';
  if (value === '判断' || value === 'decision') return 'decision';
  if (value === '输入输出' || value === 'io') return 'io';
  return 'process';
}

function parseArchitectureSource(input) {
  const lines = String(input || '').split(/\r?\n/);
  let systemName = '';
  let currentLayer = '';
  const topNodes = [];
  const secondNodes = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('system:')) {
      systemName = normalizeText(line.slice(7));
      continue;
    }
    if (line.startsWith('layer:')) {
      currentLayer = normalizeText(line.slice(6));
      continue;
    }
    if (line.startsWith('-')) {
      const body = normalizeText(line.slice(1));
      if (currentLayer.includes('第一层')) {
        const [namePart, targetPart] = body.split('->').map((item) => normalizeText(item));
        const targetNames = (targetPart || '').split(/[,，]/).map(normalizeText).filter(Boolean);
        if (namePart) {
          topNodes.push({ id: makeId('top', topNodes.length), name: namePart, targetNames });
        }
      } else if (currentLayer.includes('第二层') && body) {
        secondNodes.push({ id: makeId('bottom', secondNodes.length), name: body });
      }
    }
  }
  return {
    systemName,
    layers: [
      { type: 'horizontal', nodes: topNodes },
      { type: 'vertical', nodes: secondNodes }
    ]
  };
}

function buildArchitectureFromPayload(payload) {
  const topNodes = (payload.topNodeRows || [])
    .map((row, index) => ({ id: makeId('top', index), name: normalizeText(row.name), targetNames: [] }))
    .filter((row) => row.name);
  const secondNodes = (payload.bottomNodeRows || [])
    .map((row, index) => ({
      id: makeId('bottom', index),
      name: normalizeText(row.name),
      parentName: normalizeText(row.parentName)
    }))
    .filter((row) => row.name);
  topNodes.forEach((topNode) => {
    topNode.targetNames = secondNodes.filter((item) => item.parentName === topNode.name).map((item) => item.name);
  });
  return {
    systemName: normalizeText(payload.systemName),
    layers: [
      { type: 'horizontal', nodes: topNodes },
      { type: 'vertical', nodes: secondNodes.map(({ parentName, ...item }) => item) }
    ]
  };
}

function layoutArchitecture(data, config = {}) {
  const strokeWidth = getLineWidth(config);
  const fontSize = getFontSize(config);
  const fontWeight = Number(config.FONT_WEIGHT || 500);
  const fontFamily = getFontFamily(config);
  const rootWidth = Math.max(Number(config.HORIZONTAL_WIDTH || 96) + 20, estimateTextWidth(data.systemName, fontSize) + 36);
  const rootHeight = Number(config.HORIZONTAL_HEIGHT || 40);
  const topWidth = Number(config.HORIZONTAL_WIDTH || 96);
  const topHeight = Number(config.HORIZONTAL_HEIGHT || 40);
  const verticalWidth = Number(config.VERTICAL_WIDTH || 60);
  const verticalHeight = Number(config.VERTICAL_HEIGHT || 130);
  const siblingGap = Number(config.SIBLING_GAP || 30);
  const layerGap = Number(config.LAYER_GAP || 150);
  const topNodes = data.layers?.[0]?.nodes || [];
  const bottomNodes = data.layers?.[1]?.nodes || [];
  const parentNameByBottomName = new Map();
  topNodes.forEach((topNode) => {
    (topNode.targetNames || []).forEach((targetName) => {
      if (!parentNameByBottomName.has(targetName)) {
        parentNameByBottomName.set(targetName, topNode.name);
      }
    });
  });
  const groupedBottomNodes = topNodes.map((topNode) => ({
    topNode,
    nodes: bottomNodes.filter((bottomNode) => parentNameByBottomName.get(bottomNode.name) === topNode.name)
  }));
  const ungroupedBottomNodes = bottomNodes.filter((bottomNode) => !parentNameByBottomName.has(bottomNode.name));
  if (ungroupedBottomNodes.length) {
    groupedBottomNodes.push({
      topNode: null,
      nodes: ungroupedBottomNodes
    });
  }
  const groupGap = Math.max(siblingGap * 2, 80);
  const bottomGroupWidths = groupedBottomNodes
    .filter((group) => group.nodes.length)
    .map((group) => Math.max(
      group.topNode ? topWidth : 0,
      group.nodes.length * verticalWidth + Math.max(group.nodes.length - 1, 0) * siblingGap
    ));
  const bottomRowWidth = bottomGroupWidths.length
    ? bottomGroupWidths.reduce((sum, groupWidth) => sum + groupWidth, 0) + Math.max(bottomGroupWidths.length - 1, 0) * groupGap
    : 0;
  const topRowWidth = topNodes.length ? (topNodes.length * topWidth) + ((topNodes.length - 1) * Math.max(siblingGap, groupGap)) : rootWidth;
  const width = Math.max(640, topRowWidth + 120, bottomRowWidth + 120);
  const centerX = width / 2;
  const rootY = 40;
  const topY = rootY + rootHeight + 84;
  const bottomY = topY + topHeight + layerGap;
  const rootNode = data.systemName ? {
    name: data.systemName,
    x: centerX - rootWidth / 2,
    y: rootY,
    width: rootWidth,
    height: rootHeight,
    centerX,
    centerY: rootY + rootHeight / 2,
    borderRects: createRectBorderRects(centerX - rootWidth / 2, rootY, rootWidth, rootHeight, strokeWidth)
  } : null;
  const visibleBottomGroups = groupedBottomNodes.filter((group) => group.nodes.length);
  const bottomStartX = centerX - bottomRowWidth / 2;
  let nextBottomGroupX = bottomStartX;
  const bottomGroupCenters = new Map();
  const bottomNodePositions = new Map();
  visibleBottomGroups.forEach((group, groupIndex) => {
    const groupWidth = bottomGroupWidths[groupIndex];
    const groupCenterX = nextBottomGroupX + groupWidth / 2;
    if (group.topNode) {
      bottomGroupCenters.set(group.topNode.name, groupCenterX);
    }
    const groupNodesWidth = group.nodes.length * verticalWidth + Math.max(group.nodes.length - 1, 0) * siblingGap;
    const groupNodeStartX = groupCenterX - groupNodesWidth / 2;
    group.nodes.forEach((node, nodeIndex) => {
      bottomNodePositions.set(node.name, groupNodeStartX + nodeIndex * (verticalWidth + siblingGap));
    });
    nextBottomGroupX += groupWidth + groupGap;
  });
  const topGap = topNodes.length > 1 ? Math.max(siblingGap, groupGap) : siblingGap;
  const fallbackTopStartX = centerX - topRowWidth / 2;
  const topMap = new Map();
  const topLayoutNodes = topNodes.map((node, index) => {
    const groupCenterX = bottomGroupCenters.get(node.name);
    const x = typeof groupCenterX === 'number'
      ? groupCenterX - topWidth / 2
      : fallbackTopStartX + index * (topWidth + topGap);
    const layoutNode = {
      ...node,
      x,
      y: topY,
      width: topWidth,
      height: topHeight,
      centerX: x + topWidth / 2,
      centerY: topY + topHeight / 2,
      borderRects: createRectBorderRects(x, topY, topWidth, topHeight, strokeWidth)
    };
    topMap.set(node.name, layoutNode);
    return layoutNode;
  });
  const bottomLayoutNodes = bottomNodes.map((node, index) => {
    const fallbackX = bottomStartX + index * (verticalWidth + siblingGap);
    const x = bottomNodePositions.get(node.name) ?? fallbackX;
    return {
      ...node,
      x,
      y: bottomY,
      width: verticalWidth,
      height: verticalHeight,
      centerX: x + verticalWidth / 2,
      centerY: bottomY + verticalHeight / 2,
      verticalChars: [...node.name],
      charStep: fontSize + 6,
      textStartY: bottomY + Math.max(24, (verticalHeight - ((Math.max(node.name.length, 1) - 1) * (fontSize + 6))) / 2),
      borderRects: createRectBorderRects(x, bottomY, verticalWidth, verticalHeight, strokeWidth)
    };
  });
  const connectorRects = [];
  const topStubHeight = 28;
  if (rootNode && topLayoutNodes.length > 0) {
    const barLevel = topY - topStubHeight;
    const leftEdge = Math.min(centerX, ...topLayoutNodes.map((n) => n.centerX));
    const rightEdge = Math.max(centerX, ...topLayoutNodes.map((n) => n.centerX));
    connectorRects.push({
      x: centerX - strokeWidth / 2,
      y: rootY + rootHeight,
      width: strokeWidth,
      height: Math.max(0, barLevel - (rootY + rootHeight))
    });
    connectorRects.push({
      x: leftEdge - strokeWidth / 2,
      y: barLevel - strokeWidth / 2,
      width: Math.max(strokeWidth, rightEdge - leftEdge + strokeWidth),
      height: strokeWidth
    });
  } else if (rootNode) {
    connectorRects.push({
      x: centerX - strokeWidth / 2,
      y: rootY + rootHeight,
      width: strokeWidth,
      height: topY - (rootY + rootHeight)
    });
  }
  topLayoutNodes.forEach((node) => {
    connectorRects.push({
      x: node.centerX - strokeWidth / 2,
      y: topY - topStubHeight,
      width: strokeWidth,
      height: topStubHeight
    });
  });
  topLayoutNodes.forEach((parent) => {
    const childNodes = bottomLayoutNodes.filter((node) => parentNameByBottomName.get(node.name) === parent.name);
    if (!childNodes.length) return;
    const fromY = topY + topHeight;
    const toY = bottomY;
    const busY = fromY + 24;
    connectorRects.push({
      x: parent.centerX - strokeWidth / 2,
      y: fromY,
      width: strokeWidth,
      height: Math.max(0, busY - fromY)
    });
    if (childNodes.length > 1) {
      const leftEdge = Math.min(...childNodes.map((node) => node.centerX));
      const rightEdge = Math.max(...childNodes.map((node) => node.centerX));
      connectorRects.push({
        x: leftEdge - strokeWidth / 2,
        y: busY - strokeWidth / 2,
        width: Math.max(strokeWidth, rightEdge - leftEdge + strokeWidth),
        height: strokeWidth
      });
    }
    childNodes.forEach((node) => {
      connectorRects.push({
        x: node.centerX - strokeWidth / 2,
        y: busY,
        width: strokeWidth,
        height: Math.max(0, toY - busY)
      });
    });
  });
  const height = Math.max(bottomY + verticalHeight + 60, topY + topHeight + 80);
  return {
    width,
    height,
    fontSize,
    fontWeight,
    fontFamily,
    rootNode,
    connectorRects,
    layers: [
      { type: 'horizontal', nodes: topLayoutNodes },
      { type: 'vertical', nodes: bottomLayoutNodes }
    ]
  };
}

function parseFlowchartSource(input) {
  const lines = String(input || '').split(/\r?\n/);
  const nodes = [];
  const nodeMap = new Map();
  const links = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('node:')) {
      const [typeText, labelText] = line.slice(5).split('|').map(normalizeText);
      const label = labelText || typeText;
      const node = { id: makeId('node', nodes.length), type: resolveFlowchartNodeType(typeText), label };
      nodes.push(node);
      nodeMap.set(label, node.id);
    } else if (line.startsWith('link:')) {
      const parts = line.slice(5).split('|').map(normalizeText);
      const pair = parts[0] || '';
      const label = parts[1] || '';
      const [sourceLabel, targetLabel] = pair.split('->').map(normalizeText);
      if (sourceLabel && targetLabel) {
        links.push({
          id: makeId('link', links.length),
          sourceId: nodeMap.get(sourceLabel) || sourceLabel,
          targetId: nodeMap.get(targetLabel) || targetLabel,
          label
        });
      }
    }
  }
  return { nodes, links };
}

function buildFlowchartFromPayload(payload) {
  const nodes = (payload.nodeRows || [])
    .map((row, index) => ({
      id: row.id || makeId('node', index),
      type: resolveFlowchartNodeType(row.type),
      label: normalizeText(row.label)
    }))
    .filter((node) => node.label);
  const nodeIdSet = new Set(nodes.map((node) => node.id));
  const links = (payload.linkRows || [])
    .filter((row) => row.sourceNodeId && row.targetNodeId && nodeIdSet.has(row.sourceNodeId) && nodeIdSet.has(row.targetNodeId))
    .map((row, index) => ({
      id: row.id || makeId('link', index),
      sourceId: row.sourceNodeId,
      targetId: row.targetNodeId,
      label: normalizeText(row.label)
    }));
  return { nodes, links };
}

function getFlowchartShape(node, config, fontSize) {
  const minWidth = Number(config.NODE_MIN_WIDTH || 124);
  const minHeight = Number(config.NODE_MIN_HEIGHT || 58);
  const decisionMinWidth = Number(config.DECISION_MIN_WIDTH || 164);
  const decisionMinHeight = Number(config.DECISION_MIN_HEIGHT || 96);
  const lines = wrapText(node.label, node.type === 'decision' ? decisionMinWidth - 48 : minWidth - 28, fontSize);
  const width = node.type === 'decision'
    ? Math.max(decisionMinWidth, Math.max(...lines.map((line) => estimateTextWidth(line, fontSize))) + 64)
    : Math.max(minWidth, Math.max(...lines.map((line) => estimateTextWidth(line, fontSize))) + 34);
  const height = node.type === 'decision'
    ? Math.max(decisionMinHeight, 58 + lines.length * (fontSize + 4))
    : Math.max(minHeight, 32 + lines.length * (fontSize + 6));
  return { lines, width, height };
}

function layoutFlowchart(data, config = {}) {
  const fontSize = getFontSize(config);
  const fontWeight = Number(config.FONT_WEIGHT || 500);
  const fontFamily = getFontFamily(config);
  const lineWidth = getLineWidth(config);
  const arrowWidth = Number(config.ARROW_WIDTH || 7);
  const layerGap = Number(config.LAYER_GAP || 120);
  const siblingGap = Number(config.SIBLING_GAP || 44);
  const startY = 56;
  const branchLaneOffset = Math.max(170, Number(config.DECISION_MIN_WIDTH || 164) + siblingGap);
  const sourceDataMap = new Map((data.nodes || []).map((node, index) => [node.id, { node, index }]));
  const outgoingBySource = new Map();
  (data.links || []).forEach((link) => {
    if (!outgoingBySource.has(link.sourceId)) outgoingBySource.set(link.sourceId, []);
    outgoingBySource.get(link.sourceId).push(link);
  });

  function resolveBranchDirection(edge, fallbackIndex) {
    const label = normalizeText(edge.label).toLowerCase();
    if (/^(是|通过|成功|同意|正确|true|yes|y)(?:$|[\s,，、:：])/.test(label)) return 1;
    if (/^(否|不通过|失败|拒绝|错误|false|no|n)(?:$|[\s,，、:：])/.test(label)) return -1;
    return fallbackIndex % 2 === 0 ? -1 : 1;
  }

  const branchEdgeDirections = new Map();
  outgoingBySource.forEach((links, sourceId) => {
    const sourceInfo = sourceDataMap.get(sourceId);
    if (!sourceInfo || sourceInfo.node.type !== 'decision' || links.length < 2) return;
    links.forEach((link, linkIndex) => {
      const direction = resolveBranchDirection(link, linkIndex);
      const targetInfo = sourceDataMap.get(link.targetId);
      if (targetInfo?.index === sourceInfo.index + 1) return;
      branchEdgeDirections.set(link.id || `${link.sourceId}->${link.targetId}-${linkIndex}`, direction);
    });
  });

  const maxBranchOffset = branchEdgeDirections.size ? branchLaneOffset : 0;
  const width = Math.max(760, 760 + maxBranchOffset * 2);
  const centerXBase = width / 2;
  let currentY = startY;
  const nodeShapes = data.nodes.map((node) => getFlowchartShape(node, config, fontSize));
  const nodes = data.nodes.map((node, index) => {
    const shape = nodeShapes[index];
    const centerX = centerXBase;
    const x = centerX - shape.width / 2;
    const y = currentY;
    const centerY = y + shape.height / 2;
    const textBlockHeight = (shape.lines.length - 1) * (fontSize + 6);
    const entry = {
      ...node,
      ...shape,
      x,
      y,
      centerX,
      centerY,
      textStartY: centerY - textBlockHeight / 2,
      lineStep: fontSize + 6
    };
    if (node.type === 'decision') {
      entry.points = `${centerX},${y} ${x + shape.width},${centerY} ${centerX},${y + shape.height} ${x},${centerY}`;
    }
    if (node.type === 'io') {
      const offset = Math.min(28, shape.width * 0.14);
      entry.points = `${x + offset},${y} ${x + shape.width},${y} ${x + shape.width - offset},${y + shape.height} ${x},${y + shape.height}`;
    }
    currentY += shape.height + layerGap;
    return entry;
  });
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const nodeIndexMap = new Map(nodes.map((node, index) => [node.id, index]));
  const linkPairSet = new Set((data.links || []).map((link) => `${link.sourceId}->${link.targetId}`));
  function getIncomingMainArrowMidpoint(target) {
    const targetIndex = nodeIndexMap.get(target.id);
    if (!targetIndex || targetIndex < 1) return null;
    const previous = nodes[targetIndex - 1];
    if (!previous) return null;
    if (!linkPairSet.has(`${previous.id}->${target.id}`)) return null;
    return {
      x: target.centerX,
      y: mid(previous.y + previous.height, target.y)
    };
  }
  const edges = data.links.map((edge, index) => {
    const source = nodeMap.get(edge.sourceId);
    const target = nodeMap.get(edge.targetId);
    if (!source || !target) return null;
    let path = '';
    let labelPoint = { x: mid(source.centerX, target.centerX), y: mid(source.centerY, target.centerY) };
    const branchDirection = branchEdgeDirections.get(edge.id || `${edge.sourceId}->${edge.targetId}-${index}`);
    if (source.id === target.id) {
      const loopWidth = 70;
      const loopHeight = 40;
      const startX = source.x + source.width;
      const startY2 = source.centerY - 8;
      path = `M ${startX} ${startY2} h ${loopWidth} v ${loopHeight} h -${loopWidth}`;
      labelPoint = { x: startX + loopWidth / 2, y: startY2 + loopHeight / 2 - 8 };
    } else if (source.type === 'decision' && (source.centerX !== target.centerX || branchDirection)) {
      const horizontalDirection = branchDirection || (target.centerX > source.centerX ? 1 : -1);
      const laneX = source.centerX + branchLaneOffset * horizontalDirection;
      const startX = source.centerX + horizontalDirection * (source.width / 2);
      const startY2 = source.centerY;
      const mergePoint = getIncomingMainArrowMidpoint(target);
      const targetIsBelow = target.centerY >= source.centerY;
      const endY = mergePoint?.y ?? (targetIsBelow ? target.y : target.y + target.height);
      const endX = mergePoint
        ? mergePoint.x + horizontalDirection * (lineWidth / 2)
        : target.centerX;
      path = `M ${startX} ${startY2} H ${laneX} V ${endY} H ${endX}`;
      labelPoint = { x: laneX - 18 * horizontalDirection, y: mid(startY2, endY) };
    } else {
      const startX = source.centerX;
      const startY2 = source.y + source.height;
      const endX = target.centerX;
      const endY = target.y;
      path = `M ${startX} ${startY2} L ${endX} ${endY}`;
      labelPoint = { x: mid(startX, endX), y: mid(startY2, endY) - 8 };
      if (source.type === 'decision' && source.centerX === target.centerX) {
        labelPoint = { x: source.centerX + 28, y: mid(startY2, endY) };
      }
    }
    return {
      id: edge.id || makeId('edge', index),
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      label: edge.label || '',
      path,
      labelPoint
    };
  }).filter(Boolean);
  const totalHeight = nodes.length ? Math.max(...nodes.map((node) => node.y + node.height)) + 64 : 320;
  return {
    width,
    height: totalHeight,
    displayScale: 1,
    displayWidth: width,
    displayHeight: totalHeight,
    lineWidth,
    arrowWidth,
    fontSize,
    fontWeight,
    fontFamily,
    edgeLabelFontSize: Math.max(12, fontSize - 1),
    edgeLabelStrokeWidth: 3,
    nodes,
    edges
  };
}

function parseUsecaseSource(input) {
  const lines = String(input || '').split(/\r?\n/);
  let system = '';
  const actors = [];
  const usecases = [];
  const relations = [];
  const actorMap = new Map();
  const usecaseMap = new Map();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('system:')) {
      system = normalizeText(line.slice(7));
    } else if (line.startsWith('actor:')) {
      const [label, side] = line.slice(6).split('|').map(normalizeText);
      const actor = { id: makeId('actor', actors.length), label, side: side || 'left' };
      actors.push(actor);
      actorMap.set(label, actor.id);
    } else if (line.startsWith('usecase:')) {
      const [label, level] = line.slice(8).split('|').map(normalizeText);
      const usecase = { id: makeId('usecase', usecases.length), label, level: Number(level || 1) };
      usecases.push(usecase);
      usecaseMap.set(label, usecase.id);
    } else if (line.startsWith('relation:')) {
      const [pair, relationType] = line.slice(9).split('|').map(normalizeText);
      const [sourceLabel, targetLabel] = pair.split('->').map(normalizeText);
      if (sourceLabel && targetLabel) {
        relations.push({
          id: makeId('relation', relations.length),
          sourceId: usecaseMap.get(sourceLabel) || actorMap.get(sourceLabel) || sourceLabel,
          targetId: usecaseMap.get(targetLabel) || actorMap.get(targetLabel) || targetLabel,
          sourceNodeType: usecaseMap.has(sourceLabel) ? 'usecase' : 'actor',
          targetNodeType: usecaseMap.has(targetLabel) ? 'usecase' : 'actor',
          type: relationType || 'include',
          label: relationType === 'include' ? '<<include>>' : ''
        });
      }
    }
  }
  const firstLevelUsecases = usecases.filter((item) => Number(item.level) === 1);
  const firstActor = actors[0];
  if (firstActor) {
    firstLevelUsecases.forEach((item) => {
      relations.unshift({
        id: `actor-auto-${item.id}`,
        sourceId: firstActor.id,
        targetId: item.id,
        sourceNodeType: 'actor',
        targetNodeType: 'usecase',
        type: 'association',
        label: ''
      });
    });
  }
  return { system, actors, usecases, relations };
}

function buildUsecaseFromPayload(payload) {
  const system = normalizeText(payload.system);
  const actors = (payload.actorRows || [])
    .map((row, index) => ({ id: row.id || makeId('actor', index), label: normalizeText(row.label), side: row.side || 'left' }))
    .filter((row) => row.label)
    .slice(0, 1);
  const usecases = (payload.usecaseRows || [])
    .map((row, index) => ({ id: row.id || makeId('usecase', index), label: normalizeText(row.label), level: Number(row.level || 1) }))
    .filter((row) => row.label);
  const relations = [];
  const firstActor = actors[0];
  if (firstActor) {
    usecases.filter((item) => item.level === 1).forEach((item) => {
      relations.push({
        id: `actor-auto-${item.id}`,
        sourceId: firstActor.id,
        targetId: item.id,
        sourceNodeType: 'actor',
        targetNodeType: 'usecase',
        type: 'association',
        label: ''
      });
    });
  }
  (payload.relationRows || []).forEach((row, index) => {
    if (!row.sourceNodeId || !row.targetNodeId) return;
    relations.push({
      id: row.id || makeId('relation', index),
      sourceId: row.sourceNodeId,
      targetId: row.targetNodeId,
      sourceNodeType: 'usecase',
      targetNodeType: 'usecase',
      type: row.type || 'include',
      label: '<<include>>'
    });
  });
  return { system, actors, usecases, relations };
}

function layoutUsecase(data, config = {}) {
  const fontSize = getFontSize(config);
  const fontWeight = Number(config.FONT_WEIGHT || 500);
  const fontFamily = getFontFamily(config);
  const lineWidth = getLineWidth(config);
  const titleWidth = Math.max(720, estimateTextWidth(data.system, fontSize) + 260);
  const actorWidth = Number(config.ACTOR_WIDTH || 66);
  const actorHeight = Number(config.ACTOR_HEIGHT || 94);
  const actorSystemGap = Number(config.ACTOR_SYSTEM_GAP || 54);
  const usecaseMinWidth = Number(config.USECASE_MIN_WIDTH || 148);
  const usecaseMinHeight = Number(config.USECASE_MIN_HEIGHT || 58);
  const includeGap = Math.max(Number(config.USECASE_COLUMN_GAP || 150), estimateTextWidth('<<include>>', fontSize) + 72);
  const rowGap = Number(config.USECASE_ROW_GAP || 24);
  const firstColumn = data.usecases.filter((item) => Number(item.level) === 1);
  const secondColumn = data.usecases.filter((item) => Number(item.level) === 2);
  const maxRows = Math.max(firstColumn.length, secondColumn.length, 1);
  const systemX = actorWidth + actorSystemGap + 74;
  const systemY = 54;
  const measureUsecaseNode = (item) => {
    const lines = wrapText(item.label, usecaseMinWidth - 30, fontSize);
    const width = Math.max(usecaseMinWidth, Math.max(...lines.map((line) => estimateTextWidth(line, fontSize))) + 34);
    const height = Math.max(usecaseMinHeight, 28 + lines.length * (fontSize + 5));
    return {
      ...item,
      lines,
      width,
      height
    };
  };
  const firstColumnMeasured = firstColumn.map(measureUsecaseNode);
  const secondColumnMeasured = secondColumn.map(measureUsecaseNode);
  const firstColumnMaxWidth = Math.max(usecaseMinWidth, ...firstColumnMeasured.map((item) => item.width));
  const secondColumnMaxWidth = Math.max(usecaseMinWidth, ...secondColumnMeasured.map((item) => item.width));
  const requiredSystemWidth = 72 + firstColumnMaxWidth + includeGap + secondColumnMaxWidth + 72;
  const systemWidth = Math.max(520, titleWidth - systemX - 70, requiredSystemWidth);
  const systemHeight = Math.max(280, maxRows * (usecaseMinHeight + rowGap) + 88);
  const actors = (data.actors || []).map((actor, index) => {
    const centerX = 74 + index * 100;
    const centerY = systemY + systemHeight / 2;
    const textLines = wrapText(actor.label, 90, fontSize);
    return {
      ...actor,
      figureCenterX: centerX,
      headCenterY: centerY - 32,
      headRadius: 12,
      neckY: centerY - 20,
      torsoBottomY: centerY + 16,
      armLeftX: centerX - 20,
      armRightX: centerX + 20,
      armY: centerY - 2,
      legLeftX: centerX - 18,
      legRightX: centerX + 18,
      legBottomY: centerY + 42,
      lines: textLines,
      lineStep: fontSize + 5,
      textStartY: centerY + 62
    };
  });
  const firstColumnX = systemX + 72;
  const secondColumnX = firstColumnX + firstColumnMaxWidth + includeGap;
  const buildUsecaseNodes = (list, columnX) => list.map((item, index) => {
    const y = systemY + 60 + index * (usecaseMinHeight + rowGap);
    const centerX = columnX + item.width / 2;
    const centerY = y + item.height / 2;
    return {
      ...item,
      x: columnX,
      y,
      centerX,
      centerY,
      lineStep: fontSize + 5,
      textStartY: centerY - ((item.lines.length - 1) * (fontSize + 5)) / 2
    };
  });
  const usecases = [
    ...buildUsecaseNodes(firstColumnMeasured, firstColumnX),
    ...buildUsecaseNodes(secondColumnMeasured, secondColumnX)
  ];
  const usecaseMap = new Map(usecases.map((item) => [item.id, item]));
  const actorMap = new Map(actors.map((item) => [item.id, item]));
  const relations = data.relations.map((item) => {
    const sourceUsecase = usecaseMap.get(item.sourceId);
    const targetUsecase = usecaseMap.get(item.targetId);
    const sourceActor = actorMap.get(item.sourceId);
    let path = '';
    let labelPoint = { x: 0, y: 0 };
    let markerEnd = null;
    let dashArray = null;
    let displayLabel = '';
    if (sourceActor && targetUsecase) {
      path = `M ${sourceActor.figureCenterX + 26} ${sourceActor.armY} L ${targetUsecase.x} ${targetUsecase.centerY}`;
      labelPoint = { x: mid(sourceActor.figureCenterX + 26, targetUsecase.x), y: mid(sourceActor.armY, targetUsecase.centerY) - 8 };
    } else if (sourceUsecase && targetUsecase) {
      path = `M ${sourceUsecase.x + sourceUsecase.width} ${sourceUsecase.centerY} L ${targetUsecase.x} ${targetUsecase.centerY}`;
      labelPoint = { x: mid(sourceUsecase.x + sourceUsecase.width, targetUsecase.x), y: sourceUsecase.centerY - 10 };
      markerEnd = 'url(#usecase-arrow-open)';
      dashArray = '7 5';
      displayLabel = '<<include>>';
    }
    return {
      id: item.id,
      path,
      markerEnd,
      dashArray,
      labelPoint,
      displayLabel
    };
  }).filter((item) => item.path);
  const width = Math.max(760, systemX + systemWidth + 60);
  const height = Math.max(420, systemY + systemHeight + 40);
  return {
    width,
    height,
    displayScale: 1,
    displayWidth: width,
    displayHeight: height,
    lineWidth,
    fontSize,
    fontWeight,
    fontFamily,
    includeArrowStrokeWidth: lineWidth,
    edgeLabelFontSize: Math.max(12, fontSize - 1),
    edgeLabelStrokeWidth: 3,
    systemLabelFontSize: Math.max(fontSize, 15),
    system: {
      x: systemX,
      y: systemY,
      width: systemWidth,
      height: systemHeight,
      showBoundary: config.SHOW_SYSTEM_BOUNDARY !== false,
      showLabel: config.SHOW_SYSTEM_LABEL !== false,
      labelX: systemX + systemWidth / 2,
      labelY: systemY + 24
    },
    actors,
    usecases,
    relations
  };
}

function parseSequenceSource(input) {
  const lines = String(input || '').split(/\r?\n/);
  let title = '';
  const participants = [];
  const participantMap = new Map();
  const items = [];
  const groups = [];
  const stack = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('title:')) {
      title = normalizeText(line.slice(6));
      continue;
    }
    const participantMatch = line.match(/^(actor|participant|control|database)\s+(.+)$/i);
    if (participantMatch) {
      const type = participantMatch[1].toLowerCase();
      const name = normalizeText(participantMatch[2]);
      const participant = { id: makeId('participant', participants.length), type, name };
      participants.push(participant);
      participantMap.set(name, participant.id);
      continue;
    }
    const noteMatch = line.match(/^note\s+(over|left of|right of)\s+(.+?)\s*:\s*(.+)$/i);
    if (noteMatch) {
      const position = noteMatch[1].toLowerCase();
      const targetNames = noteMatch[2].split(',').map(normalizeText).filter(Boolean);
      items.push({
        id: makeId('note', items.length),
        kind: 'note',
        position,
        targetIds: targetNames.map((name) => participantMap.get(name) || name),
        text: normalizeText(noteMatch[3]),
        groupDepth: stack.length
      });
      continue;
    }
    const blockMatch = line.match(/^(alt|opt|loop)\s*(.*)$/i);
    if (blockMatch) {
      const group = {
        id: makeId('group', groups.length),
        keyword: blockMatch[1].toLowerCase(),
        label: normalizeText(blockMatch[2]),
        startItemIndex: items.length,
        branches: []
      };
      groups.push(group);
      stack.push(group);
      continue;
    }
    const elseMatch = line.match(/^else\s*(.*)$/i);
    if (elseMatch) {
      const current = stack[stack.length - 1];
      if (current) {
        current.branches.push({
          atItemIndex: items.length,
          label: normalizeText(elseMatch[1]) || 'else'
        });
      }
      continue;
    }
    if (/^end$/i.test(line)) {
      const current = stack.pop();
      if (current) current.endItemIndex = items.length;
      continue;
    }
    const messageMatch = line.match(/^(.+?)\s*(-+>>?|-->>|-->|->>)\s*(.+?)\s*:\s*(.+)$/);
    if (messageMatch) {
      const sourceName = normalizeText(messageMatch[1]);
      const arrow = messageMatch[2];
      const targetName = normalizeText(messageMatch[3]);
      const label = normalizeText(messageMatch[4]);
      items.push({
        id: makeId('message', items.length),
        kind: 'message',
        sourceId: participantMap.get(sourceName) || sourceName,
        targetId: participantMap.get(targetName) || targetName,
        arrow,
        label,
        groupDepth: stack.length
      });
    }
  }
  return { title, participants, items, groups };
}

function layoutSequence(data, config = {}) {
  const fontSize = getFontSize(config);
  const fontWeight = Number(config.FONT_WEIGHT || 500);
  const fontFamily = getFontFamily(config);
  const lineWidth = getLineWidth(config);
  const titleFontSize = Number(config.TITLE_FONT_SIZE || 20);
  const titleFontWeight = Number(config.TITLE_FONT_WEIGHT || 700);
  const participantMinWidth = Number(config.PARTICIPANT_MIN_WIDTH || 120);
  const participantHeadHeight = Number(config.PARTICIPANT_HEAD_HEIGHT || 58);
  const participantGap = Number(config.PARTICIPANT_GAP || 76);
  const messageRowHeight = Number(config.MESSAGE_ROW_HEIGHT || 46);
  const rowGap = Number(config.ROW_GAP || 18);
  const selfLoopWidth = Number(config.SELF_LOOP_WIDTH || 64);
  const selfLoopHeight = Number(config.SELF_LOOP_HEIGHT || 36);
  const noteMaxWidth = Number(config.NOTE_MAX_WIDTH || 240);
  const activationWidth = 12;
  const groupEntryGap = 34;
  const groupBranchGap = 32;
  const messageLabelGap = 10;
  const groupTagHeight = 26;
  const groupTagInnerPadding = 14;
  const topY = 72;
  const participantY = topY + 24;
  const participants = data.participants.map((item) => {
    const nameLines = wrapText(item.name, participantMinWidth - 22, fontSize);
    const width = Math.max(participantMinWidth, Math.max(...nameLines.map((line) => estimateTextWidth(line, fontSize))) + 28);
    return { ...item, width, height: participantHeadHeight, nameLines };
  });
  const totalParticipantsWidth = participants.reduce((sum, item) => sum + item.width, 0) + Math.max(participants.length - 1, 0) * participantGap;
  const contentTranslateX = 60;
  const width = Math.max(760, totalParticipantsWidth + 120);
  let currentX = Math.max(40, (width - totalParticipantsWidth) / 2) - contentTranslateX;
  participants.forEach((item) => {
    item.x = currentX;
    item.y = participantY;
    item.centerX = currentX + item.width / 2;
    item.nameLineStep = fontSize + 4;
    const nameBlockHeight = (item.nameLines.length - 1) * item.nameLineStep;
    if (item.type === 'actor') {
      item.figureCenterX = item.centerX;
      item.headCenterY = participantY + 10;
      item.headRadius = 10;
      item.bodyTopY = participantY + 22;
      item.bodyBottomY = participantY + 54;
      item.armHalfWidth = 16;
      item.armY = participantY + 32;
      item.legSpread = 14;
      item.legBottomY = participantY + 74;
      item.nameTextStartY = item.legBottomY + 18;
      item.headerBottomY = item.nameTextStartY + nameBlockHeight + 10;
    } else {
      item.nameTextStartY = participantY + participantHeadHeight / 2 - ((item.nameLines.length - 1) * item.nameLineStep) / 2 + 4;
      item.headerBottomY = participantY + participantHeadHeight;
    }
    currentX += item.width + participantGap;
  });
  const messageStartY = Math.max(...participants.map((item) => item.headerBottomY)) + 36;
  const participantMap = new Map(participants.map((item) => [item.id, item]));
  const messages = [];
  const notes = [];
  const rawActivations = [];
  const activationStacks = new Map();
  const lastActivityYByParticipant = new Map();
  const itemCount = data.items.length;
  const rowOffsetSteps = new Array(itemCount + 1).fill(0);
  (data.groups || []).forEach((group) => {
    if (typeof group.startItemIndex === 'number') {
      rowOffsetSteps[group.startItemIndex] += groupEntryGap;
    }
    (group.branches || []).forEach((branch) => {
      if (typeof branch.atItemIndex === 'number') {
        rowOffsetSteps[branch.atItemIndex] += groupBranchGap;
      }
    });
  });
  const rowOffsets = new Array(itemCount + 1).fill(0);
  let accumulatedRowOffset = 0;
  for (let index = 0; index < rowOffsets.length; index += 1) {
    accumulatedRowOffset += rowOffsetSteps[index] || 0;
    rowOffsets[index] = accumulatedRowOffset;
  }
  let rowIndex = 0;
  data.items.forEach((item) => {
    const y = messageStartY + rowIndex * (messageRowHeight + rowGap) + rowOffsets[rowIndex];
    if (item.kind === 'message') {
      const source = participantMap.get(item.sourceId);
      const target = participantMap.get(item.targetId);
      if (!source || !target) return;
      const labelLines = wrapText(item.label, 180, fontSize);
      let path = '';
      let labelX = 0;
      const isDashed = item.arrow.includes('--');
      if (source.id === target.id) {
        const startX = source.centerX;
        path = `M ${startX} ${y} h ${selfLoopWidth} v ${selfLoopHeight} h -${selfLoopWidth}`;
        labelX = startX + selfLoopWidth / 2;
      } else {
        const fromX = source.centerX;
        const toX = target.centerX;
        path = `M ${fromX} ${y} L ${toX} ${y}`;
        labelX = mid(fromX, toX);
      }
      const markerEnd = item.arrow.includes('>>') ? 'url(#sequence-arrow-open)' : 'url(#sequence-arrow-solid)';
      messages.push({
        id: item.id,
        path,
        labelX,
        labelLines,
        labelLineStep: fontSize + 4,
        labelCenterY: y,
        markerEnd,
        isDashed,
        isReturn: isDashed,
        dashArray: isDashed ? '10 6' : null,
        fontStyle: 'normal',
        fontWeight,
        labelBoxWidth: Math.max(...labelLines.map((line) => estimateTextWidth(line, fontSize))) + 14,
        labelBoxHeight: Math.max(fontSize + 10, labelLines.length * (fontSize + 4) + 8)
      });
      lastActivityYByParticipant.set(source.id, y);
      lastActivityYByParticipant.set(target.id, y);
      if (!activationStacks.has(target.id)) activationStacks.set(target.id, []);
      if (!activationStacks.has(source.id)) activationStacks.set(source.id, []);
      if (!isDashed) {
        const targetStack = activationStacks.get(target.id);
        if (!targetStack.length) {
          const activation = {
            id: `activation-${item.id}`,
            participantId: target.id,
            centerX: target.centerX,
            x: target.centerX - activationWidth / 2,
            y: y + 2,
            width: activationWidth,
            height: Math.max(24, messageRowHeight - 8),
            startY: y + 2,
            endY: null,
            depth: 0
          };
          rawActivations.push(activation);
          targetStack.push(activation);
        }
      } else {
        const sourceStack = activationStacks.get(source.id);
        if (sourceStack?.length) {
          const current = sourceStack.pop();
          current.endY = Math.max(current.startY + 24, y + 6);
          current.height = current.endY - current.startY;
        }
      }
    } else if (item.kind === 'note') {
      const targets = item.targetIds.map((id) => participantMap.get(id)).filter(Boolean);
      if (!targets.length) return;
      const textLines = wrapText(item.text, noteMaxWidth - 24, fontSize);
      const noteWidth = Math.min(noteMaxWidth, Math.max(120, Math.max(...textLines.map((line) => estimateTextWidth(line, fontSize))) + 26));
      const noteHeight = Math.max(44, 24 + textLines.length * (fontSize + 4));
      const leftX = item.position.startsWith('left')
        ? targets[0].centerX - noteWidth - 28
        : item.position.startsWith('right')
          ? targets[0].centerX + 28
          : mid(targets[0].centerX, targets[targets.length - 1].centerX) - noteWidth / 2;
      const topNoteY = y - 18;
      notes.push({
        id: item.id,
        path: `M ${leftX} ${topNoteY} H ${leftX + noteWidth - 12} L ${leftX + noteWidth} ${topNoteY + 12} V ${topNoteY + noteHeight} H ${leftX} Z`,
        foldPath: `M ${leftX + noteWidth - 12} ${topNoteY} V ${topNoteY + 12} H ${leftX + noteWidth}`,
        textX: leftX + noteWidth / 2,
        textStartY: topNoteY + 24,
        lineStep: fontSize + 4,
        lines: textLines,
        x: leftX,
        y: topNoteY,
        width: noteWidth,
        height: noteHeight
      });
    }
    rowIndex += 1;
  });
  activationStacks.forEach((stack, participantId) => {
    const participant = participantMap.get(participantId);
    const lastY = lastActivityYByParticipant.get(participantId) ?? messageStartY;
    stack.forEach((activation) => {
      activation.endY = Math.max(
        activation.startY + 24,
        lastY + Math.max(28, messageRowHeight - 4)
      );
      activation.height = activation.endY - activation.startY;
      activation.x = participant.centerX - activationWidth / 2 + activation.depth * 8;
    });
  });
  const contentHeight = messageStartY + rowIndex * (messageRowHeight + rowGap) + rowOffsets[rowIndex] + 60;
  const footerY = contentHeight + 10;
  const footerHeight = participantHeadHeight;
  const lifelines = participants.map((item) => ({
    id: item.id,
    x: item.centerX,
    y1: item.headerBottomY,
    y2: footerY
  }));
  const groups = data.groups.map((group, index) => {
    const startY = messageStartY + group.startItemIndex * (messageRowHeight + rowGap) + rowOffsets[group.startItemIndex] - 20;
    const endIndex = typeof group.endItemIndex === 'number' ? group.endItemIndex : rowIndex;
    const endY = messageStartY + endIndex * (messageRowHeight + rowGap) + rowOffsets[endIndex] + 28;
    const groupHeight = Math.max(68, endY - startY);
    const x = participants.length ? participants[0].x - 36 : 40;
    const lastRightX = participants.length ? participants[participants.length - 1].x + participants[participants.length - 1].width : 300;
    const groupWidth = Math.max(260, lastRightX - x + 36);
    const groupKeywordFontSize = Math.max(12, fontSize - 1);
    const keywordWidth = estimateTextWidth(group.keyword, groupKeywordFontSize);
    const labelWidth = group.label ? estimateTextWidth(group.label, fontSize) : 0;
    const tagBodyWidth = Math.max(52, keywordWidth + (group.label ? labelWidth + 30 : 18));
    const tagTipX = x + tagBodyWidth + 8;
    const tagTop = startY - groupTagHeight;
    return {
      id: group.id || `group-${index}`,
      x,
      y: startY,
      width: groupWidth,
      height: groupHeight,
      tagWidth: tagTipX - x,
      keyword: group.keyword,
      label: group.label,
      keywordX: x + groupTagInnerPadding,
      keywordY: tagTop + groupTagHeight / 2,
      labelX: x + Math.max(48, keywordWidth + 28),
      labelY: tagTop + groupTagHeight / 2,
      tagPath: `M ${x} ${tagTop} H ${x + tagBodyWidth} L ${tagTipX} ${startY} H ${x} Z`,
      separators: (group.branches || []).map((branch) => {
        const separatorY = messageStartY + branch.atItemIndex * (messageRowHeight + rowGap) + rowOffsets[branch.atItemIndex] - 10;
        const separatorTagHeight = 26;
        const tagTop = separatorY - separatorTagHeight;
        const branchLabelWidth = estimateTextWidth(branch.label, fontSize);
        const separatorBodyWidth = Math.max(76, branchLabelWidth + 24);
        const separatorTipX = x + separatorBodyWidth + 8;
        return {
          y: separatorY,
          label: branch.label,
          tagPath: `M ${x} ${tagTop} H ${x + separatorBodyWidth} L ${separatorTipX} ${separatorY} H ${x} Z`,
          textX: x + 14,
          textY: tagTop + separatorTagHeight / 2,
          tagTop,
          tagHeight: separatorTagHeight,
          width: separatorTipX - x
        };
      })
    };
  });
  participants.forEach((item) => {
    item.footerX = item.x;
    item.footerY = footerY;
    item.footerWidth = item.width;
    item.footerHeight = footerHeight;
    item.footerCenterX = item.centerX;
    item.footerNameTextStartY = footerY + footerHeight / 2 - ((item.nameLines.length - 1) * item.nameLineStep) / 2 + 4;
  });
  const lifelineBlockers = participants.map((participant) => ({
    x: participant.centerX - 10,
    y: participant.headerBottomY,
    width: 20,
    height: footerY - participant.headerBottomY
  }));
  const blockerRects = [
    ...notes.map((note) => ({ x: note.x, y: note.y, width: note.width, height: note.height })),
    ...groups.flatMap((group) => (group.separators || []).map((separator) => ({
      x: group.x,
      y: separator.tagTop,
      width: separator.width,
      height: separator.tagHeight
    }))),
    ...groups.map((group) => ({ x: group.x, y: group.y - groupTagHeight, width: group.tagWidth, height: groupTagHeight })),
    ...rawActivations.map((activation) => ({ x: activation.x, y: activation.y, width: activation.width, height: activation.height })),
    ...lifelineBlockers
  ];
  messages.forEach((message) => {
    const pathPoints = [...message.path.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
    const lineY = pathPoints[1] || 0;
    const hasStraightLine = pathPoints.length >= 4 && message.path.includes('L');
    const fromX = hasStraightLine ? pathPoints[0] : null;
    const toX = hasStraightLine ? pathPoints[2] : null;
    const minLabelX = 24 + message.labelBoxWidth / 2;
    const maxLabelX = width - contentTranslateX - 24 - message.labelBoxWidth / 2;
    const candidateXs = [];
    if (fromX !== null && toX !== null) {
      const span = Math.abs(toX - fromX);
      const direction = Math.sign(toX - fromX) || 1;
      const isLongSpan = span >= 260;
      const baseCandidates = isLongSpan
        ? [0.35, 0.5, 0.65, 0.25, 0.75]
        : [0.5, 0.4, 0.6];
      if (isLongSpan) {
        const preferredX = message.isReturn
          ? fromX - direction * Math.min(120, span * 0.25)
          : fromX + direction * Math.min(120, span * 0.25);
        candidateXs.push(clamp(preferredX, minLabelX, maxLabelX));
      }
      baseCandidates.forEach((ratio) => {
        candidateXs.push(clamp(fromX + (toX - fromX) * ratio, minLabelX, maxLabelX));
      });
    } else {
      candidateXs.push(clamp(message.labelX, minLabelX, maxLabelX));
    }
    let topY = lineY - message.labelBoxHeight - messageLabelGap;
    let resolvedX = clamp(message.labelX, minLabelX, maxLabelX);
    let placed = false;
    for (const candidateX of candidateXs) {
      topY = lineY - message.labelBoxHeight - messageLabelGap;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const labelRect = {
          x: candidateX - message.labelBoxWidth / 2,
          y: topY,
          width: message.labelBoxWidth,
          height: message.labelBoxHeight
        };
        const conflict = blockerRects.some((rect) => rectsIntersect(labelRect, rect));
        if (!conflict) {
          resolvedX = candidateX;
          placed = true;
          break;
        }
        topY -= 12;
      }
      if (placed) break;
    }
    message.labelX = resolvedX;
    message.labelTopY = topY;
    message.labelCenterY = topY + message.labelBoxHeight / 2;
    message.labelStartY = topY + message.labelBoxHeight / 2 - ((message.labelLines.length - 1) * message.labelLineStep) / 2;
  });
  return {
    width,
    height: Math.max(360, footerY + footerHeight + 40),
    displayScale: 1,
    displayWidth: width,
    displayHeight: Math.max(360, footerY + footerHeight + 40),
    contentTranslateX,
    lineWidth,
    fontSize,
    fontWeight,
    fontFamily,
    textHaloWidth: 3,
    groupKeywordFontSize: Math.max(12, fontSize - 1),
    title: {
      centerX: width / 2,
      y: topY,
      fontSize: titleFontSize,
      fontWeight: titleFontWeight
    },
    participants,
    lifelines,
    messages,
    notes,
    activations: rawActivations,
    groups
  };
}

function parseClassdiagramSource(input) {
  const text = String(input || '');
  const lines = text.split(/\r?\n/);
  let title = '';
  const nodes = [];
  const relations = [];
  const nodeMap = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (line.startsWith('title:')) {
      title = normalizeText(line.slice(6));
      continue;
    }
    const classMatch = line.match(/^(class|abstract|interface)\s+(.+?)\s*\{$/i);
    if (classMatch) {
      const type = classMatch[1].toLowerCase() === 'abstract' ? 'abstract' : classMatch[1].toLowerCase() === 'interface' ? 'interface' : 'class';
      const name = normalizeText(classMatch[2]);
      const fields = [];
      const methods = [];
      let inMethods = false;
      index += 1;
      while (index < lines.length && lines[index].trim() !== '}') {
        const bodyLine = lines[index].trim();
        if (bodyLine === '--') {
          inMethods = true;
        } else if (bodyLine) {
          (inMethods ? methods : fields).push(bodyLine);
        }
        index += 1;
      }
      const node = { id: makeId('class', nodes.length), type, name, fields, methods };
      nodes.push(node);
      nodeMap.set(name, node.id);
      continue;
    }
    const relationMatch = line.match(/^(.+?)(?:\s+"([^"]*)")?\s*(--\|>|..\|>|o-->|\*-->|-->|\.\.>)\s*(?:"([^"]*)"\s*)?(.+)$/);
    if (relationMatch) {
      const sourceName = normalizeText(relationMatch[1]);
      const sourceCardinality = normalizeText(relationMatch[2]);
      const arrow = relationMatch[3];
      const targetCardinality = normalizeText(relationMatch[4]);
      const targetName = normalizeText(relationMatch[5]);
      const relationTypeMap = {
        '-->': 'association',
        '..>': 'dependency',
        'o-->': 'aggregation',
        '*-->': 'composition',
        '--|>': 'generalization',
        '..|>': 'realization'
      };
      relations.push({
        id: makeId('relation', relations.length),
        sourceId: nodeMap.get(sourceName) || sourceName,
        targetId: nodeMap.get(targetName) || targetName,
        relationType: relationTypeMap[arrow] || 'association',
        sourceCardinality,
        targetCardinality,
        label: ''
      });
    }
  }
  return { title, nodes, relations };
}

function buildClassdiagramFromPayload(payload) {
  const nodes = (payload.classRows || [])
    .map((row, index) => ({
      id: row.id || makeId('class', index),
      type: row.type || 'class',
      name: normalizeText(row.name),
      fields: String(row.fieldsText || '').split(/\r?\n/).map(normalizeText).filter(Boolean),
      methods: String(row.methodsText || '').split(/\r?\n/).map(normalizeText).filter(Boolean)
    }))
    .filter((row) => row.name);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const relations = (payload.relationRows || [])
    .filter((row) => row.sourceNodeId && row.targetNodeId && nodeIds.has(row.sourceNodeId) && nodeIds.has(row.targetNodeId))
    .map((row, index) => ({
      id: row.id || makeId('relation', index),
      sourceId: row.sourceNodeId,
      targetId: row.targetNodeId,
      relationType: row.relationType || 'association',
      label: normalizeText(row.label),
      sourceCardinality: normalizeText(row.sourceCardinality),
      targetCardinality: normalizeText(row.targetCardinality)
    }));
  return { title: normalizeText(payload.title), nodes, relations };
}

function buildClassdiagramSource(payload) {
  const built = buildClassdiagramFromPayload(payload);
  const relationArrowMap = {
    association: '-->',
    dependency: '..>',
    aggregation: 'o-->',
    composition: '*-->',
    generalization: '--|>',
    realization: '..|>'
  };
  const lines = [];
  if (built.title) lines.push(`title: ${built.title}`, '');
  built.nodes.forEach((node) => {
    lines.push(`${node.type} ${node.name} {`);
    node.fields.forEach((field) => lines.push(`  ${field}`));
    if (node.methods.length) {
      lines.push('  --');
      node.methods.forEach((method) => lines.push(`  ${method}`));
    }
    lines.push('}', '');
  });
  const nodeMap = new Map(built.nodes.map((node) => [node.id, node.name]));
  built.relations.forEach((relation) => {
    const source = nodeMap.get(relation.sourceId) || relation.sourceId;
    const target = nodeMap.get(relation.targetId) || relation.targetId;
    const sourceCard = relation.sourceCardinality ? ` "${relation.sourceCardinality}"` : '';
    const targetCard = relation.targetCardinality ? `"${relation.targetCardinality}" ` : '';
    lines.push(`${source}${sourceCard} ${relationArrowMap[relation.relationType] || '-->'} ${targetCard}${target}`.trim());
  });
  return lines.join('\n').trim();
}

function layoutClassdiagram(data, config = {}) {
  const fontSize = getFontSize(config);
  const fontWeight = Number(config.FONT_WEIGHT || 500);
  const fontFamily = getFontFamily(config);
  const lineWidth = getLineWidth(config);
  const classMinWidth = Number(config.CLASS_MIN_WIDTH || 190);
  const headerMinHeight = Number(config.HEADER_MIN_HEIGHT || 54);
  const sectionMinHeight = Number(config.SECTION_MIN_HEIGHT || 34);
  const columnGap = Number(config.COLUMN_GAP || 98);
  const rowGap = Number(config.ROW_GAP || 28);
  const edgeLabelFontSize = Math.max(12, fontSize - 1);
  const topMargin = 76;
  const leftMargin = 60;
  const baseNodes = data.nodes.map((node) => {
    const fieldLines = node.fields || [];
    const methodLines = node.methods || [];
    const stereotype = node.type === 'interface' ? '<<interface>>' : '';
    const contentWidth = Math.max(
      estimateTextWidth(node.name, fontSize),
      ...fieldLines.map((line) => estimateTextWidth(line, fontSize)),
      ...methodLines.map((line) => estimateTextWidth(line, fontSize))
    );
    const width = Math.max(classMinWidth, contentWidth + 34);
    const headerHeight = Math.max(headerMinHeight, stereotype ? 62 : 54);
    const fieldsHeight = Math.max(sectionMinHeight, 18 + Math.max(fieldLines.length, 1) * (fontSize + 4));
    const methodsHeight = Math.max(sectionMinHeight, 18 + Math.max(methodLines.length, 1) * (fontSize + 4));
    const height = headerHeight + fieldsHeight + methodsHeight;
    return {
      ...node,
      width,
      height,
      stereotype,
      nameFontStyle: node.type === 'abstract' ? 'italic' : 'normal',
      fieldLines,
      methodLines,
      headerHeight,
      fieldsHeight,
      methodsHeight,
      lineStep: fontSize + 4,
      relationDegree: 0
    };
  });
  const placementMap = new Map();
  const useRelationAwareLayout = baseNodes.length >= 6 && data.relations.length >= Math.max(4, baseNodes.length - 3);
  if (useRelationAwareLayout) {
    const degreeMap = new Map(baseNodes.map((node) => [node.id, 0]));
    const outgoingMap = new Map(baseNodes.map((node) => [node.id, []]));
    const incomingMap = new Map(baseNodes.map((node) => [node.id, []]));
    data.relations.forEach((relation) => {
      if (degreeMap.has(relation.sourceId)) degreeMap.set(relation.sourceId, degreeMap.get(relation.sourceId) + 1);
      if (degreeMap.has(relation.targetId)) degreeMap.set(relation.targetId, degreeMap.get(relation.targetId) + 1);
      if (outgoingMap.has(relation.sourceId)) outgoingMap.get(relation.sourceId).push(relation);
      if (incomingMap.has(relation.targetId)) incomingMap.get(relation.targetId).push(relation);
    });
    baseNodes.forEach((node) => {
      node.relationDegree = degreeMap.get(node.id) || 0;
    });
    const sortedByDegree = [...baseNodes].sort((a, b) => {
      if (b.relationDegree !== a.relationDegree) return b.relationDegree - a.relationDegree;
      return a.id.localeCompare(b.id);
    });
    const hub = sortedByDegree[0] || baseNodes[0];
    const occupied = new Set();
    const makeKey = (col, row) => `${col}:${row}`;
    const placeNode = (nodeId, col, preferredRow = 0, direction = 'down') => {
      if (placementMap.has(nodeId)) return placementMap.get(nodeId);
      let row = Math.max(0, preferredRow);
      if (direction === 'up') {
        while (row >= 0 && occupied.has(makeKey(col, row))) row -= 1;
        if (row < 0) {
          row = 0;
          while (occupied.has(makeKey(col, row))) row += 1;
        }
      } else {
        while (occupied.has(makeKey(col, row))) row += 1;
      }
      const placement = { col, row };
      placementMap.set(nodeId, placement);
      occupied.add(makeKey(col, row));
      return placement;
    };
    const findNextRow = (col, start = 0) => {
      let row = Math.max(0, start);
      while (occupied.has(makeKey(col, row))) row += 1;
      return row;
    };
    const isInheritanceGroupNode = (nodeId) => data.relations.some((relation) =>
      (relation.sourceId === nodeId || relation.targetId === nodeId) &&
      (relation.relationType === 'generalization' || relation.relationType === 'realization')
    );
    placeNode(hub.id, 1, 0);
    const hubIncoming = (incomingMap.get(hub.id) || []).filter((relation) => relation.relationType === 'association' || relation.relationType === 'dependency');
    hubIncoming.forEach((relation, index) => {
      placeNode(relation.sourceId, 0, index);
    });
    const hubOutgoingComposition = (outgoingMap.get(hub.id) || []).filter((relation) => relation.relationType === 'composition');
    hubOutgoingComposition.forEach((relation, index) => {
      placeNode(relation.targetId, 1, index + 1);
    });
    const hubOutgoingAggregation = (outgoingMap.get(hub.id) || []).filter((relation) => relation.relationType === 'aggregation');
    hubOutgoingAggregation.forEach((relation, index) => {
      placeNode(relation.targetId, 2, index);
    });
    const hubOutgoingAssociation = (outgoingMap.get(hub.id) || []).filter((relation) =>
      relation.relationType === 'association' || relation.relationType === 'dependency'
    );
    let rightDomainRow = 1;
    let rightInheritanceRow = 2;
    hubOutgoingAssociation.forEach((relation) => {
      if (placementMap.has(relation.targetId)) return;
      if (isInheritanceGroupNode(relation.targetId)) {
        placeNode(relation.targetId, 2, rightInheritanceRow);
        rightInheritanceRow += 2;
      } else {
        placeNode(relation.targetId, 2, rightDomainRow);
        rightDomainRow += 1;
      }
    });
    for (const node of baseNodes) {
      const placed = placementMap.get(node.id);
      if (!placed) continue;
      (outgoingMap.get(node.id) || []).forEach((relation) => {
        if (placementMap.has(relation.targetId)) return;
        if (relation.targetId === hub.id) return;
        if (relation.relationType === 'generalization') {
          placeNode(relation.targetId, placed.col, placed.row - 1, 'up');
          return;
        }
        if (relation.relationType === 'realization') {
          placeNode(relation.targetId, placed.col, placed.row + 1);
          return;
        }
        if (placed.col === 0) {
          placeNode(relation.targetId, 0, findNextRow(0, placed.row + 1));
          return;
        }
        if (relation.relationType === 'composition') {
          placeNode(relation.targetId, placed.col, findNextRow(placed.col, placed.row + 1));
          return;
        }
        if (relation.relationType === 'aggregation') {
          placeNode(relation.targetId, placed.col + 1, findNextRow(placed.col + 1, placed.row));
          return;
        }
        if (placed.col === 1) {
          placeNode(relation.targetId, 1, findNextRow(1, placed.row + 1));
          return;
        }
        placeNode(relation.targetId, placed.col + 1, findNextRow(placed.col + 1, placed.row));
      });
    }
    baseNodes.forEach((node, index) => {
      if (!placementMap.has(node.id)) {
        placeNode(node.id, 3 + Math.floor(index / 3), findNextRow(3 + Math.floor(index / 3), 0));
      }
    });
  } else {
    const columns = Math.max(1, Math.ceil(Math.sqrt(Math.max(baseNodes.length, 1))));
    baseNodes.forEach((node, index) => {
      placementMap.set(node.id, {
        col: index % columns,
        row: Math.floor(index / columns)
      });
    });
  }
  const maxColumn = Math.max(...[...placementMap.values()].map((placement) => placement.col), 0);
  const maxRow = Math.max(...[...placementMap.values()].map((placement) => placement.row), 0);
  const colWidths = new Array(maxColumn + 1).fill(0);
  const rowHeights = new Array(maxRow + 1).fill(0);
  baseNodes.forEach((node) => {
    const placement = placementMap.get(node.id) || { col: 0, row: 0 };
    colWidths[placement.col] = Math.max(colWidths[placement.col], node.width);
    rowHeights[placement.row] = Math.max(rowHeights[placement.row], node.height);
  });
  const colX = [];
  let currentX = leftMargin;
  colWidths.forEach((width, index) => {
    colX[index] = currentX;
    currentX += width + columnGap;
  });
  const rowY = [];
  let currentY = topMargin;
  rowHeights.forEach((height, index) => {
    rowY[index] = currentY;
    currentY += height + rowGap;
  });
  const getColumnRowOffset = (placement) => {
    if (!useRelationAwareLayout) return 0;
    if (placement.col !== 2 || placement.row === 0) return 0;
    const compactStep = Math.min(20, Math.max(12, rowGap - 8));
    return -compactStep * placement.row;
  };
  const nodes = baseNodes.map((node) => {
    const placement = placementMap.get(node.id) || { col: 0, row: 0 };
    const x = colX[placement.col];
    const y = rowY[placement.row] + getColumnRowOffset(placement);
    return {
      ...node,
      x,
      y,
      columnIndex: placement.col,
      rowIndex: placement.row,
      centerX: x + node.width / 2,
      centerY: y + node.height / 2,
      headerBottomY: y + node.headerHeight,
      fieldsBottomY: y + node.headerHeight + node.fieldsHeight,
      stereotypeY: y + 20,
      nameY: y + (node.stereotype ? 44 : 32),
      textLeftX: x + 14,
      fieldsStartY: y + node.headerHeight + 20,
      methodsStartY: y + node.headerHeight + node.fieldsHeight + 20
    };
  });
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const relations = data.relations.map((relation) => {
    const source = nodeMap.get(relation.sourceId);
    const target = nodeMap.get(relation.targetId);
    if (!source || !target) return null;
    const sourceOnLeft = source.centerX <= target.centerX;
    const sameColumn = source.columnIndex === target.columnIndex;
    const fromX = sameColumn
      ? source.centerX
      : sourceOnLeft ? source.x + source.width : source.x;
    const fromY = sameColumn
      ? source.centerY <= target.centerY ? source.y + source.height : source.y
      : source.centerY;
    const toX = sameColumn
      ? target.centerX
      : sourceOnLeft ? target.x : target.x + target.width;
    const toY = sameColumn
      ? source.centerY <= target.centerY ? target.y : target.y + target.height
      : target.centerY;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.hypot(dx, dy) || 1;
    const unitX = dx / distance;
    const unitY = dy / distance;
    const normalX = -unitY;
    const normalY = unitX;
    const cardOffsetAlong = 26;
    const cardOffsetNormal = 16;
    const dashArray = relation.relationType === 'dependency' || relation.relationType === 'realization' ? '7 5' : null;
    const markerStart = relation.relationType === 'aggregation'
      ? 'url(#class-diamond-open)'
      : relation.relationType === 'composition'
        ? 'url(#class-diamond-solid)'
        : null;
    const markerEnd = relation.relationType === 'generalization' || relation.relationType === 'realization'
      ? 'url(#class-triangle-open)'
      : relation.relationType === 'dependency'
        ? 'url(#class-arrow-open)'
        : relation.relationType === 'association'
          ? 'url(#class-arrow-open)'
          : null;
    const sameRow = source.rowIndex === target.rowIndex;
    const routeX = sourceOnLeft
      ? fromX + Math.max(28, (toX - fromX) / 2)
      : fromX - Math.max(28, (fromX - toX) / 2);
    const path = sameRow || sameColumn
      ? `M ${fromX} ${fromY} L ${toX} ${toY}`
      : `M ${fromX} ${fromY} L ${routeX} ${fromY} L ${routeX} ${toY} L ${toX} ${toY}`;
    const sourceCardPoint = sameColumn
      ? {
          x: fromX - 18,
          y: fromY + (source.centerY <= target.centerY ? 16 : -14)
        }
      : sameRow
        ? {
            x: fromX + (sourceOnLeft ? 20 : -20),
            y: fromY - 16
          }
        : {
            x: fromX + unitX * (cardOffsetAlong + 2) + normalX * (cardOffsetNormal + 6),
            y: fromY + unitY * (cardOffsetAlong + 2) + normalY * (cardOffsetNormal + 6)
          };
    const targetCardPoint = sameColumn
      ? {
          x: toX + 18,
          y: toY + (source.centerY <= target.centerY ? -16 : 14)
        }
      : sameRow
        ? {
            x: toX + (sourceOnLeft ? -20 : 20),
            y: toY + 16
          }
        : {
            x: toX - unitX * (cardOffsetAlong + 2) + normalX * (cardOffsetNormal + 6),
            y: toY - unitY * (cardOffsetAlong + 2) + normalY * (cardOffsetNormal + 6)
          };
    const sourceCardLabel = relation.sourceCardinality
      ? createEdgeLabelBox(relation.sourceCardinality, sourceCardPoint.x, sourceCardPoint.y, edgeLabelFontSize)
      : null;
    const targetCardLabel = relation.targetCardinality
      ? createEdgeLabelBox(relation.targetCardinality, targetCardPoint.x, targetCardPoint.y, edgeLabelFontSize)
      : null;
    return {
      ...relation,
      path,
      dashArray,
      markerStart,
      markerEnd,
      sourceCardPoint,
      targetCardPoint,
      sourceCardLabel,
      targetCardLabel
    };
  }).filter(Boolean);
  const width = nodes.length ? Math.max(...nodes.map((node) => node.x + node.width)) + 60 : 600;
  const bodyBottom = nodes.length ? Math.max(...nodes.map((node) => node.y + node.height)) + 60 : 320;
  return {
    width,
    height: Math.max(360, bodyBottom),
    displayScale: 1,
    displayWidth: width,
    displayHeight: Math.max(360, bodyBottom),
    lineWidth,
    fontSize,
    fontWeight,
    fontFamily,
    edgeLabelFontSize,
    edgeLabelStrokeWidth: 3,
    title: {
      show: config.SHOW_TITLE !== false && Boolean(data.title),
      centerX: width / 2,
      y: 34,
      fontSize: Number(config.TITLE_FONT_SIZE || 20),
      fontWeight: Number(config.TITLE_FONT_WEIGHT || 700)
    },
    nodes,
    relations
  };
}

const handlers = {
  architecture: {
    parse: parseArchitectureSource,
    buildFromPayload: buildArchitectureFromPayload,
    layout: layoutArchitecture
  },
  flowchart: {
    parse: parseFlowchartSource,
    buildFromPayload: buildFlowchartFromPayload,
    layout: layoutFlowchart
  },
  usecase: {
    parse: parseUsecaseSource,
    buildFromPayload: buildUsecaseFromPayload,
    layout: layoutUsecase
  },
  sequence: {
    parse: parseSequenceSource,
    buildFromPayload: (payload) => parseSequenceSource(payload),
    layout: layoutSequence
  },
  classdiagram: {
    parse: parseClassdiagramSource,
    buildFromPayload: buildClassdiagramFromPayload,
    buildSource: buildClassdiagramSource,
    layout: layoutClassdiagram
  },
};

function getHandler(type) {
  const handler = handlers[type];
  if (!handler) {
    throw new Error(`不支持的图种：${type}`);
  }
  return handler;
}

export function parseLocalDiagram(type, input) {
  return getHandler(type).parse(input);
}

export function generateLocalDiagram(type, payload) {
  const handler = getHandler(type);
  const data = handler.buildFromPayload(payload);
  const source = handler.buildSource ? handler.buildSource(payload) : null;
  return { data, source };
}

export function buildLocalDiagramSource(type, payload) {
  const handler = getHandler(type);
  if (!handler.buildSource) {
    throw new Error('当前图种不支持源码生成');
  }
  return handler.buildSource(payload);
}

export function calculateLocalDiagramLayout(type, data, config, options = {}) {
  return getHandler(type).layout(data, config, options);
}
