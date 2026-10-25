import { defineAsyncComponent } from 'vue';
import { defaultConfig } from './defaultConfig.js';
import { configSchema } from './configSchema.js';

const UsecaseWorkspace = defineAsyncComponent(() => import('./UsecaseWorkspace.vue'));

export default {
    type: 'usecase',
    label: '用例图',
    icon: '👤',
    WorkspaceComponent: UsecaseWorkspace,
    defaultConfig,
    configSchema
};
