import { defineAsyncComponent } from 'vue';
import { defaultConfig } from './defaultConfig.js';
import { configSchema } from './configSchema.js';

const FlowchartWorkspace = defineAsyncComponent(() => import('./FlowchartWorkspace.vue'));

export default {
    type: 'flowchart',
    label: '流程图',
    icon: '🔀',
    WorkspaceComponent: FlowchartWorkspace,
    defaultConfig,
    configSchema
};
