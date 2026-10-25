<template>
  <main class="redeem-admin-page">
    <section v-if="!isUnlocked" class="redeem-admin-gate">
      <div class="redeem-admin-gate__card">
        <div class="gate-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
            <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
          </svg>
        </div>
        <h1>后台管理</h1>
        <p>请输入后台密码后进入卡密管理页。</p>
        <input
          v-model="pagePassword"
          class="redeem-admin-page__token"
          type="password"
          placeholder="输入后台密码"
          aria-label="后台密码"
          @keydown.enter.prevent="handleUnlock"
        />
        <p v-if="errorMessage" class="redeem-admin-error">
          <svg class="msg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          {{ errorMessage }}
        </p>
        <button class="btn btn-primary gate-submit" @click="handleUnlock">进入后台</button>
      </div>
    </section>

    <template v-else>
      <!-- 顶部标题区 -->
      <section class="redeem-admin-page__hero">
        <div>
          <h1>系统后台管理</h1>
          <p>实时监控授权情况，生成卡密，以及查看设备使用情况。</p>
        </div>
        <div class="redeem-admin-page__hero-actions">
          <span class="redeem-admin-badge redeem-admin-badge--success">
            <span class="dot"></span> 已通过后台验证
          </span>
          <button class="btn btn-secondary btn-sm" @click="handleLogout">退出登录</button>
        </div>
      </section>

      <!-- 仪表盘统计卡片 -->
      <section class="redeem-admin-metrics">
        <div class="metric-card">
          <div class="metric-icon metric-icon--blue" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 20v-7M10 20V5M16 20v-9M3 20h18" />
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">图表总生成量</span>
            <span class="metric-value">{{ totalGenerates }} <small>次</small></span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon metric-icon--violet" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4.5" width="18" height="12" rx="2" />
              <path d="M2 20.5h20M9.5 16.5v2.5h5v-2.5" />
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">注册设备总数</span>
            <span class="metric-value">{{ totalDevices }} <small>台</small></span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon metric-icon--green" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.5 17.5V8l4 4.5L12 6l3.5 6.5 4-4.5v9.5h-15z" />
              <path d="M3 20.5h18" />
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">已激活 VIP 数</span>
            <span class="metric-value">{{ activeVips }} <small>个</small></span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon metric-icon--amber" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2M13 17v2M13 11v2" />
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">未使用卡密</span>
            <span class="metric-value">{{ unusedCodes }} <small>个</small></span>
          </div>
        </div>
      </section>

      <!-- 选项卡切换 -->
      <div class="redeem-admin-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'codes' }"
          @click="activeTab = 'codes'"
        >
          <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.6 13.4 11 3H4v7l10.4 10.6a2 2 0 0 0 2.8 0l3.4-3.4a2 2 0 0 0 0-2.8Z" />
            <circle cx="7.5" cy="7.5" r="1.5" />
          </svg>
          卡密管理
          <span v-if="items.length" class="tab-count">{{ items.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'usages' }"
          @click="activeTab = 'usages'"
        >
          <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12h4l3-8 4 16 3-8h4" />
          </svg>
          设备使用记录
          <span v-if="totalDevices" class="tab-count">{{ totalDevices }}</span>
        </button>
      </div>

      <!-- 消息反馈区 -->
      <transition name="banner-fade">
        <div v-if="errorMessage || statusMessage" class="message-banner">
          <p v-if="errorMessage" class="redeem-admin-error">
            <svg class="msg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            {{ errorMessage }}
          </p>
          <p v-else-if="statusMessage" class="redeem-admin-status">
            <svg class="msg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
            </svg>
            {{ statusMessage }}
          </p>
        </div>
      </transition>

      <!-- 卡密管理面板 -->
      <section v-if="activeTab === 'codes'" class="redeem-admin-page__grid">
        <form class="redeem-admin-card" @submit.prevent="handleCreate">
          <h2>创建卡密</h2>
          <div class="form-item">
            <label>授权时长</label>
            <select v-model.number="form.durationDays" class="redeem-admin-input">
              <option :value="7">7 天 (体验)</option>
              <option :value="30">30 天 (月卡)</option>
              <option :value="90">90 天 (季卡)</option>
              <option :value="365">365 天 (年卡)</option>
            </select>
          </div>
          <div class="form-item">
            <label>生成数量</label>
            <input v-model.number="form.quantity" class="redeem-admin-input" type="number" min="1" placeholder="数量" />
          </div>
          <div class="form-item">
            <label>设备数限制</label>
            <input v-model.number="form.maxDevices" class="redeem-admin-input" type="number" min="1" placeholder="设备数" />
          </div>
          <div class="form-item">
            <label>备注说明</label>
            <input v-model="form.note" class="redeem-admin-input" type="text" placeholder="如：测试赠送" />
          </div>
          <button class="btn btn-primary" :disabled="submitting">{{ submitting ? '创建中...' : '创建卡密' }}</button>
        </form>

        <section class="redeem-admin-card redeem-admin-card--list">
          <div class="redeem-admin-card__head">
            <h2>卡密列表 ({{ filteredItems.length }}/{{ items.length }})</h2>
            <div class="redeem-admin-card__head-actions">
              <button
                class="btn btn-secondary btn-sm"
                :disabled="unusedCodes === 0"
                @click="openExportModal"
              >
                🎟️ 导出未使用
              </button>
              <button class="btn btn-secondary btn-sm" @click="handleRefresh">刷新</button>
            </div>
          </div>

          <!-- 模糊搜索与状态筛选过滤器 -->
          <div class="list-filter-bar">
            <input
              v-model="filterSearch"
              type="text"
              placeholder="输入卡密代码或备注搜索..."
              class="filter-input"
            />
            <select v-model="filterStatus" class="filter-select">
              <option value="all">所有状态</option>
              <option value="unused">未使用</option>
              <option value="active">已激活</option>
              <option value="disabled">已停用</option>
            </select>
          </div>
          
          <div class="redeem-admin-list">
            <article v-for="item in paginatedCodes" :key="item.code" class="redeem-admin-list__item" :class="`item-status--${item.status}`">
              <div class="redeem-admin-list__main">
                <div class="code-header">
                  <div class="code-box" @click="copyText(item.code)" title="点击复制卡密">
                    <span class="code-text">{{ item.code }}</span>
                    <button class="code-copy-btn" type="button" title="复制卡密">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="11" height="11" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                  <span class="status-badge" :class="item.status">
                    <span class="status-dot"></span>
                    {{ getStatusLabel(item.status) }}
                  </span>
                </div>
                <div class="redeem-admin-list__actions">
                  <button class="btn btn-secondary btn-sm" @click="copyText(item.code)">复制</button>
                  <button
                    class="btn btn-secondary btn-sm btn-danger"
                    :disabled="item.status === 'disabled'"
                    @click="handleDisable(item.code)"
                  >
                    停用
                  </button>
                </div>
              </div>

              <!-- 结构化元数据徽章行 -->
              <div class="code-meta-chips">
                <span class="meta-chip">
                  <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ item.duration_days }} 天
                </span>
                <span class="meta-chip">
                  <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  限 {{ item.max_devices }} 台设备
                </span>
                <span class="meta-chip meta-chip--muted">
                  <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatDate(item.created_at) }}
                </span>
                <span v-if="item.note" class="meta-chip meta-chip--note">
                  <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  备注: {{ item.note }}
                </span>
              </div>

              <!-- 卡密已绑定设备面板（带一键解绑功能） -->
              <div v-if="item.devices && item.devices.length > 0" class="redeem-admin-list__devices">
                <div class="devices-title">
                  <span>已激活设备</span>
                  <span class="devices-count">{{ item.devices.length }} / {{ item.max_devices }}</span>
                </div>
                <div class="devices-grid">
                  <div v-for="dev in item.devices" :key="dev.deviceId" class="device-chip">
                    <div class="device-icon-wrap" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="12" rx="2" />
                        <line x1="2" y1="20" x2="22" y2="20" />
                      </svg>
                    </div>
                    <div class="device-info">
                      <code class="dev-id" @click="copyText(dev.deviceId)" title="点击复制完整 ID">{{ truncateId(dev.deviceId) }}</code>
                      <span class="dev-time">活跃于 {{ formatDate(dev.lastSeenAt) }}</span>
                    </div>
                    <button
                      class="device-unbind-btn"
                      title="解除此设备授权绑定"
                      @click="handleUnbind(item.code, dev.deviceId)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
            <div v-if="filteredItems.length === 0" class="list-empty">
              <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>没有找到符合搜索条件的卡密</span>
            </div>
          </div>

          <!-- 卡密分页控制器 (每页 5 条) -->
          <div v-if="filteredItems.length > 0" class="code-pagination">
            <div class="code-pagination__meta">
              第 {{ codePage.page }} / {{ totalCodePages }} 页，共 {{ filteredItems.length }} 条 (每页 5 条)
            </div>
            <div class="code-pagination__actions">
              <button
                class="btn btn-secondary btn-sm"
                :disabled="codePage.page <= 1"
                @click="codePage.page--"
              >
                上一页
              </button>
              <button
                class="btn btn-secondary btn-sm"
                :disabled="codePage.page >= totalCodePages"
                @click="codePage.page++"
              >
                下一页
              </button>
            </div>
          </div>
        </section>
      </section>

      <!-- 全站使用记录面板（带一键清零重置功能） -->
      <section v-else class="redeem-admin-card redeem-admin-card--full">
        <div class="redeem-admin-card__head">
          <h2>全站设备生成图表记录</h2>
          <button class="btn btn-secondary" @click="handleRefresh">刷新数据</button>
        </div>

        <div class="table-responsive">
          <table class="usages-table">
            <thead>
              <tr>
                <th>访客 / 设备标识</th>
                <th>生成使用量</th>
                <th>最后活跃时间</th>
                <th>首次访问时间</th>
                <th style="width: 90px; text-align: center;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usage in usages" :key="usage.deviceId">
                <td class="td-device-id" data-label="访客 / 设备标识">
                  <div class="device-id-badge" @click="copyText(usage.deviceId)" title="点击复制完整标识 (UUID/IP)">
                    <div class="device-id-icon-wrap" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="12" rx="2" />
                        <line x1="2" y1="20" x2="22" y2="20" />
                      </svg>
                    </div>
                    <span class="device-id-text">{{ formatDisplayId(usage.deviceId) }}</span>
                    <svg class="device-id-copy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </div>
                </td>
                <td class="td-count-bar" data-label="生成使用量">
                  <div class="usage-stat-row">
                    <span class="count-pill"><em>{{ usage.generateUsed }}</em> 次</span>
                  </div>
                  <div class="bar-container">
                    <div class="bar-fill" :style="{ width: getProgressWidth(usage.generateUsed) + '%' }"></div>
                  </div>
                </td>
                <td class="td-time" data-label="最后活跃">
                  <div class="time-cell">
                    <span class="time-main">{{ formatDateTime(usage.updatedAt).date }}</span>
                    <span class="time-sub">{{ formatDateTime(usage.updatedAt).time }}</span>
                  </div>
                </td>
                <td class="td-time" data-label="首次访问">
                  <div class="time-cell">
                    <span class="time-main">{{ formatDateTime(usage.createdAt).date }}</span>
                    <span class="time-sub">{{ formatDateTime(usage.createdAt).time }}</span>
                  </div>
                </td>
                <td class="td-action" data-label="操作" style="text-align: center;">
                  <button
                    class="btn btn-secondary btn-sm btn-table-danger"
                    title="重置该设备免费生成次数为0"
                    @click="handleReset(usage.deviceId)"
                  >
                    <svg class="btn-icon-reset" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    重置
                  </button>
                </td>
              </tr>
              <tr v-if="usages.length === 0">
                <td colspan="5" class="table-empty">
                  <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
                  </svg>
                  <span>暂无任何设备生成记录</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="usage-pagination">
          <div class="usage-pagination__meta">
            第 {{ usagePage.page }} / {{ usagePage.totalPages }} 页，共 {{ usagePage.total }} 条
          </div>
          <div class="usage-pagination__actions">
            <button
              class="btn btn-secondary btn-sm"
              :disabled="usagePage.page <= 1 || usageLoading"
              @click="changeUsagePage(usagePage.page - 1)"
            >
              上一页
            </button>
            <button
              class="btn btn-secondary btn-sm"
              :disabled="usagePage.page >= usagePage.totalPages || usageLoading"
              @click="changeUsagePage(usagePage.page + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </section>

      <!-- 批量导出模态弹窗 -->
      <transition name="modal-fade">
        <div v-if="exportModalOpen" class="export-modal-backdrop" @click.self="exportModalOpen = false">
          <div class="export-modal-card">
            <div class="export-modal-head">
              <h3>批量导出未使用卡密 (共 {{ unusedCodesTextList.length }} 个)</h3>
              <button class="export-modal-close" @click="exportModalOpen = false">×</button>
            </div>
            <p class="export-modal-hint">以下为系统当前所有未激活的卡密，每行一个。复制后即可直接批量录入自动发卡网。</p>
            <textarea
              readonly
              class="export-modal-textarea"
              title="未激活卡密列表"
              :value="unusedCodesTextList.join('\n')"
            ></textarea>
            <div class="export-modal-foot">
              <button class="btn btn-primary" @click="copyAllExportedCodes">复制全部</button>
              <button class="btn btn-secondary" @click="exportModalOpen = false">关闭</button>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue';
import {
  ADMIN_PAGE_PASSWORD,
  ADMIN_RUNTIME_TOKEN,
  buildCreateRedeemCodesPayload,
  clearStoredAdminToken,
  createRedeemCodes,
  getStoredAdminToken,
  disableRedeemCode,
  listRedeemCodes,
  persistAdminToken,
  listUsages,
  resolveAdminToken,
  unbindDevice,
  resetGuestUsage
} from '../../utils/licenseClient.js';

const adminToken = ref('');
const pagePassword = ref('');
const isUnlocked = ref(false);
const submitting = ref(false);
const statusMessage = ref('');
const errorMessage = ref('');
const items = ref([]);
const usages = ref([]);
const usageLoading = ref(false);
const usagePage = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1
});
const codePage = reactive({
  page: 1,
  pageSize: 5
});
const usageSummary = reactive({
  totalDevices: 0,
  totalGenerates: 0
});
const activeTab = ref('codes');

// 本地过滤器字段
const filterSearch = ref('');
const filterStatus = ref('all');

// 监听过滤器变化，重置卡密分页到第 1 页
watch([filterSearch, filterStatus], () => {
  codePage.page = 1;
});

// 批量导出控制
const exportModalOpen = ref(false);

const form = reactive({
  durationDays: 30,
  quantity: 5,
  maxDevices: 2,
  note: ''
});

// 计算属性：过滤后的卡密列表
const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesSearch = !filterSearch.value.trim() ||
      item.code.toLowerCase().includes(filterSearch.value.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(filterSearch.value.toLowerCase()));
    
    const matchesStatus = filterStatus.value === 'all' || item.status === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

// 计算属性：卡密总页数
const totalCodePages = computed(() => {
  return Math.max(1, Math.ceil(filteredItems.value.length / codePage.pageSize));
});

// 计算属性：当前页分页后的卡密切片
const paginatedCodes = computed(() => {
  const start = (codePage.page - 1) * codePage.pageSize;
  return filteredItems.value.slice(start, start + codePage.pageSize);
});

// 计算属性：未激活卡密代码文本列表
const unusedCodesTextList = computed(() => {
  return items.value
    .filter(item => item.status === 'unused')
    .map(item => item.code);
});

// 计算属性：总图表生成量
const totalGenerates = computed(() => {
  return usageSummary.totalGenerates;
});

// 计算属性：注册设备总数
const totalDevices = computed(() => {
  return usageSummary.totalDevices;
});

// 计算属性：已激活 VIP 会员数
const activeVips = computed(() => {
  return items.value.filter(item => item.status === 'active').length;
});

// 计算属性：未使用卡密数
const unusedCodes = computed(() => {
  return items.value.filter(item => item.status === 'unused').length;
});

function handleUnlock() {
  const token = resolveAdminToken(pagePassword.value);
  if (!token) {
    errorMessage.value = '后台密码错误';
    return;
  }

  adminToken.value = token;
  isUnlocked.value = true;
  persistAdminToken(token);
  errorMessage.value = '';
  statusMessage.value = '已成功进入系统后台';
  fetchData();
}

function handleLogout() {
  clearStoredAdminToken();
  adminToken.value = '';
  isUnlocked.value = false;
  pagePassword.value = '';
  items.value = [];
  usages.value = [];
  usagePage.page = 1;
  usagePage.total = 0;
  usagePage.totalPages = 1;
  usageSummary.totalDevices = 0;
  usageSummary.totalGenerates = 0;
  errorMessage.value = '';
  statusMessage.value = '已退出后台登录';
  activeTab.value = 'codes';
}

async function fetchUsages(page = usagePage.page) {
  usageLoading.value = true;
  try {
    const usagesResult = await listUsages(adminToken.value, {
      page,
      pageSize: usagePage.pageSize
    });
    usages.value = usagesResult.usages || [];
    usageSummary.totalDevices = usagesResult.summary?.totalDevices || 0;
    usageSummary.totalGenerates = usagesResult.summary?.totalGenerates || 0;
    usagePage.page = usagesResult.pagination?.page || page;
    usagePage.pageSize = usagesResult.pagination?.pageSize || usagePage.pageSize;
    usagePage.total = usagesResult.pagination?.total || 0;
    usagePage.totalPages = usagesResult.pagination?.totalPages || 1;
  } finally {
    usageLoading.value = false;
  }
}

async function fetchData() {
  if (!adminToken.value) return;
  errorMessage.value = '';
  try {
    const [codesResult] = await Promise.all([
      listRedeemCodes(adminToken.value),
    ]);
    items.value = codesResult.codes || [];
    await fetchUsages(usagePage.page);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取数据失败';
  }
}

async function changeUsagePage(page) {
  if (!adminToken.value || usageLoading.value) return;
  errorMessage.value = '';
  try {
    await fetchUsages(page);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '分页加载失败';
  }
}

async function handleRefresh() {
  statusMessage.value = '正在刷新数据...';
  await fetchData();
  statusMessage.value = '数据已更新';
  setTimeout(() => {
    if (statusMessage.value === '数据已更新') statusMessage.value = '';
  }, 2000);
}

async function handleCreate() {
  if (!adminToken.value) {
    errorMessage.value = '未授权，请重新登录';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';
  statusMessage.value = '';

  try {
    const payload = buildCreateRedeemCodesPayload(form);
    await createRedeemCodes(payload, adminToken.value);
    await fetchData();
    statusMessage.value = `已成功创建新卡密`;
    form.note = ''; // 清空备注
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '创建失败';
  } finally {
    submitting.value = false;
  }
}

async function handleDisable(code) {
  if (!adminToken.value) return;
  if (!confirm(`确定要停用卡密 ${code} 吗？停用后该卡密及其绑定的设备授权将立即失效！`)) return;
  try {
    await disableRedeemCode(code, adminToken.value);
    await fetchData();
    statusMessage.value = `已停用卡密 ${code}`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '停用失败';
  }
}

// 🔌 处理设备解绑
async function handleUnbind(code, deviceId) {
  if (!adminToken.value) return;
  if (!confirm(`确定要解除设备 ${truncateId(deviceId)} 与该卡密的授权绑定吗？\n解绑后卡密会空出 1 个名额供其他设备激活绑定。`)) return;
  errorMessage.value = '';
  statusMessage.value = '';
  try {
    await unbindDevice(code, deviceId, adminToken.value);
    await fetchData();
    statusMessage.value = `已解除设备与卡密的授权关联`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '解绑失败';
  }
}

// 🔄 处理设备额度重置
async function handleReset(deviceId) {
  if (!adminToken.value) return;
  if (!confirm(`确定要将设备 ${truncateId(deviceId)} 的免费生成次数清空重置为 0 次吗？`)) return;
  errorMessage.value = '';
  statusMessage.value = '';
  try {
    await resetGuestUsage(deviceId, adminToken.value);
    await fetchData();
    statusMessage.value = `设备生成图表次数已重置归零`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '重置失败';
  }
}

// 打开批量导出弹窗
function openExportModal() {
  if (unusedCodesTextList.value.length === 0) return;
  exportModalOpen.value = true;
}

// 复制所有导出的卡密
async function copyAllExportedCodes() {
  try {
    const text = unusedCodesTextList.value.join('\n');
    await navigator.clipboard.writeText(text);
    statusMessage.value = `已成功复制全部 ${unusedCodesTextList.value.length} 个未激活卡密`;
    exportModalOpen.value = false;
    setTimeout(() => {
      if (statusMessage.value.startsWith('已成功复制')) statusMessage.value = '';
    }, 2000);
  } catch {
    errorMessage.value = '复制失败';
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    statusMessage.value = `已复制到剪贴板`;
    setTimeout(() => {
      if (statusMessage.value === '已复制到剪贴板') statusMessage.value = '';
    }, 2000);
  } catch {
    errorMessage.value = '复制失败';
  }
}

function truncateId(id) {
  if (!id) return '';
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-8)}`;
}

function formatDisplayId(id) {
  if (!id) return '-';
  const guestMatch = id.match(/^(?:incognito-)?guest-device-(\d+)$/i);
  if (guestMatch) {
    return `访客设备 #${guestMatch[1]}`;
  }
  const licensedMatch = id.match(/^licensed-.*device-(\d+)$/i);
  if (licensedMatch) {
    return `会员设备 #${licensedMatch[1]}`;
  }
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-8)}`;
}

function formatDateTime(isoString) {
  if (!isoString) return { date: '-', time: '' };
  try {
    const d = new Date(isoString);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return { date, time };
  } catch {
    return { date: String(isoString), time: '' };
  }
}

function formatDate(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return isoString;
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'unused': return '未使用';
    case 'active': return '已激活';
    case 'disabled': return '已停用';
    default: return status;
  }
}

function getProgressWidth(used) {
  if (usages.value.length === 0) return 0;
  const max = Math.max(...usages.value.map(u => u.generateUsed), 10);
  return (used / max) * 100;
}

onMounted(() => {
  if (!ADMIN_PAGE_PASSWORD) {
    return;
  }

  const storedToken = getStoredAdminToken();
  if (storedToken === ADMIN_RUNTIME_TOKEN) {
    adminToken.value = storedToken;
    isUnlocked.value = true;
    fetchData();
  }
});
</script>

<style scoped>
.redeem-admin-page {
  width: min(calc(100% - 2 * var(--page-gutter)), var(--content-width));
  margin: 0 auto;
  padding: 32px 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
}

.redeem-admin-gate {
  min-height: calc(100vh - 220px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.redeem-admin-gate__card {
  position: relative;
  width: min(100%, 420px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px 32px 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background: #ffffff;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  text-align: center;
}

.redeem-admin-gate__card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #60a5fa);
}

.gate-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(145deg, #eef4ff, #f8fbff);
  border: 1px solid rgba(2, 74, 216, 0.12);
  color: var(--primary);
  box-shadow: 0 8px 20px rgba(2, 74, 216, 0.08);
}

.gate-icon svg {
  width: 26px;
  height: 26px;
}

.redeem-admin-gate__card h1 {
  margin: 0;
  font-size: 24px;
  color: var(--text);
  font-weight: 700;
}

.redeem-admin-gate__card p {
  margin: 0;
  color: var(--text-3);
  font-size: 14px;
}

.redeem-admin-gate__card .redeem-admin-error {
  text-align: left;
}

.gate-submit {
  width: 100%;
}

.redeem-admin-page__hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
}

.redeem-admin-page__hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.redeem-admin-page__hero h1 {
  margin: 0;
  font-size: 28px;
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--text);
}

.redeem-admin-page__hero p {
  margin: 6px 0 0;
  color: var(--text-3);
  font-size: 14px;
  max-width: 560px;
}

/* 状态徽章 */
.redeem-admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  border: 1px solid transparent;
}

.redeem-admin-badge--success {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.redeem-admin-badge--success .dot {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
}

/* 仪表盘 */
.redeem-admin-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #fcfdfe);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: all 0.25s ease;
  min-width: 0;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(2, 74, 216, 0.05);
  border-color: rgba(2, 74, 216, 0.15);
}

.metric-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: var(--primary);
  border: 1px solid rgba(2, 74, 216, 0.1);
  transition: transform 0.25s var(--transition-fluid);
}

.metric-icon svg {
  width: 24px;
  height: 24px;
}

.metric-card:hover .metric-icon {
  transform: scale(1.06);
}

.metric-icon--blue {
  color: #024ad8;
  background: #eef4ff;
  border-color: rgba(2, 74, 216, 0.12);
}

.metric-icon--violet {
  color: #7c3aed;
  background: #f3efff;
  border-color: rgba(124, 58, 237, 0.12);
}

.metric-icon--green {
  color: #16a34a;
  background: #ecfdf3;
  border-color: rgba(22, 163, 74, 0.12);
}

.metric-icon--amber {
  color: #d97706;
  background: #fff8e8;
  border-color: rgba(217, 119, 6, 0.12);
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.metric-label {
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
  line-height: 1.5;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.metric-value small {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
  margin-left: 2px;
}

/* 选项卡 */
.redeem-admin-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: #f1f5f9;
  border-radius: 14px;
  width: fit-content;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tab-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #e2e8f0;
  color: var(--text-3);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.tab-btn:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  background: #ffffff;
  color: var(--primary);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.tab-btn.active .tab-count {
  background: rgba(2, 74, 216, 0.1);
  color: var(--primary);
}

/* 消息反馈 */
.message-banner {
  margin: 0;
}

.redeem-admin-error,
.redeem-admin-status {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  line-height: 1.5;
}

.msg-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.redeem-admin-error {
  color: #cf1322;
  background: #fff1f0;
  border: 1px solid #ffccc7;
}

.redeem-admin-status {
  color: #18794e;
  background: #f6ffed;
  border: 1px solid #d9f7be;
}

.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 网格布局 */
.redeem-admin-page__grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.redeem-admin-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: var(--shadow-card);
}

.redeem-admin-card--full {
  width: 100%;
  box-sizing: border-box;
}

.redeem-admin-card h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 12px;
}

.redeem-admin-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 12px;
}

.redeem-admin-card__head h2 {
  border-bottom: none;
  padding-bottom: 0;
}

.redeem-admin-card__head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.redeem-admin-page__token,
.redeem-admin-input {
  min-height: 42px;
  padding: 8px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 14px;
  background: #ffffff;
  color: var(--text);
  outline: none;
  transition: all 0.2s;
}

.redeem-admin-page__token:focus,
.redeem-admin-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(2, 74, 216, 0.08);
}

/* 过滤器控制条 */
.list-filter-bar {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.filter-input {
  height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.filter-input:focus {
  border-color: var(--primary);
}

.filter-select {
  height: 38px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

/* 卡密列表 */
.redeem-admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.redeem-admin-list__item {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #ffffff;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  overflow: hidden;
}

.redeem-admin-list__item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3.5px;
  background: #cbd5e1;
  transition: background 0.2s;
}

.redeem-admin-list__item.item-status--active::before {
  background: #22c55e;
}

.redeem-admin-list__item.item-status--unused::before {
  background: #3b82f6;
}

.redeem-admin-list__item.item-status--disabled::before {
  background: #94a3b8;
}

.redeem-admin-list__item:hover {
  border-color: rgba(59, 130, 246, 0.25);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.redeem-admin-list__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.code-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.code-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.code-box:hover {
  background: #eff6ff;
  border-color: rgba(59, 130, 246, 0.35);
}

.code-box:hover .code-text {
  color: #2563eb;
}

.code-box:hover .code-copy-btn {
  color: #2563eb;
  background: #ffffff;
}

.code-text {
  font-family: "JetBrains Mono", "Cascadia Code", "SF Mono", Consolas, monospace;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #0f172a;
  line-height: 1.2;
}

.code-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.18s;
  flex-shrink: 0;
  padding: 0;
}

.code-copy-btn svg {
  width: 13px;
  height: 13px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  line-height: 1.4;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.unused {
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.18);
}

.status-badge.active {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.18);
}

.status-badge.active .status-dot {
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}

.status-badge.disabled {
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* 结构化元数据行 */
.code-meta-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 6px;
}

.meta-chip--muted {
  font-weight: 500;
  color: #64748b;
}

.meta-chip--note {
  background: #fefce8;
  border-color: #fef08a;
  color: #854d0e;
  font-weight: 600;
}

.meta-icon {
  width: 13px;
  height: 13px;
  opacity: 0.75;
  flex-shrink: 0;
}

.redeem-admin-list__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
  min-height: 28px;
  border-radius: 6px;
}

.btn-danger {
  background: transparent;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.btn-danger:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
}

.btn-danger:disabled {
  border-color: var(--border);
  color: var(--text-3);
  cursor: not-allowed;
  opacity: 0.45;
}

.btn-table-danger {
  background: transparent;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 11.5px;
  padding: 4px 10px;
  min-height: 26px;
  border-radius: 4px;
}

.btn-table-danger:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
}

/* 激活的设备详情区 */
.redeem-admin-list__devices {
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.devices-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.devices-count {
  font-size: 11px;
  font-family: var(--font-mono);
  background: #f1f5f9;
  color: #475569;
  padding: 1px 6px;
  border-radius: 4px;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
}

.device-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  border-radius: 8px;
  position: relative;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.device-chip:hover {
  border-color: rgba(59, 130, 246, 0.3);
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.device-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-icon-wrap svg {
  width: 15px;
  height: 15px;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
  padding-right: 18px;
}

.dev-id {
  font-family: "JetBrains Mono", "Cascadia Code", "SF Mono", Consolas, monospace;
  font-size: 11.5px;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-id:hover {
  color: #2563eb;
  text-decoration: underline;
}

.dev-time {
  font-size: 10.5px;
  color: #94a3b8;
}

/* 设备解绑按钮 */
.device-unbind-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  transition: all 0.18s;
}

.device-unbind-btn svg {
  width: 13px;
  height: 13px;
}

.device-unbind-btn:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.list-empty,
.table-empty {
  text-align: center;
  color: var(--text-3);
  padding: 32px !important;
  font-style: normal;
  font-size: 14px;
}

.list-empty {
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.list-empty .empty-icon,
.table-empty .empty-icon {
  width: 40px;
  height: 40px;
  color: #b6c2d4;
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 使用记录表格 */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #ffffff;
}

.usages-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.usages-table th,
.usages-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.usages-table th {
  font-weight: 700;
  color: #64748b;
  background: #f8fafc;
  font-size: 11.5px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.usages-table tbody tr {
  transition: background 0.15s ease;
}

.usages-table tbody tr:hover {
  background: #f8fbff;
}

.td-device-id {
  min-width: 200px;
}

.device-id-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.device-id-badge:hover {
  background: #eff6ff;
  border-color: rgba(59, 130, 246, 0.35);
}

.device-id-badge:hover .device-id-text {
  color: #2563eb;
}

.device-id-badge:hover .device-id-copy {
  color: #2563eb;
  opacity: 1;
}

.device-id-icon-wrap {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-id-icon-wrap svg {
  width: 13px;
  height: 13px;
}

.device-id-text {
  font-family: "JetBrains Mono", "Cascadia Code", "SF Mono", Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.device-id-copy {
  width: 13px;
  height: 13px;
  color: #94a3b8;
  opacity: 0.6;
  transition: all 0.18s;
  flex-shrink: 0;
}

/* 使用量进度复合单元格 */
.td-count-bar {
  min-width: 150px;
}

.usage-stat-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.count-pill {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.count-pill em {
  font-style: normal;
  font-weight: 800;
  color: #2563eb;
}

.share-percent {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  font-family: var(--font-mono);
}

.bar-container {
  width: 100%;
  height: 5px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #2563eb);
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* 时间单元格 */
.time-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.time-main {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  font-family: var(--font-mono);
}

.time-sub {
  font-size: 10.5px;
  color: #94a3b8;
  font-family: var(--font-mono);
}

.td-action {
  white-space: nowrap;
}

.btn-icon-reset {
  width: 12px;
  height: 12px;
  margin-right: 2px;
}

.code-pagination,
.usage-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.code-pagination__meta,
.usage-pagination__meta {
  font-size: 12.5px;
  color: var(--text-3);
  font-weight: 500;
}

.code-pagination__actions,
.usage-pagination__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 批量导出磨砂弹窗 */
.export-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.export-modal-card {
  width: min(100%, 540px);
  max-height: 88vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #ffffff, #f7faff);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.15);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

.export-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 12px;
}

.export-modal-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.export-modal-close {
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-3);
  cursor: pointer;
  line-height: 1;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.export-modal-close:hover {
  background: #fff1f0;
  color: #ff4d4f;
}

.export-modal-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
  line-height: 1.4;
}

.export-modal-textarea {
  width: 100%;
  height: 180px;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: #fafcff;
  color: var(--text);
  font-family: monospace;
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
  resize: none;
  outline: none;
}

.export-modal-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(2, 74, 216, 0.08);
}

.export-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

/* 模态弹窗动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .export-modal-card {
  transform: scale(0.95) translateY(10px);
}

.modal-fade-leave-to .export-modal-card {
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 900px) {
  .redeem-admin-page {
    padding: 20px 0 36px;
    gap: 18px;
  }

  .redeem-admin-page__hero {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .redeem-admin-page__hero h1 {
    font-size: 24px;
    line-height: 1.15;
  }

  .redeem-admin-page__hero-actions {
    justify-content: space-between;
  }

  .redeem-admin-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .metric-card {
    padding: 16px;
    gap: 12px;
    align-items: flex-start;
    min-height: 124px;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .metric-icon svg {
    width: 20px;
    height: 20px;
  }

  .metric-value {
    font-size: 20px;
  }

  .redeem-admin-tabs {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tab-btn {
    justify-content: center;
    padding-inline: 12px;
  }

  .redeem-admin-page__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .redeem-admin-card,
  .redeem-admin-gate__card {
    padding: 20px;
    border-radius: 16px;
  }

  .redeem-admin-card h2,
  .redeem-admin-card__head h2 {
    font-size: 16px;
  }

  .redeem-admin-card__head {
    flex-direction: column;
    align-items: stretch;
  }

  .redeem-admin-card__head-actions {
    justify-content: stretch;
  }

  .redeem-admin-card__head-actions > * {
    flex: 1 1 0;
  }

  .list-filter-bar {
    grid-template-columns: 1fr;
    padding: 10px;
  }

  .redeem-admin-list__main {
    flex-direction: column;
    gap: 12px;
  }

  .redeem-admin-list__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .redeem-admin-list__actions .btn {
    width: 100%;
  }

  .devices-grid {
    grid-template-columns: 1fr;
  }

  .device-chip {
    min-height: 52px;
    padding-right: 28px;
  }

  .table-responsive {
    overflow-x: visible;
  }

  .usages-table,
  .usages-table tbody,
  .usages-table tr,
  .usages-table td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .usages-table thead {
    display: none;
  }

  .usages-table tbody {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .usages-table tr {
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    background: #ffffff;
  }

  .usages-table td {
    border-bottom: none;
    padding: 0;
  }

  .usages-table td + td {
    margin-top: 12px;
  }

  .usages-table td::before {
    content: attr(data-label);
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-3);
  }

  .td-device-id .copy-badge {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .td-count .count-bubble {
    display: inline-flex;
  }

  .td-progress {
    width: 100%;
  }

  .bar-container {
    width: 100%;
  }

  .td-action {
    text-align: left !important;
  }

  .td-action .btn {
    width: 100%;
  }

  .usage-pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .usage-pagination__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .usage-pagination__actions .btn {
    width: 100%;
  }

  .table-empty {
    padding: 20px !important;
  }

  .export-modal-card {
    padding: 18px;
    border-radius: 16px;
  }

  .export-modal-head,
  .export-modal-foot {
    flex-direction: column;
    align-items: stretch;
  }

  .export-modal-foot .btn {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .redeem-admin-page {
    width: min(calc(100% - 24px), var(--content-width));
  }

  .redeem-admin-page__hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .redeem-admin-badge,
  .redeem-admin-page__hero-actions .btn {
    justify-content: center;
    width: 100%;
  }

  .redeem-admin-metrics {
    grid-template-columns: 1fr;
  }

  .metric-card {
    min-height: auto;
    align-items: center;
  }

  .code-meta {
    line-height: 1.6;
  }

  .code-note {
    width: 100%;
    box-sizing: border-box;
  }

  .redeem-admin-list__item {
    padding: 14px;
  }

  .tab-btn {
    min-height: 48px;
    font-size: 15px;
  }

  .redeem-admin-page__token,
  .redeem-admin-input,
  .filter-input,
  .filter-select {
    min-height: 44px;
    font-size: 16px;
  }
}
</style>
