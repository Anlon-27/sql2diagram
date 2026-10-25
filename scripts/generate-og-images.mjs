import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

const TOOLS = [
  {
    type: 'default',
    label: '在线图表生成工具',
    sublabel: 'ER图 · 三线表 · 架构图 · 流程图 · 类图 · 时序图 · 用例图',
    color1: '#024ad8',
    color2: '#1a3a8a'
  },
  {
    type: 'er',
    label: 'ER 属性图',
    sublabel: 'SQL 转 ER 属性图 · 在线生成',
    color1: '#024ad8',
    color2: '#0d6efd'
  },
  {
    type: 'linetable',
    label: '学术三线表',
    sublabel: 'SQL 转学术三线表 · 在线生成',
    color1: '#0369a1',
    color2: '#0284c7'
  },
  {
    type: 'architecture',
    label: '系统架构图',
    sublabel: '系统架构图 · 在线生成',
    color1: '#4338ca',
    color2: '#6366f1'
  },
  {
    type: 'flowchart',
    label: '流程图',
    sublabel: '流程图 · 在线生成',
    color1: '#15803d',
    color2: '#22c55e'
  },
  {
    type: 'classdiagram',
    label: '类图',
    sublabel: 'UML 类图 · 在线生成',
    color1: '#7c3aed',
    color2: '#a855f7'
  },
  {
    type: 'usecase',
    label: '用例图',
    sublabel: 'UML 用例图 · 在线生成',
    color1: '#b91c1c',
    color2: '#ef4444'
  },
  {
    type: 'sequence',
    label: '时序图',
    sublabel: 'UML 时序图 · 在线生成',
    color1: '#0f766e',
    color2: '#14b8a6'
  },
  {
    type: 'overall-er',
    label: '总体 ER 图',
    sublabel: '多表关系结构 · 在线生成',
    color1: '#1d4ed8',
    color2: '#2563eb'
  }
];

const ICONS = {
  default: '<circle cx="40" cy="40" r="36" fill="none" stroke="white" stroke-width="4"/><path d="M25 40h30M40 25v30" stroke="white" stroke-width="4" stroke-linecap="round"/>',
  er: '<path d="M40 15 L65 40 L40 65 L15 40 Z" fill="none" stroke="white" stroke-width="3.5" stroke-linejoin="round"/><circle cx="40" cy="40" r="8" fill="white"/>',
  linetable: '<path d="M15 30 L105 30 M15 45 L105 45 M15 60 L105 60" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M15 20 L105 20" stroke="white" stroke-width="4" stroke-linecap="round"/>',
  architecture: '<rect x="15" y="20" width="90" height="12" rx="3" fill="none" stroke="white" stroke-width="3"/><rect x="15" y="38" width="90" height="12" rx="3" fill="none" stroke="white" stroke-width="3"/><rect x="15" y="56" width="90" height="12" rx="3" fill="none" stroke="white" stroke-width="3"/>',
  flowchart: '<rect x="25" y="15" width="70" height="24" rx="12" fill="none" stroke="white" stroke-width="3"/><polygon points="60,45 80,75 40,75" fill="none" stroke="white" stroke-width="3"/><rect x="42" y="75" width="36" height="20" rx="4" fill="none" stroke="white" stroke-width="3"/>',
  classdiagram: '<rect x="20" y="15" width="80" height="16" rx="2" fill="none" stroke="white" stroke-width="3"/><path d="M20 31h80M20 47h80" stroke="white" stroke-width="2.5"/><rect x="20" y="15" width="80" height="60" rx="2" fill="none" stroke="white" stroke-width="3"/>',
  usecase: '<ellipse cx="35" cy="30" rx="14" ry="10" fill="none" stroke="white" stroke-width="3"/><ellipse cx="35" cy="52" rx="20" ry="16" fill="none" stroke="white" stroke-width="3"/><path d="M80 20 L100 52 M80 52 L100 52" stroke="white" stroke-width="2.5" stroke-linecap="round"/>',
  sequence: '<path d="M25 15v55M60 15v55" stroke="white" stroke-width="3"/><path d="M25 30h35M25 50h25" stroke="white" stroke-width="2.5"/><path d="M60 30l-12 12M50 50l-8 8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>',
  'overall-er': '<rect x="14" y="18" width="34" height="22" rx="3" fill="none" stroke="white" stroke-width="3"/><rect x="72" y="18" width="34" height="22" rx="3" fill="none" stroke="white" stroke-width="3"/><rect x="43" y="58" width="34" height="22" rx="3" fill="none" stroke="white" stroke-width="3"/><path d="M48 29h24M60 40v18M77 69h18" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M72 29h-10" stroke="white" stroke-width="2.5" stroke-linecap="round"/>'
};

function buildSvg(tool) {
  const icon = ICONS[tool.type] || ICONS.default;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${tool.color1}"/>
        <stop offset="100%" style="stop-color:${tool.color2}"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="black" opacity="0.12"/>
    <g transform="translate(100, ${HEIGHT / 2 - 55})">
      <g transform="scale(2.4)">
        ${icon}
      </g>
    </g>
    <text x="${WIDTH - 100}" y="${HEIGHT / 2 - 14}" text-anchor="end" font-family="-apple-system,'Microsoft YaHei',sans-serif" font-size="52" font-weight="700" fill="white" letter-spacing="2">${tool.label}</text>
    <text x="${WIDTH - 100}" y="${HEIGHT / 2 + 46}" text-anchor="end" font-family="-apple-system,'Microsoft YaHei',sans-serif" font-size="24" font-weight="400" fill="rgba(255,255,255,0.75)" letter-spacing="1">${tool.sublabel}</text>
    <text x="100" y="${HEIGHT - 36}" font-family="-apple-system,sans-serif" font-size="15" fill="rgba(255,255,255,0.4)">tools.anrdev.cn</text>
  </svg>`;
}

async function generate() {
  const outDir = path.resolve(import.meta.dirname, '../public/og');
  fs.mkdirSync(outDir, { recursive: true });

  for (const tool of TOOLS) {
    const svg = buildSvg(tool);
    const filename = tool.type === 'default' ? 'og-cover.png' : `og-${tool.type}.png`;

    await sharp(Buffer.from(svg))
      .resize(WIDTH, HEIGHT)
      .png()
      .toFile(path.join(outDir, filename));

    console.log(`  ✓ ${filename}`);
  }

  console.log(`\nAll OG images generated in public/og/`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
