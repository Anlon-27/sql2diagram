export const DEFAULT_EDITOR_STATE = {
  system: '电商平台',
  actors: [{ label: '用户' }],
  usecases: [
    { label: '注册登录', level: 1 },
    { label: '浏览商品', level: 1 },
    { label: '购物车管理', level: 1 },
    { label: '提交订单', level: 1 },
    { label: '订单查询', level: 1 },
    { label: '身份校验', level: 2 },
    { label: '商品检索', level: 2 },
    { label: '库存校验', level: 2 },
    { label: '支付处理', level: 2 },
    { label: '订单状态同步', level: 2 }
  ],
  relations: [
    { sourceLabel: '注册登录', targetLabel: '身份校验', type: 'include', label: '' },
    { sourceLabel: '浏览商品', targetLabel: '商品检索', type: 'include', label: '' },
    { sourceLabel: '购物车管理', targetLabel: '库存校验', type: 'include', label: '' },
    { sourceLabel: '提交订单', targetLabel: '支付处理', type: 'include', label: '' },
    { sourceLabel: '订单查询', targetLabel: '订单状态同步', type: 'include', label: '' }
  ]
};
