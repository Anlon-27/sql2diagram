export const DEFAULT_EDITOR_STATE = {
  title: '电商平台类图',
  classes: [
    { type: 'class', name: '用户', fieldsText: '+用户ID: Long\n+用户名: String', methodsText: '+提交订单(): void' },
    { type: 'class', name: '订单', fieldsText: '+订单号: String\n+订单状态: String', methodsText: '+计算总额(): Decimal' },
    { type: 'class', name: '订单项', fieldsText: '+商品名称: String\n+数量: Int\n+成交单价: Decimal', methodsText: '+计算小计(): Decimal' }
  ],
  relations: [
    { sourceName: '用户', targetName: '订单', relationType: 'association', label: '', sourceCardinality: '1', targetCardinality: 'n' },
    { sourceName: '订单', targetName: '订单项', relationType: 'association', label: '', sourceCardinality: '1', targetCardinality: 'n' }
  ]
};
