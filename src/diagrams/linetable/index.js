import { defineAsyncComponent } from 'vue';
import { defaultConfig } from './defaultConfig.js';
import { configSchema } from './configSchema.js';

const LinetableWorkspace = defineAsyncComponent(() => import('./LinetableWorkspace.vue'));

export default {
    type: 'linetable',
    label: '三线表',
    icon: '📋',
    WorkspaceComponent: LinetableWorkspace,
    defaultConfig,
    configSchema
};
