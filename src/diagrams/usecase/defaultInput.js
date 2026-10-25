export const DEFAULT_INPUT = `system: 电商平台

actor: 用户 | left

usecase: 注册登录 | 1
usecase: 浏览商品 | 1
usecase: 购物车管理 | 1
usecase: 提交订单 | 1
usecase: 订单查询 | 1
usecase: 身份校验 | 2
usecase: 商品检索 | 2
usecase: 库存校验 | 2
usecase: 支付处理 | 2
usecase: 订单状态同步 | 2

relation: 注册登录 -> 身份校验 | include
relation: 浏览商品 -> 商品检索 | include
relation: 购物车管理 -> 库存校验 | include
relation: 提交订单 -> 支付处理 | include
relation: 订单查询 -> 订单状态同步 | include`;
