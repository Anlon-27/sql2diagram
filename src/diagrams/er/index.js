import { defineAsyncComponent } from 'vue';
import { defaultConfig } from './defaultConfig.js';
import { configSchema } from './configSchema.js';

const ERWorkspace = defineAsyncComponent(() => import('./ERWorkspace.vue'));
const GuidePage = defineAsyncComponent(() => import('./GuidePage.vue'));

export default {
    type: 'er',
    label: 'ER 属性图',
    icon: '🗄️',
    GuideComponent: GuidePage,
    WorkspaceComponent: ERWorkspace,
    defaultConfig,
    configSchema
};
