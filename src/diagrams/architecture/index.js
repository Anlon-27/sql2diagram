import { defineAsyncComponent } from 'vue';
import { defaultConfig } from './defaultConfig.js';
import { configSchema } from './configSchema.js';

const ArchitectureWorkspace = defineAsyncComponent(() => import('./ArchitectureWorkspace.vue'));

export default {
    type: 'architecture',
    label: '系统架构图',
    icon: '🏗️',
    WorkspaceComponent: ArchitectureWorkspace,
    defaultConfig,
    configSchema
};
