import { TOOL_SEO_CONTENT } from '../content/toolSeoContent.js';
import { diagrams } from '../diagrams/index.js';

const SITE_NAME = '毕设 ER 图在线生成工具';
const SITE_URL = 'https://drawlab.top';
const OG_BASE = `${SITE_URL}/og`;
const DEFAULT_OG_IMAGE = `${OG_BASE}/og-cover.png`;
const PER_TYPE_OG = {
  er: `${OG_BASE}/og-er.png`,
  linetable: `${OG_BASE}/og-linetable.png`,
  architecture: `${OG_BASE}/og-architecture.png`,
  flowchart: `${OG_BASE}/og-flowchart.png`,
  classdiagram: `${OG_BASE}/og-classdiagram.png`,
  usecase: `${OG_BASE}/og-usecase.png`,
  sequence: `${OG_BASE}/og-sequence.png`,
  'overall-er': `${OG_BASE}/og-overall-er.png`,
};
const DEFAULT_AUTHOR = '';

const PAGE_TYPE_SET = new Set(['er', 'linetable', 'architecture', 'flowchart', 'classdiagram', 'usecase', 'sequence', 'overall-er']);

const SEO_CONFIG = {
  home: {
    title: '毕设 ER 图在线生成工具 - SQL转ER图、三线表、流程图、类图',
    description: '面向毕业设计和课程设计的在线图表工具，粘贴 MySQL CREATE TABLE 可生成 ER 图和数据库三线表，也支持系统架构图、流程图、用例图、类图、时序图导出 PNG',
    keywords: '毕设ER图,毕业设计ER图,SQL转ER图,MySQL建表语句生成ER图,数据库ER图,在线ER图生成,SQL转三线表,毕业设计三线表,数据库设计图,系统架构图,流程图生成,UML类图,用例图,时序图,课程设计图表',
    path: '/',
    schemaName: SITE_NAME
  },
  er: {
    title: '毕设 ER 图在线生成 - SQL建表语句转ER图，PNG导出',
    description: '毕业设计数据库设计常用的 SQL 转 ER 图工具，粘贴 MySQL CREATE TABLE 建表语句即可生成 ER 属性图，支持字段注释、主外键关系整理和 PNG 导出',
    keywords: '毕设ER图,毕业设计ER图,SQL转ER图,MySQL建表语句生成ER图,数据库ER图,在线ER图生成,ER图生成器,SQL建表语句转ER图,ER属性图,ER图导出PNG',
    path: '/er/',
    schemaName: 'SQL转ER图在线生成工具'
  },
  linetable: {
    title: '毕业设计三线表在线生成 - SQL转数据库表结构三线表',
    description: '面向毕业设计数据库章节的 SQL 转三线表工具，粘贴 CREATE TABLE 自动提取字段名、类型、长度、注释和主键信息，生成规范三线表并导出 PNG',
    keywords: '毕业设计三线表,SQL转三线表,数据库三线表,学术三线表,在线三线表生成,数据库表结构说明,字段说明表,课程设计三线表,论文三线表',
    path: '/linetable/',
    schemaName: 'SQL转学术三线表在线生成工具'
  },
  architecture: {
    title: '毕业设计系统架构图在线生成 - 课程设计架构图自动排版',
    description: '在线输入系统分层描述和连接关系，一键生成规整的系统架构图，适合学术论文、课程设计、答辩汇报和系统总体设计说明',
    keywords: '学术架构图,毕业设计架构图,系统架构图,在线架构图生成,课程设计架构图,智慧园区架构图,系统总体架构图',
    path: '/architecture/',
    schemaName: '系统架构图在线生成工具'
  },
  flowchart: {
    title: '毕业设计流程图在线生成 - 业务流程图、系统流程图导出 PNG',
    description: '通过表单输入节点和连线，自动生成适合学术正文和系统分析章节的流程图，支持判断分支、回路连线、实时同步预览和 PNG 导出',
    keywords: '学术流程图,毕业设计流程图,流程图生成,流程图在线制作,PNG流程图,审批流程图,在线流程图工具,业务流程图',
    path: '/flowchart/',
    schemaName: '流程图在线生成工具'
  },
  classdiagram: {
    title: '毕业设计类图在线生成 - UML类图、属性方法与关系标注',
    description: '在线输入 UML 类图文本，自动生成适合学术说明书和面向对象分析章节的黑白风格类图，支持类、抽象类、接口以及继承、实现、聚合、组合、多重度等关系',
    keywords: '学术类图,毕业设计类图,类图生成,UML类图,在线类图,系统类图,课程设计类图,学生管理系统类图',
    path: '/classdiagram/',
    schemaName: '类图在线生成工具'
  },
  usecase: {
    title: '毕业设计用例图在线生成 - 参与者、用例与 include 关系',
    description: '在线填写参与者与两层用例结构，自动生成黑白学术风格用例图，支持 include 关系表达及 PNG 导出，适合学术需求分析和课程设计展示',
    keywords: '学术用例图,毕业设计用例图,用例图生成,在线用例图,系统用例图,课程设计用例图,include extend',
    path: '/usecase/',
    schemaName: '用例图在线生成工具'
  },
  sequence: {
    title: '毕业设计时序图在线生成 - UML交互流程图导出 PNG',
    description: '在线输入参与者、消息、备注和 alt / opt / loop 等片段语法，自动生成黑白风格时序图，支持 PNG 导出，适合学术系统设计、登录流程和接口交互说明',
    keywords: '学术时序图,毕业设计时序图,时序图生成,在线时序图,UML时序图,系统时序图,课程设计时序图,密码重置时序图',
    path: '/sequence/',
    schemaName: '时序图在线生成工具'
  },
  'overall-er': {
    title: '数据库总体 ER 图在线生成 - 多表关系图、主外键结构导出',
    description: '粘贴多张数据表的 SQL 建表语句，自动生成数据库总体 ER 图，适合毕业设计数据库设计章节展示多表关系、主外键连接和系统数据结构',
    keywords: '总体ER图,数据库总体ER图,SQL转总体ER图,多表ER图,数据库关系图,主外键关系图,毕业设计ER图,在线ER图生成,系统数据库设计图',
    path: '/overall-er/',
    schemaName: '总体 ER 图在线生成工具'
  },
};

function ensureMeta(attrName, attrValue) {
  const selector = `meta[${attrName}="${attrValue}"]`;
  let meta = document.head.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }
  return meta;
}

function ensureCanonical() {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  return link;
}

function ensureSchemaScript() {
  let script = document.head.querySelector('#app-seo-schema');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'app-seo-schema';
    document.head.appendChild(script);
  }
  return script;
}

function buildAbsoluteUrl(path) {
  return `${SITE_URL}${path}`;
}

function buildToolCatalogList() {
  return diagrams.map((diagram, index) => {
    const meta = getSeoMeta(diagram.type);
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: diagram.label,
      url: buildAbsoluteUrl(meta.path)
    };
  });
}

function buildCommonSchemas(meta, canonicalUrl, type) {
  const schemaList = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'zh-CN'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_OG_IMAGE
    }
  ];

  if (!type) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.title,
      url: canonicalUrl,
      description: meta.description,
      inLanguage: 'zh-CN',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: buildToolCatalogList()
      }
    });
    return schemaList;
  }

  const content = TOOL_SEO_CONTENT[type];
  const pageLabel = content?.h1 || meta.schemaName;
  const pageUrl = canonicalUrl;

  schemaList.push({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: meta.schemaName,
    url: pageUrl,
    description: meta.description,
    applicationCategory: 'DesignApplication',
    applicationSubCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    image: DEFAULT_OG_IMAGE,
    inLanguage: 'zh-CN',
    featureList: [
      'MySQL CREATE TABLE 建表语句一键转 ER 属性图',
      '学术数据库设计标准三线表自动生成与导出',
      '分层系统架构图自动排版',
      '学术规范流程图设计与 PNG 导出',
      'UML 类图、时序图与用例图生成'
    ],
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY'
    },
    browserRequirements: 'Requires JavaScript, HTML5 Canvas'
  });

  schemaList.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageLabel,
        item: pageUrl
      }
    ]
  });

  if (content?.faq?.length) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a
        }
      }))
    });
  }

  if (content?.tutorialSteps?.length) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `${pageLabel}使用步骤`,
      description: meta.description,
      step: content.tutorialSteps.map((item, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: item.title,
        text: item.desc
      }))
    });
  }

  return schemaList;
}

export function getPageTypeFromLocation(locationLike = window.location) {
  let pathname = locationLike.pathname || '/';
  if (pathname !== '/') {
    pathname = pathname.replace(/\/+$/, '');
    pathname = pathname.replace(/\/index\.html$/, '') || '/';
  }
  for (const type of PAGE_TYPE_SET) {
    if (pathname.endsWith(`/${type}.html`) || pathname.endsWith(`/${type}`)) {
      return type;
    }
  }

  const hash = (locationLike.hash || '').replace(/^#/, '');
  return PAGE_TYPE_SET.has(hash) ? hash : null;
}

export function getSeoMeta(type) {
  return SEO_CONFIG[type] || SEO_CONFIG.home;
}

export function getPathForType(type) {
  if (!type) return '/';
  const meta = SEO_CONFIG[type];
  return meta ? meta.path : `/${type}`;
}

export function applyAdminNoindex() {
  document.title = '后台管理 - 毕设 ER 图在线生成工具';
  ensureMeta('name', 'robots').setAttribute('content', 'noindex, nofollow');
  ensureMeta('name', 'description').setAttribute('content', '系统后台管理页面，仅供管理员登录使用');
  ensureCanonical().setAttribute('href', `${SITE_URL}/admin/redeem-codes`);
}

export function applySeo(type) {
  const meta = getSeoMeta(type);
  const canonicalUrl = buildAbsoluteUrl(meta.path);

  const ogImage = (type && PER_TYPE_OG[type]) || DEFAULT_OG_IMAGE;
  const ogImageAlt = type ? `${meta.schemaName} - ${SITE_NAME}` : `${SITE_NAME} - 在线图表生成封面`;

  document.title = meta.title;
  ensureMeta('name', 'description').setAttribute('content', meta.description);
  ensureMeta('name', 'keywords').setAttribute('content', meta.keywords);
  ensureMeta('name', 'author').setAttribute('content', DEFAULT_AUTHOR);
  ensureMeta('name', 'robots').setAttribute('content', meta.robots || 'index, follow, max-snippet:-1, max-image-preview:large');
  ensureMeta('name', 'referrer').setAttribute('content', 'strict-origin-when-cross-origin');
  ensureMeta('name', 'theme-color').setAttribute('content', '#f8fbff');
  ensureMeta('property', 'og:title').setAttribute('content', meta.title);
  ensureMeta('property', 'og:description').setAttribute('content', meta.description);
  ensureMeta('property', 'og:type').setAttribute('content', type ? 'article' : 'website');
  ensureMeta('property', 'og:url').setAttribute('content', canonicalUrl);
  ensureMeta('property', 'og:locale').setAttribute('content', 'zh_CN');
  ensureMeta('property', 'og:site_name').setAttribute('content', SITE_NAME);
  ensureMeta('property', 'og:image').setAttribute('content', ogImage);
  ensureMeta('property', 'og:image:width').setAttribute('content', '1200');
  ensureMeta('property', 'og:image:height').setAttribute('content', '630');
  ensureMeta('property', 'og:image:alt').setAttribute('content', ogImageAlt);
  ensureMeta('name', 'twitter:card').setAttribute('content', 'summary_large_image');
  ensureMeta('name', 'twitter:title').setAttribute('content', meta.title);
  ensureMeta('name', 'twitter:description').setAttribute('content', meta.description);
  ensureMeta('name', 'twitter:image').setAttribute('content', ogImage);
  ensureCanonical().setAttribute('href', canonicalUrl);

  const schema = buildCommonSchemas(meta, canonicalUrl, type);
  ensureSchemaScript().textContent = JSON.stringify(schema);
}
