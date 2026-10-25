export const configSchema = {
    groups: [
        {
            id: 'style',
            label: '样式设置',
            dotColor: 'dot-blue',
            controls: [
                {
                    key: 'CN_FONT_FAMILY',
                    type: 'select',
                    label: '中文字体',
                    options: [
                        { label: '微软雅黑', value: 'Microsoft YaHei, SimHei, sans-serif' },
                        { label: '黑体', value: 'SimHei, sans-serif' },
                        { label: '宋体', value: 'SimSun, serif' },
                        { label: '楷体', value: 'KaiTi, serif' }
                    ]
                },
                {
                    key: 'EN_FONT_FAMILY',
                    type: 'select',
                    label: '英文字体',
                    options: [
                        { label: 'Times New Roman', value: 'Times New Roman, serif' },
                        { label: 'Arial', value: 'Arial, sans-serif' },
                        { label: 'Georgia', value: 'Georgia, serif' }
                    ]
                },
                { key: 'FONT_SIZE', type: 'slider', label: '正文字号', min: 10, max: 20, step: 1, unit: 'px' },
                { key: 'LINE_WIDTH', type: 'slider', label: '线条粗细', min: 1, max: 4, step: 0.5, unit: 'px' }
            ]
        },
        {
            id: 'title',
            label: '标题设置',
            dotColor: 'dot-orange',
            controls: [
                { key: 'SHOW_TITLE', type: 'toggle', label: '显示标题' },
                { key: 'TITLE_FONT_SIZE', type: 'slider', label: '标题字号', min: 16, max: 28, step: 1, unit: 'px' },
                { key: 'TITLE_FONT_WEIGHT', type: 'slider', label: '标题字重', min: 500, max: 800, step: 100, unit: '' },
                { key: 'FONT_WEIGHT', type: 'slider', label: '正文字重', min: 400, max: 700, step: 100, unit: '' }
            ]
        },
        {
            id: 'node',
            label: '类框设置',
            dotColor: 'dot-green',
            controls: [
                { key: 'CLASS_MIN_WIDTH', type: 'slider', label: '类框最小宽', min: 140, max: 280, step: 2, unit: 'px' },
                { key: 'HEADER_MIN_HEIGHT', type: 'slider', label: '标题区最小高', min: 42, max: 90, step: 2, unit: 'px' },
                { key: 'SECTION_MIN_HEIGHT', type: 'slider', label: '分区最小高', min: 24, max: 70, step: 2, unit: 'px' }
            ]
        },
        {
            id: 'layout',
            label: '布局设置',
            dotColor: 'dot-blue',
            controls: [
                { key: 'COLUMN_GAP', type: 'slider', label: '列间距', min: 40, max: 160, step: 2, unit: 'px' },
                { key: 'ROW_GAP', type: 'slider', label: '行间距', min: 14, max: 70, step: 2, unit: 'px' }
            ]
        }
    ]
};
