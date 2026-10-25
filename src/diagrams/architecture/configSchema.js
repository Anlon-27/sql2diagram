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
                },
                { key: 'TITLE_FONT_SIZE', type: 'slider', label: '标题字号', min: 16, max: 32, step: 1, unit: 'px' },
                {
                    key: 'TITLE_FONT_WEIGHT',
                    type: 'select',
                    label: '标题字重',
                    options: [
                        { label: '中等', value: 500 },
                        { label: '加粗', value: 600 },
                        { label: '更粗', value: 700 }
                    ]
                }
            ]
        },
        {
            id: 'layout-style',
            label: '布局间距',
            dotColor: 'dot-green',
            controls: [
                { key: 'SIBLING_GAP', type: 'slider', label: '同级间距', min: 16, max: 80, step: 2, unit: 'px' },
                { key: 'LAYER_GAP', type: 'slider', label: '层级间距', min: 90, max: 220, step: 5, unit: 'px' }
            ]
        },
        {
            id: 'node-size',
            label: '节点尺寸',
            dotColor: 'dot-blue',
            controls: [
                { key: 'HORIZONTAL_WIDTH', type: 'slider', label: '横向宽度', min: 80, max: 220, step: 4, unit: 'px' },
                { key: 'HORIZONTAL_HEIGHT', type: 'slider', label: '横向高度', min: 32, max: 72, step: 2, unit: 'px' },
                { key: 'VERTICAL_WIDTH', type: 'slider', label: '竖向宽度', min: 42, max: 100, step: 2, unit: 'px' },
                { key: 'VERTICAL_HEIGHT', type: 'slider', label: '竖向高度', min: 90, max: 220, step: 4, unit: 'px' },
                { key: 'STROKE_WIDTH', type: 'slider', label: '边缘宽度', min: 1, max: 4, step: 1, unit: 'px' }
            ]
        }
    ]
};
