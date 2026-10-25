import { defineAsyncComponent } from 'vue';
import { defaultConfig } from './defaultConfig.js';
import { configSchema } from './configSchema.js';

const ClassDiagramWorkspace = defineAsyncComponent(() => import('./ClassDiagramWorkspace.vue'));

export default {
    type: 'classdiagram',
    label: '类图',
    icon: '🧩',
    WorkspaceComponent: ClassDiagramWorkspace,
    defaultConfig,
    configSchema
};
