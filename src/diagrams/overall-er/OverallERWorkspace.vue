<template>
  <div class="overall-er-workspace">
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      class="overall-er-iframe"
      frameborder="0"
      allowfullscreen
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  config: { type: Object, default: () => ({}) }
});

const iframeRef = ref(null);
const iframeSrc = '/sql2er/sql2er.html';
</script>

<style scoped>
.overall-er-workspace {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 820px;
  background: transparent;
  border-radius: 0;
  overflow: visible;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  margin-top: 12px;
  padding-bottom: 24px;
}

.overall-er-iframe {
  flex: 1;
  border: none;
  display: block;
  min-height: 820px;
  height: 100%;
  width: 100%;
}

@media (max-width: 960px) {
  .overall-er-workspace {
    min-height: 720px;
  }
}
</style>
