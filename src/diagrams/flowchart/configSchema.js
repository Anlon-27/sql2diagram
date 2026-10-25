export const configSchema = {
    columns: 3,
    groups: [
        {
            id: 'text-style',
            label: '文字样式',
            dotColor: 'dot-purple',
            controls: [
                {
                    key: 'CN_FONT_FAMILY',
                    type: 'select',
                    label: '中文字体',
                    options: [
                        { label: '微软雅黑', value: 'Microsoft YaHei, SimHei, sans-serif' },
                        { label: '宋体', value: 'SimSun, serif' },
                        { label: '楷体', value: 'KaiTi, serif' },
                        { label: '黑体', value: 'SimHei, sans-serif' }
                    ]
                },
                {
                    key: 'EN_FONT_FAMILY',
                    type: 'select',
                    label: '英文字体',
                    options: [
                        { label: 'Times New Roman', value: 'Times New Roman, serif' },
                        { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
                        { label: 'Georgia', value: 'Georgia, serif' },
                        { label: 'Courier New', value: 'Courier New, monospace' }
                    ]
                },
                { key: 'FONT_SIZE', type: 'slider', label: '字号', min: 10, max: 24, step: 1, unit: 'px' },
                {
                    key: 'FONT_WEIGHT',
                    type: 'select',
                    label: '字重',
                    options: [
                        { label: '常规', value: 400 },
                        { label: '中等', value: 500 },
                        { label: '加粗', value: 600 },
                        { label: '更粗', value: 700 }
                    ]
                }
            ]
        },
        {
            id: 'node-style',
            label: '节点尺寸',
            dotColor: 'dot-blue',
            controls: [
                { key: 'NODE_MIN_WIDTH', type: 'slider', label: '普通节点宽', min: 90, max: 240, step: 2, unit: 'px' },
                { key: 'NODE_MIN_HEIGHT', type: 'slider', label: '普通节点高', min: 42, max: 100, step: 2, unit: 'px' },
                { key: 'DECISION_MIN_WIDTH', type: 'slider', label: '判断节点宽', min: 120, max: 280, step: 2, unit: 'px' },
                { key: 'DECISION_MIN_HEIGHT', type: 'slider', label: '判断节点高', min: 72, max: 180, step: 2, unit: 'px' },
                { key: 'ARROW_WIDTH', type: 'slider', label: '箭头宽度', min: 6, max: 18, step: 1, unit: 'px' }
            ]
        },
        {
            id: 'layout-style',
            label: '布局间距',
            dotColor: 'dot-green',
            controls: [
                { key: 'SIBLING_GAP', type: 'slider', label: '同级间距', min: 20, max: 100, step: 2, unit: 'px' },
                { key: 'LAYER_GAP', type: 'slider', label: '层级间距', min: 80, max: 200, step: 5, unit: 'px' },
                { key: 'LINE_WIDTH', type: 'slider', label: '连线粗细', min: 1, max: 4, step: 0.5, unit: 'px' }
            ]
        }
    ]
};
