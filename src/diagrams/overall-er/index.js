import { defineAsyncComponent } from 'vue';

const OverallERWorkspace = defineAsyncComponent(() => import('./OverallERWorkspace.vue'));

export default {
    type: 'overall-er',
    label: '总体 ER 图',
    icon: '🔗',
    hideGlobalParamsPanel: true,
    WorkspaceComponent: OverallERWorkspace,
    defaultConfig: {},
    configSchema: null
};
