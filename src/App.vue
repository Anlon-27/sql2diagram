<template>
  <div class="app-root">
    <!-- 全局轻量 Toast 提示 -->
    <transition name="toast-fade">
      <div v-if="toastState.visible" class="global-toast" :class="`global-toast--${toastState.type}`" role="alert">
        <svg v-if="toastState.type === 'success'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg v-else-if="toastState.type === 'error'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <svg v-else class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="toast-message">{{ toastState.message }}</span>
      </div>
    </transition>

    <template v-if="isAdminRedeemPage">
      <RedeemCodeAdminPage />
    </template>
    <template v-else>
      <Header
        :active-type="activeDiagramType"
        :has-seo="Boolean(activeDiagram?.seoContent)"
        :access-state="accessState"
        @back="onBack"
        @go="onGo"
        @scroll-seo="scrollToSeo"
        @open-license="openLicenseDialog"
      />

      <Home
        v-if="!activeDiagramType"
        :available-count="availableDiagramCount"
        :access-state="accessState"
        @go="onGo"
        @open-license="openLicenseDialog"
      />

      <main v-else class="workspace-page">
        <!-- 现代化面包屑导航 -->
        <div class="breadcrumb">
          <span class="breadcrumb__link" @click="onBack">首页</span>
          <span class="breadcrumb__sep">/</span>
          <span class="breadcrumb__current">{{ activeDiagram?.label }}</span>
        </div>

        <div v-if="hasParamsPanel" class="workspace-page__rail">
          <ParamsPanel
            :schema="activeDiagram.configSchema"
            :config="config"
            :model-value="config"
            @update:model-value="Object.assign(config, $event)"
            @reset="onResetConfig"
          />
        </div>

        <section class="workspace-page__content" :class="{ 'workspace-page__content--full': !hasParamsPanel }">
          <component
            v-if="activeDiagram"
            :is="activeDiagram.WorkspaceComponent"
            :config="config"
            @go="onGo"
          />
        </section>

        <SeoContentSection
          v-if="activeDiagram?.seoContent"
          :content="activeDiagram.seoContent"
        />
      </main>

      <footer class="site-footer">
        © {{ currentYear }} sql2diagram. 保留所有权利.
      </footer>
    </template>

    <!-- 卡密激活弹窗 -->
    <LicenseDialog
      :open="licenseDialogOpen"
      :access-state="accessState"
      :error-message="licenseDialogError"
      :buy-url="licenseBuyUrl"
      @close="licenseDialogOpen = false"
      @redeem="onRedeemCode"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import Header from './components/Header.vue';
import Home from './components/Home.vue';
import ParamsPanel from './components/ParamsPanel.vue';
import SeoContentSection from './components/SeoContentSection.vue';
import LicenseDialog from './components/LicenseDialog.vue';
import RedeemCodeAdminPage from './components/admin/RedeemCodeAdminPage.vue';
import { diagrams, getDiagramByType } from './diagrams/index.js';
import { applyAdminNoindex, applySeo, getPageTypeFromLocation, getPathForType } from './utils/seo.js';
import { LICENSE_DIALOG_EVENT } from './utils/generateAccess.js';
import { loadAccessState } from './utils/access.js';
import { redeemLicenseCode } from './utils/licenseClient.js';

const currentYear = new Date().getFullYear();

// 全局 Toast 状态响应
const toastState = reactive({
  visible: false,
  message: '',
  type: 'info',
  timer: null
});

function handleShowToast(event) {
  const { message, type = 'info', duration = 3000 } = event.detail || {};
  if (toastState.timer) clearTimeout(toastState.timer);
  toastState.message = message;
  toastState.type = type;
  toastState.visible = true;
  toastState.timer = setTimeout(() => {
    toastState.visible = false;
  }, duration);
}

const activeDiagramType = ref(null);
const currentPath = ref(window.location.pathname);
const availableDiagramCount = computed(() => diagrams.length);
const activeDiagram = computed(() => (activeDiagramType.value ? getDiagramByType(activeDiagramType.value) : null));
const hasParamsPanel = computed(() => {
  if (!activeDiagram.value || activeDiagram.value.hideGlobalParamsPanel) return false;
  const schema = activeDiagram.value.configSchema;
  if (!schema) return false;
  if (Array.isArray(schema)) return schema.length > 0;
  if (schema.groups && Array.isArray(schema.groups)) return schema.groups.length > 0;
  return false;
});
const isAdminRedeemPage = computed(() => currentPath.value === '/admin/redeem-codes');

const accessState = ref(null);
const licenseDialogOpen = ref(false);
const licenseDialogError = ref('');
const licenseBuyUrl = ref(import.meta.env.VITE_XIANYU_URL || '');

const config = reactive({});

watch(
  activeDiagramType,
  (type) => {
    Object.keys(config).forEach((key) => delete config[key]);
    applySeo(type);
    if (!type) return;
    const diagram = getDiagramByType(type);
    if (diagram?.defaultConfig) {
      Object.assign(config, diagram.defaultConfig);
    }
  },
  { immediate: true }
);

watch(
  currentPath,
  () => {
    if (isAdminRedeemPage.value) {
      applyAdminNoindex();
    } else if (!activeDiagramType.value) {
      applySeo(null);
    }
  },
  { immediate: true }
);

function pushState(type) {
  const nextPath = getPathForType(type);
  history.pushState({ type }, '', nextPath);
  currentPath.value = nextPath;
}

function onGo(type) {
  pushState(type);
  activeDiagramType.value = type;
}

function onBack() {
  history.pushState({ type: null }, '', getPathForType(null));
  currentPath.value = getPathForType(null);
  activeDiagramType.value = null;
}

function scrollToSeo() {
  const target = document.querySelector('.seo-content');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handlePopState(event) {
  currentPath.value = window.location.pathname;
  activeDiagramType.value = event.state?.type || null;
}

function handleGlobalKeydown(event) {
  if (event.key === 'F12') {
    event.preventDefault();
  }
}

function openLicenseDialog(detail = {}) {
  licenseDialogOpen.value = true;
  licenseDialogError.value = detail?.errorMessage || '';
}

async function onRedeemCode(code) {
  if (!code) {
    licenseDialogError.value = '请输入授权码';
    return;
  }

  try {
    await redeemLicenseCode({
      code,
      deviceId: accessState.value?.guest?.deviceId || ''
    });

    accessState.value = await loadAccessState();
    licenseDialogOpen.value = false;
    licenseDialogError.value = '';
  } catch (error) {
    licenseDialogError.value = error instanceof Error ? error.message : '授权失败，请稍后重试';
  }
}

function handleLicenseDialogEvent(event) {
  openLicenseDialog(event?.detail || {});
}

onMounted(async () => {
  try {
    accessState.value = await loadAccessState();
  } catch (error) {
    console.error('Load access state failed', error);
  }

  const pageType = getPageTypeFromLocation();
  currentPath.value = window.location.pathname;
  if (pageType && getDiagramByType(pageType)) {
    activeDiagramType.value = pageType;
  } else if (currentPath.value === '/admin/redeem-codes') {
    activeDiagramType.value = null;
  } else {
    history.replaceState({ type: null }, '', getPathForType(null));
    currentPath.value = getPathForType(null);
  }

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener(LICENSE_DIALOG_EVENT, handleLicenseDialogEvent);
  window.addEventListener('show-toast', handleShowToast);
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState);
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener(LICENSE_DIALOG_EVENT, handleLicenseDialogEvent);
  window.removeEventListener('show-toast', handleShowToast);
  if (toastState.timer) clearTimeout(toastState.timer);
});

function onResetConfig() {
  if (activeDiagram.value?.defaultConfig) {
    Object.keys(config).forEach((key) => delete config[key]);
    Object.assign(config, activeDiagram.value.defaultConfig);
  }
}
</script>

<style>
/* 全局 Toast 通用提示样式 */
.global-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(26, 26, 26, 0.9);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.global-toast--error {
  background: rgba(179, 38, 43, 0.95);
  border-color: rgba(255, 255, 255, 0.15);
}

.global-toast--warn {
  background: rgba(217, 119, 6, 0.95);
  border-color: rgba(255, 255, 255, 0.15);
}

.global-toast--success {
  background: rgba(21, 128, 61, 0.95);
  border-color: rgba(255, 255, 255, 0.15);
}

.toast-icon {
  width: 16px;
  height: 16px;
  color: currentColor;
  flex-shrink: 0;
}

.toast-message {
  white-space: nowrap;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  --workspace-preview-sticky-top: clamp(120px, 18vh, 196px);
  background: transparent;
}

.app-root > * {
  position: relative;
  z-index: 1;
}

.workspace-page {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(calc(100% - 2 * var(--page-gutter)), var(--content-width));
  margin: 0 auto;
  padding-top: 18px;
  font-size: 13px;
  color: var(--text-3);
}

.breadcrumb__link {
  color: var(--text-3);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
}

.breadcrumb__link:hover {
  color: var(--primary);
  text-decoration: none;
}

.breadcrumb__sep {
  opacity: 0.35;
  font-size: 12px;
}

.breadcrumb__current {
  color: var(--text);
  font-weight: 500;
}

.workspace-page__rail {
  width: min(calc(100% - 2 * var(--page-gutter)), var(--content-width));
  margin: 0 auto;
  padding-top: 12px;
  z-index: 12;
}

.workspace-page__content {
  width: min(calc(100% - 2 * var(--page-gutter)), var(--content-width));
  margin: 0 auto;
  padding: 16px 0 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.workspace-page__content--full {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 var(--page-gutter);
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  font-size: 12px;
  color: var(--text-3);
  border-top: 1px solid var(--border);
  margin-top: auto;
}
</style>
