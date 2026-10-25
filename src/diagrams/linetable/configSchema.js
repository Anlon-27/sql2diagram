export const configSchema = {
    columns: 5,
    groups: [
        {
            id: 'font-style',
            label: '字体与字号',
            dotColor: 'dot-orange',
            controls: [
                { key: 'CAPTION_FONT_SIZE', type: 'slider', label: '题注大小', min: 10, max: 22, step: 1, unit: 'px' },
                { key: 'CELL_FONT_SIZE', type: 'slider', label: '表格字体', min: 10, max: 20, step: 1, unit: 'px' },
                {
                    key: 'CN_FONT_FAMILY',
                    type: 'select',
                    label: '中文字体',
                    options: [
                        { label: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
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
                        { label: 'Arial', value: 'Arial, sans-serif' },
                        { label: 'Calibri', value: 'Calibri, sans-serif' },
                        { label: 'Cambria', value: 'Cambria, serif' },
                        { label: 'Georgia', value: 'Georgia, serif' },
                        { label: 'Tahoma', value: 'Tahoma, sans-serif' }
                    ]
                }
            ]
        },
        {
            id: 'cell-layout',
            label: '对齐与空值',
            dotColor: 'dot-blue',
            controls: [
                { key: 'CELL_LINE_HEIGHT', type: 'slider', label: '行距', min: 1, max: 3, step: 0.1 },
                { key: 'HEADER_CENTERED', type: 'toggle', label: '表头居中' },
                { key: 'CELL_CENTERED', type: 'toggle', label: '内容居中' },
                {
                    key: 'EMPTY_PLACEHOLDER',
                    type: 'select',
                    label: '空值占位符',
                    options: [
                        { label: '-', value: '-' },
                        { label: '/', value: '/' },
                        { label: '—', value: '—' },
                        { label: '无', value: '无' }
                    ]
                }
            ]
        },
        {
            id: 'line-style',
            label: '三线样式',
            dotColor: 'dot-green',
            controls: [
                { key: 'TOP_LINE_WIDTH', type: 'slider', label: '顶线', min: 0.5, max: 6, step: 0.25, unit: '磅' },
                { key: 'TOP_LINE_COLOR', type: 'color', label: '顶线颜色' },
                { key: 'MIDDLE_LINE_WIDTH', type: 'slider', label: '栏目线', min: 0.5, max: 3, step: 0.25, unit: '磅' },
                { key: 'MIDDLE_LINE_COLOR', type: 'color', label: '栏目线颜色' },
                { key: 'BOTTOM_LINE_WIDTH', type: 'slider', label: '底线', min: 0.5, max: 6, step: 0.25, unit: '磅' },
                { key: 'BOTTOM_LINE_COLOR', type: 'color', label: '底线颜色' },
                {
                    key: 'LINE_STYLE',
                    type: 'select',
                    label: '线型',
                    options: [
                        { label: '实线', value: 'solid' },
                        { label: '虚线', value: 'dashed' },
                        { label: '点线', value: 'dotted' }
                    ]
                }
            ]
        },
        {
            id: 'column-visibility',
            label: '列显示',
            dotColor: 'dot-check',
            controls: [
                { key: 'SHOW_NAME', type: 'toggle', label: '字段名称', editableLabelKey: 'LABEL_NAME' },
                { key: 'SHOW_TYPE', type: 'toggle', label: '类型', editableLabelKey: 'LABEL_TYPE' },
                { key: 'SHOW_COMMENT', type: 'toggle', label: '字段说明', editableLabelKey: 'LABEL_COMMENT' },
                { key: 'SHOW_LEN', type: 'toggle', label: '长度', editableLabelKey: 'LABEL_LEN' },
                { key: 'SHOW_NULL', type: 'toggle', label: '允许空', editableLabelKey: 'LABEL_NULL' },
                { key: 'SHOW_DEFAULT', type: 'toggle', label: '默认值', editableLabelKey: 'LABEL_DEFAULT' },
                { key: 'SHOW_IDX', type: 'toggle', label: '序号', editableLabelKey: 'LABEL_IDX' }
            ]
        },
        {
            id: 'column-widths',
            label: '列宽分配',
            dotColor: 'dot-orange',
            controls: [
                { key: 'COL_NAME_WIDTH', type: 'slider', label: '字段名称', min: 5, max: 40, step: 1, unit: '%' },
                { key: 'COL_TYPE_WIDTH', type: 'slider', label: '类型', min: 5, max: 40, step: 1, unit: '%' },
                { key: 'COL_COMMENT_WIDTH', type: 'slider', label: '字段说明', min: 5, max: 40, step: 1, unit: '%' },
                { key: 'COL_LEN_WIDTH', type: 'slider', label: '长度', min: 3, max: 25, step: 1, unit: '%' },
                { key: 'COL_NULL_WIDTH', type: 'slider', label: '允许空', min: 3, max: 25, step: 1, unit: '%' },
                { key: 'COL_DEFAULT_WIDTH', type: 'slider', label: '默认值', min: 5, max: 40, step: 1, unit: '%' },
                { key: 'COL_IDX_WIDTH', type: 'slider', label: '序号', min: 3, max: 20, step: 1, unit: '%' }
            ]
        }
    ]
};
