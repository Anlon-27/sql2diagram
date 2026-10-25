<template>
  <header class="site-header">
    <div class="site-header__main">
      <div class="site-header__main-shell">
        <button class="site-header__brand" type="button" @click="$emit('back')" title="返回首页">
          <img class="site-header__logo" src="/logo.svg" alt="Logo" />
        </button>

        <nav class="site-header__nav" aria-label="图表切换">
          <button
            v-for="diagram in quickAccessDiagrams"
            :key="diagram.type"
            class="site-header__nav-link"
            :class="{ 'is-active': activeType === diagram.type }"
            @click="$emit('go', diagram.type)"
          >
            {{ diagram.label }}
          </button>
        </nav>

        <div class="site-header__right-actions">
          <div v-if="accessState?.licensed" class="site-header__license-badge" title="尊贵的 VIP 授权用户" @click="$emit('openLicense')">
            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>VIP 剩余：{{ remainingTimeText }}</span>
          </div>
          <button
            v-else-if="showActivateBtn"
            type="button"
            class="site-header__activate-btn"
            title="输入卡密激活无限制使用"
            @click="$emit('openLicense')"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>激活码兑换</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { diagrams } from '../diagrams/index.js';
import { getRemainingTimeText, shouldShowActivateButton } from '../utils/access.js';

const props = defineProps({
  activeType: {
    type: String,
    default: null
  },
  hasSeo: {
    type: Boolean,
    default: false
  },
  accessState: {
    type: Object,
    default: () => ({})
  }
});

const quickAccessDiagrams = computed(() => diagrams);

const remainingTimeText = computed(() => {
  return getRemainingTimeText(props.accessState?.expiresAt);
});

const showActivateBtn = computed(() => {
  return shouldShowActivateButton(props.accessState);
});

defineEmits(['back', 'go', 'scrollSeo', 'openLicense']);
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 140;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: var(--panel-blur);
  -webkit-backdrop-filter: var(--panel-blur);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
}

.site-header__main {
  border-bottom: 1px solid rgba(232, 232, 232, 0.5);
  background: transparent;
}

.site-header__main-shell {
  width: min(calc(100% - 2 * var(--page-gutter)), var(--content-width));
  min-height: 72px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 32px;
}

.site-header__brand {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.site-header__logo {
  display: block;
  height: 32px;
  width: auto;
}

.site-header__nav {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.site-header__nav::-webkit-scrollbar {
  display: none;
}

.site-header__nav-link {
  position: relative;
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-2);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.site-header__nav-link:hover:not(.is-active) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text);
  transform: translateY(-1px);
}

.site-header__nav-link.is-active {
  background: rgba(2, 74, 216, 0.08);
  color: var(--primary-deep);
}

@media (max-width: 640px) {
  .site-header__main-shell {
    width: calc(100% - 24px);
    gap: 16px;
  }
}

.site-header__right-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.site-header__license-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  background: rgba(2, 74, 216, 0.05);
  border: 1px solid rgba(2, 74, 216, 0.15);
  border-radius: 999px;
  color: var(--primary-deep);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: var(--shadow-inset);
  cursor: pointer;
  transition: all 0.2s ease;
}

.site-header__license-badge:hover {
  background: rgba(2, 74, 216, 0.08);
  border-color: rgba(2, 74, 216, 0.25);
  transform: translateY(-1px);
}

.site-header__activate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  color: #374151;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.site-header__activate-btn:hover {
  background: #f9fafb;
  border-color: #024ad8;
  color: #024ad8;
  transform: translateY(-1px);
}

.btn-icon {
  width: 14px;
  height: 14px;
  color: inherit;
}

.badge-icon {
  width: 14px;
  height: 14px;
  color: var(--primary);
  flex-shrink: 0;
}
</style>
