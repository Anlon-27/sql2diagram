export const configSchema = {
    columns: 4,
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
                { key: 'FONT_WEIGHT', type: 'slider', label: '文字自重', min: 400, max: 700, step: 100, unit: '' },
                { key: 'LINE_WIDTH', type: 'slider', label: '线条粗细', min: 1, max: 4, step: 0.5, unit: 'px' }
            ]
        },
        {
            id: 'actor',
            label: '参与者设置',
            dotColor: 'dot-green',
            controls: [
                { key: 'ACTOR_WIDTH', type: 'slider', label: '人物宽度', min: 48, max: 90, step: 2, unit: 'px' },
                { key: 'ACTOR_HEIGHT', type: 'slider', label: '人物高度', min: 72, max: 140, step: 2, unit: 'px' },
                { key: 'ACTOR_GAP', type: 'slider', label: '纵向间距', min: 20, max: 80, step: 2, unit: 'px' },
                { key: 'ACTOR_SYSTEM_GAP', type: 'slider', label: '离系统距离', min: 32, max: 100, step: 2, unit: 'px' }
            ]
        },
        {
            id: 'usecase',
            label: '用例设置',
            dotColor: 'dot-blue',
            controls: [
                { key: 'USECASE_MIN_WIDTH', type: 'slider', label: '最小宽度', min: 110, max: 220, step: 2, unit: 'px' },
                { key: 'USECASE_MIN_HEIGHT', type: 'slider', label: '最小高度', min: 44, max: 90, step: 2, unit: 'px' },
                { key: 'USECASE_ROW_GAP', type: 'slider', label: '纵向间距', min: 12, max: 60, step: 2, unit: 'px' },
                { key: 'USECASE_COLUMN_GAP', type: 'slider', label: '层级间距', min: 40, max: 180, step: 2, unit: 'px' }
            ]
        },
        {
            id: 'boundary',
            label: '系统边界',
            dotColor: 'dot-orange',
            controls: [
                { key: 'SHOW_SYSTEM_BOUNDARY', type: 'toggle', label: '显示外框' },
                { key: 'SHOW_SYSTEM_LABEL', type: 'toggle', label: '显示名称' },
                { key: 'SYSTEM_PADDING_X', type: 'slider', label: '左右留白', min: 20, max: 90, step: 2, unit: 'px' },
                { key: 'SYSTEM_PADDING_TOP', type: 'slider', label: '顶部留白', min: 12, max: 60, step: 2, unit: 'px' },
                { key: 'SYSTEM_PADDING_BOTTOM', type: 'slider', label: '底部留白', min: 12, max: 60, step: 2, unit: 'px' }
            ]
        }
    ]
};
