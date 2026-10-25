export const configSchema = {
    groups: [
        {
            id: 'text-style',
            label: '文字样式',
            dotColor: 'dot-orange',
            controls: [
                {
                    key: 'FONT_FAMILY',
                    type: 'select',
                    label: '字体选择',
                    options: [
                        { label: '微软雅黑', value: 'Microsoft YaHei, SimHei, sans-serif' },
                        { label: '宋体', value: 'SimSun, serif' },
                        { label: '楷体', value: 'KaiTi, serif' },
                        { label: '黑体', value: 'SimHei, sans-serif' }
                    ]
                },
                {
                    key: 'FONT_WEIGHT',
                    type: 'select',
                    label: '字体粗细',
                    options: [
                        { label: '常规', value: 'normal' },
                        { label: '粗体', value: 'bold' },
                        { label: '特粗', value: 'bolder' }
                    ]
                },
                { key: 'FONT_SIZE', type: 'slider', label: '字体大小', min: 10, max: 30, step: 1, unit: 'px' }
            ]
        },
        {
            id: 'entity-style',
            label: '实体样式',
            dotColor: 'dot-blue',
            controls: [
                { key: 'ENTITY_WIDTH', type: 'slider', label: '实体宽度', min: 100, max: 300, step: 1, unit: 'px' },
                { key: 'ENTITY_HEIGHT', type: 'slider', label: '实体高度', min: 40, max: 120, step: 1, unit: 'px' },
                { key: 'ENTITY_BORDER_WIDTH', type: 'slider', label: '实体边框', min: 1, max: 5, step: 0.5, unit: 'px' },
                { key: 'CONN_LINE_WIDTH', type: 'slider', label: '连线粗细', min: 1, max: 5, step: 0.5, unit: 'px' }
            ]
        },
        {
            id: 'attr-style',
            label: '属性样式',
            dotColor: 'dot-green',
            controls: [
                { key: 'ATTR_RX', type: 'slider', label: '椭圆宽度', min: 40, max: 120, step: 1, unit: 'px' },
                { key: 'ATTR_RY', type: 'slider', label: '椭圆高度', min: 20, max: 60, step: 1, unit: 'px' },
                { key: 'ATTR_BORDER_WIDTH', type: 'slider', label: '属性边框', min: 1, max: 5, step: 0.5, unit: 'px' },
                { key: 'RADIUS', type: 'slider', label: '放射半径', min: 150, max: 800, step: 1, unit: 'px' }
            ]
        },
        {
            id: 'operations',
            label: '操作',
            dotColor: 'dot-check',
            controls: [
                { key: 'SHOW_PK_UNDERLINE', type: 'toggle', label: '主键下划线' },
                { key: 'SHOW_FK_WAVY', type: 'toggle', label: '外键波浪线' },
                { key: 'COMPACT_ATTR_LAYOUT', type: 'toggle', label: '紧凑属性布局' }
            ]
        }
    ]
};
