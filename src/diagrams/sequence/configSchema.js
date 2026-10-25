export const configSchema = {
    columns: 3,
    groups: [
        {
            id: 'text-style',
            label: '文字样式',
            dotColor: 'dot-orange',
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
                        { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
                        { label: 'Georgia', value: 'Georgia, serif' }
                    ]
                },
                { key: 'FONT_SIZE', type: 'slider', label: '正文字号', min: 10, max: 24, step: 1, unit: 'px' },
                {
                    key: 'FONT_WEIGHT',
                    type: 'select',
                    label: '正文字重',
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
            id: 'participant-style',
            label: '参与者设置',
            dotColor: 'dot-blue',
            controls: [
                { key: 'PARTICIPANT_MIN_WIDTH', type: 'slider', label: '最小宽度', min: 90, max: 220, step: 2, unit: 'px' },
                { key: 'PARTICIPANT_HEAD_HEIGHT', type: 'slider', label: '头部高度', min: 42, max: 96, step: 2, unit: 'px' },
                { key: 'PARTICIPANT_GAP', type: 'slider', label: '参与者间距', min: 40, max: 140, step: 2, unit: 'px' }
            ]
        },
        {
            id: 'message-style',
            label: '消息与备注',
            dotColor: 'dot-green',
            controls: [
                { key: 'MESSAGE_ROW_HEIGHT', type: 'slider', label: '消息行高', min: 32, max: 72, step: 2, unit: 'px' },
                { key: 'ROW_GAP', type: 'slider', label: '行间距', min: 8, max: 40, step: 2, unit: 'px' },
                { key: 'SELF_LOOP_WIDTH', type: 'slider', label: '自调用宽度', min: 36, max: 120, step: 2, unit: 'px' },
                { key: 'SELF_LOOP_HEIGHT', type: 'slider', label: '自调用高度', min: 20, max: 72, step: 2, unit: 'px' },
                { key: 'NOTE_MAX_WIDTH', type: 'slider', label: '备注最大宽', min: 160, max: 360, step: 4, unit: 'px' },
                { key: 'LINE_WIDTH', type: 'slider', label: '线条粗细', min: 1, max: 4, step: 0.5, unit: 'px' }
            ]
        }
    ]
};

