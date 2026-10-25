<template>
  <div v-if="open" class="license-dialog-backdrop" @click.self="$emit('close')">
    <div class="license-dialog" role="dialog" aria-modal="true" aria-labelledby="license-dialog-title">
      <!-- 关闭按钮 -->
      <button type="button" class="license-dialog__close" aria-label="关闭" @click="$emit('close')">
        <span></span>
        <span></span>
      </button>

      <!-- 顶部精致微缩插图 -->
      <div class="license-dialog__visual" aria-hidden="true">
        <div class="license-dialog__visual-stage"></div>
        <div class="license-dialog__server-stack">
          <div class="license-dialog__server license-dialog__server--top"></div>
          <div class="license-dialog__server license-dialog__server--middle"></div>
          <div class="license-dialog__server license-dialog__server--bottom"></div>
        </div>
        <div class="license-dialog__arrow"></div>
        <div class="license-dialog__shield-wrap">
          <div class="license-dialog__shield">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3.5 18.5 6v5.6c0 4.1-2.8 7.8-6.5 8.9-3.7-1.1-6.5-4.8-6.5-8.9V6L12 3.5Z" fill="url(#shield-gradient-new)" />
              <path d="m9.4 12.3 1.8 1.8 3.7-4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <defs>
                <linearGradient id="shield-gradient-new" x1="6" y1="4" x2="19" y2="20">
                  <stop stop-color="#78BAFF" />
                  <stop offset="1" stop-color="#2A6CFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <!-- 标题与文案 -->
      <div class="license-dialog__copy">
        <h3 id="license-dialog-title">您的试用次数已用完</h3>
        <p>服务器成本较高，期待您的高抬贵手</p>
      </div>

      <!-- 输入框区域 -->
      <div class="license-dialog__form-group">
        <label class="license-dialog__input-wrap">
          <span class="license-dialog__input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 10V7.8C7 5 9.2 3 12 3s5 2 5 4.8V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <rect x="4" y="10" width="16" height="11" rx="3" stroke="currentColor" stroke-width="2" />
            </svg>
          </span>
          <input
            v-model="code"
            class="license-dialog__input"
            type="text"
            placeholder="请输入授权码"
            @keyup.enter="submitRedeem"
          />
        </label>
        <p v-if="errorMessage" class="license-dialog__error">{{ errorMessage }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="license-dialog__actions">
        <button type="button" class="license-dialog__action license-dialog__action--primary" @click="submitRedeem">
          <span class="license-dialog__action-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3.5 18.5 6v5.6c0 4.1-2.8 7.8-6.5 8.9-3.7-1.1-6.5-4.8-6.5-8.9V6L12 3.5Z" stroke="currentColor" stroke-width="1.8" />
              <path d="m9.4 12.3 1.8 1.8 3.7-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          验证授权码
        </button>
        <a v-if="buyUrl" class="license-dialog__action license-dialog__action--secondary" :href="buyUrl" target="_blank" rel="noreferrer">
          <span class="license-dialog__action-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 6h2l1.2 7.2a2 2 0 0 0 2 1.7h7.6a2 2 0 0 0 2-1.6L20 8H7.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="10" cy="19" r="1.3" fill="currentColor" />
              <circle cx="17" cy="19" r="1.3" fill="currentColor" />
            </svg>
          </span>
          获取授权码
        </a>
      </div>

      <!-- 底部备注说明 -->
      <div class="license-dialog__notes">
        <div class="license-dialog__note">
          <span aria-hidden="true" class="heart-icon">♥</span>
          授权码有效期内可无限次使用，感谢支持分摊高昂的服务器运行成本
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  buyUrl: {
    type: String,
    default: '#'
  },
  errorMessage: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['redeem', 'close']);
const code = ref('');

watch(
  () => props.open,
  (open) => {
    if (!open) {
      code.value = '';
    }
  }
);

function submitRedeem() {
  emit('redeem', code.value.trim());
}
</script>

<style scoped>
/* 背景遮罩 - 毛玻璃质感 */
.license-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background:
    radial-gradient(circle at 10% 10%, rgba(120, 170, 255, 0.22), transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(80, 130, 255, 0.16), transparent 40%),
    rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* 1:1 比例精致卡窗 */
.license-dialog {
  position: relative;
  width: min(100%, 460px);
  aspect-ratio: 1 / 1;
  padding: 36px 32px 28px;
  border-radius: 24px;
  background: linear-gradient(185deg, #ffffff, #f7faff);
  box-shadow:
    0 32px 64px -12px rgba(15, 23, 42, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 0 0 2px rgba(224, 235, 252, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
}

/* 关闭按钮 */
.license-dialog__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow:
    inset 0 0 0 1px rgba(218, 228, 245, 0.8),
    0 4px 10px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 10;
}

.license-dialog__close:hover {
  background: #ffffff;
  transform: rotate(90deg);
  box-shadow:
    inset 0 0 0 1px rgba(180, 205, 245, 1),
    0 6px 14px rgba(15, 23, 42, 0.08);
}

.license-dialog__close span {
  position: absolute;
  width: 14px;
  height: 1.5px;
  border-radius: 999px;
  background: #1e3a8a;
  transition: background-color 0.2s;
}

.license-dialog__close:hover span {
  background: #2563eb;
}

.license-dialog__close span:first-child {
  transform: rotate(45deg);
}

.license-dialog__close span:last-child {
  transform: rotate(-45deg);
}

/* 精致微缩插图区 */
.license-dialog__visual {
  position: relative;
  height: 120px;
  width: 220px;
  margin: 0 auto;
}

.license-dialog__visual-stage {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 4px;
  height: 30px;
  border-radius: 999px;
  background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.98), rgba(216, 230, 255, 0.9) 60%, rgba(194, 212, 244, 0.6));
  box-shadow:
    inset 0 4px 8px rgba(255, 255, 255, 0.6),
    0 10px 20px rgba(59, 130, 246, 0.1);
}

/* 服务器堆栈 */
.license-dialog__server-stack {
  position: absolute;
  left: 20px;
  width: 96px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.license-dialog__server {
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(180deg, #60a5fa, #2563eb);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.25),
    inset 0 -2px 4px rgba(30, 58, 138, 0.2),
    0 4px 8px rgba(37, 99, 235, 0.15);
  position: relative;
}

.license-dialog__server::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 9px;
  width: 22px;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #ffffff 0 26%, transparent 26% 38%, #ffffff 38% 62%, transparent 62% 74%, #ffffff 74% 100%);
  opacity: 0.85;
}

/* 服务器上的小闪烁灯 */
.license-dialog__server::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 9px;
  width: 26px;
  height: 6px;
  background:
    radial-gradient(circle at 3px 3px, #ffffff 0 1.5px, transparent 2px),
    radial-gradient(circle at 13px 3px, #93c5fd 0 1.5px, transparent 2px),
    radial-gradient(circle at 23px 3px, #a7f3d0 0 1.5px, transparent 2px);
  animation: ledPulse 2s infinite alternate;
}

.license-dialog__server--top {
  transform: translateX(6px);
}

.license-dialog__server--bottom {
  transform: translateX(-4px);
}

/* 箭头 */
.license-dialog__arrow {
  position: absolute;
  left: 122px;
  bottom: 24px;
  width: 24px;
  height: 42px;
  background: linear-gradient(180deg, #93c5fd, #2563eb);
  clip-path: polygon(50% 0, 100% 48%, 70% 48%, 70% 100%, 30% 100%, 30% 48%, 0 48%);
  opacity: 0.8;
  animation: arrowFlow 1.8s infinite ease-in-out;
}

/* 盾牌浮空效果 */
.license-dialog__shield-wrap {
  position: absolute;
  right: 20px;
  bottom: 12px;
  animation: shieldFloat 3s infinite ease-in-out;
}

.license-dialog__shield {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff, #f1f5f9);
  box-shadow:
    inset 0 0 0 2px #ffffff,
    inset 0 0 0 5px rgba(226, 232, 240, 0.8),
    0 8px 16px rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.license-dialog__shield svg {
  width: 32px;
  height: 32px;
}

/* 标题与文字排版 */
.license-dialog__copy {
  text-align: center;
  margin-top: -6px;
}

.license-dialog__copy h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
  color: #0f172a;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.license-dialog__copy p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
  white-space: nowrap;
}

/* 表单与错误定位组 */
.license-dialog__form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 输入框 */
.license-dialog__input-wrap {
  height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.license-dialog__input-wrap:focus-within {
  border-color: #2563eb;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.12),
    0 1px 2px rgba(15, 23, 42, 0.03);
}

.license-dialog__input-icon {
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.license-dialog__input-icon svg {
  width: 18px;
  height: 18px;
}

.license-dialog__input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #0f172a;
  outline: none;
}

.license-dialog__input::placeholder {
  color: #94a3b8;
}

/* 错误提示 */
.license-dialog__error {
  margin: 0;
  padding-left: 4px;
  font-size: 12px;
  color: #ef4444;
  text-align: left;
}

/* 按钮组 */
.license-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.license-dialog__action {
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.license-dialog__action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.license-dialog__action-icon svg {
  width: 16px;
  height: 16px;
}

.license-dialog__action--primary {
  border: none;
  color: #ffffff;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.license-dialog__action--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
}

.license-dialog__action--primary:active {
  transform: translateY(0);
}

.license-dialog__action--secondary {
  color: #1e3a8a;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.license-dialog__action--secondary:hover {
  border-color: #93c5fd;
  background: #f8fafc;
  color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.license-dialog__action--secondary:active {
  transform: translateY(0);
}

/* 底部备注 */
.license-dialog__notes {
  display: flex;
  flex-direction: column;
}

.license-dialog__note {
  font-size: 11px;
  color: #2563eb;
  background: rgba(239, 246, 255, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.08);
  padding: 8px 12px;
  border-radius: 10px;
  text-align: center;
  line-height: 1.4;
  white-space: nowrap;
}

.heart-icon {
  color: #ef4444;
  margin-right: 2px;
}

/* 动画定义 */
@keyframes shieldFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes arrowFlow {
  0%, 100% {
    transform: translateY(0) scaleY(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(4px) scaleY(1.05);
    opacity: 0.95;
  }
}

@keyframes ledPulse {
  0% {
    filter: brightness(1);
  }
  100% {
    filter: brightness(1.3);
  }
}

/* 移动端适配：仅做整体缩放以保证 1:1 */
@media (max-width: 480px) {
  .license-dialog {
    padding: 28px 20px 20px;
  }
  .license-dialog__copy h3 {
    font-size: 17px;
  }
  .license-dialog__copy p {
    font-size: 11.5px;
  }
  .license-dialog__action {
    font-size: 13px;
  }
  .license-dialog__note {
    font-size: 10px;
    padding: 6px 8px;
  }
}
</style>

