import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SITE_HOST = 'drawlab.top';
const SITE_URL = `https://${SITE_HOST}`;
const INDEXNOW_KEY = 'drawlab8e54738592984920ab4e8f12';

const URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/er/`,
  `${SITE_URL}/linetable/`,
  `${SITE_URL}/architecture/`,
  `${SITE_URL}/flowchart/`,
  `${SITE_URL}/classdiagram/`,
  `${SITE_URL}/usecase/`,
  `${SITE_URL}/sequence/`,
  `${SITE_URL}/overall-er/`,
  `${SITE_URL}/guides/`,
  `${SITE_URL}/guides/er-diagram-how-to-draw.html`,
  `${SITE_URL}/guides/mysql-create-table-to-er.html`,
  `${SITE_URL}/guides/sql-to-er-diagram.html`,
  `${SITE_URL}/guides/sql-to-academic-table.html`,
  `${SITE_URL}/guides/architecture-diagram-example-smart-campus.html`,
  `${SITE_URL}/guides/flowchart-example-leave-approval.html`,
  `${SITE_URL}/guides/class-diagram-example-student-system.html`,
  `${SITE_URL}/guides/usecase-diagram-example-ecommerce.html`,
  `${SITE_URL}/guides/usecase-include-vs-extend.html`,
  `${SITE_URL}/guides/sequence-diagram-example-password-reset.html`,
  `${SITE_URL}/guides/sequence-diagram-vs-flowchart.html`,
  `${SITE_URL}/guides/dataflow-diagram-how-to-draw.html`,
  `${SITE_URL}/guides/dataflow-diagram-example-ecommerce.html`,
  `${SITE_URL}/guides/graduation-project-diagram-templates.html`
];

async function submitIndexNow() {
  console.log('📡 [1/2] 正在向 IndexNow (Bing / 必应 / Yandex) API 提交全站 URL...');
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: URLS
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      console.log(`  -> ${endpoint}: HTTP ${resp.status} ${resp.statusText}`);
      if (resp.status === 200 || resp.status === 202) {
        console.log(`  ✅ IndexNow 提交成功！共 ${URLS.length} 条 URL 已推送给搜索引擎。`);
      } else {
        const text = await resp.text();
        console.log(`  ⚠️ 响应详情: ${text}`);
      }
    } catch (err) {
      console.error(`  ❌ 提交失败: ${endpoint}`, err.message);
    }
  }
}

async function submitBaidu(token) {
  if (!token) {
    console.log('\n📡 [2/2] 百度 API 提交跳过 (未提供 BAIDU_TOKEN)');
    console.log('  提示: 如果您有百度站长平台 Token，可运行: node scripts/submit-urls.mjs --baidu-token=你的TOKEN');
    return;
  }

  console.log(`\n📡 [2/2] 正在向 百度搜索资源平台 API 提交全站 URL (Token: ${token.slice(0, 4)}****)...`);
  const apiUrl = `http://data.zz.baidu.com/urls?site=${SITE_URL}&token=${token}`;
  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: URLS.join('\n')
    });
    const result = await resp.json();
    console.log('  百度 API 响应:', result);
    if (result.success) {
      console.log(`  ✅ 百度提交成功！成功推送 ${result.success} 条，今日剩余配额 ${result.remain} 条。`);
    } else {
      console.log(`  ⚠️ 百度返回提示: ${result.message}`);
    }
  } catch (err) {
    console.error('  ❌ 百度 API 提交失败:', err.message);
  }
}

async function main() {
  const args = process.argv.slice(2).reduce((acc, curr) => {
    const [k, v] = curr.replace(/^--/, '').split('=');
    acc[k] = v || true;
    return acc;
  }, {});

  const baiduToken = args['baidu-token'] || process.env.BAIDU_TOKEN;

  await submitIndexNow();
  await submitBaidu(baiduToken);
}

main().catch(err => {
  console.error('执行失败:', err);
  process.exit(1);
});
