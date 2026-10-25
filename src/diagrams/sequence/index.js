import { defineAsyncComponent } from 'vue';
import { defaultConfig } from './defaultConfig.js';
import { configSchema } from './configSchema.js';

const SequenceWorkspace = defineAsyncComponent(() => import('./SequenceWorkspace.vue'));

export default {
    type: 'sequence',
    label: '时序图',
    icon: '⏱️',
    WorkspaceComponent: SequenceWorkspace,
    defaultConfig,
    configSchema
};
