<template>
  <div class="panel table-list-panel">
    <div class="panel-header">
      <span class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25v1.5c0 .621.504 1.125 1.125 1.125m17.25-5.25v1.5c0 .621-.504 1.125-1.125 1.125M22.5 8.25v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 10.875v1.5c0 .621.504 1.125 1.125 1.125m17.25-5.25v1.5c0 .621-.504 1.125-1.125 1.125M22.5 10.875v1.5c0 .621-.504 1.125-1.125 1.125" />
        </svg>
      </span> 实体列表
    </div>
    <div class="panel-body">
      <div id="table-list">
        <!-- Empty State -->
        <div v-if="tables.length === 0" class="empty-table-list">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 10h18M3 14h18M3 6h18M3 18h18" />
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <p>暂无数据表</p>
          <p style="font-size: 11px; margin-top: 4px;">输入 SQL 语句后解析显示</p>
        </div>

        <!-- Table List -->
        <div v-else>
          <div 
            v-for="(table, index) in tables" 
            :key="index"
            class="table-card"
            :class="{ active: index === activeIndex }"
          >
            <!-- Header -->
            <div class="table-card-header-container" @click="onCardClick(index)">
              <span 
                class="toggle-btn" 
                :class="{ collapsed: !expandedIndices.includes(index) }"
                @click.stop="toggleExpand(index)"
              >
                <svg v-if="!expandedIndices.includes(index)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="svg-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
              <div class="table-card-title">
                <div class="main-title">{{ table.comment || table.name }}</div>
                <div class="sub-title">{{ table.name }}</div>
              </div>
            </div>

            <!-- Columns -->
            <ul class="table-card-columns" v-show="expandedIndices.includes(index)">
              <li v-for="(col, cIndex) in table.columns" :key="cIndex">
                <input 
                  v-model="col.comment" 
                  class="col-name-input"
                  :class="{ pk: col.isPrimaryKey }"
                >
                <span class="col-type">{{ col.type }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  tables: {
    type: Array,
    required: true
  },
  activeIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:activeIndex']);

const expandedIndices = ref([]);

function toggleExpand(index) {
  const i = expandedIndices.value.indexOf(index);
  if (i > -1) {
    expandedIndices.value.splice(i, 1);
  } else {
    expandedIndices.value.push(index);
  }
}

function onCardClick(index) {
  emit('update:activeIndex', index);
}
</script>

<style scoped>
/* Inherits from main.css */
</style>
