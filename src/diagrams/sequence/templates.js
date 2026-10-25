export const TEMPLATE_PRESETS = [
  {
    key: 'login',
    label: '密码重置',
    description: '更接近毕业设计常见画法的密码重置时序图',
    source: `title: 密码重置时序图

actor 用户
participant 找回页面
participant 账号服务
participant 短信服务
database 数据库

用户 -> 找回页面: 输入手机号
找回页面 -> 账号服务: 请求发送重置验证码
账号服务 -> 短信服务: 下发验证码
短信服务 -->> 账号服务: 发送成功
用户 -> 找回页面: 输入新密码
找回页面 -> 账号服务: 提交验证码和新密码
账号服务 -> 数据库: 校验账号并更新密码
数据库 -->> 账号服务: 更新成功
账号服务 -->> 找回页面: 返回重置成功`
  },
  {
    key: 'order',
    label: '下单支付',
    description: '下单、扣库存、支付回调的完整流程',
    source: `title: 电商下单支付时序图

actor 用户
participant 前端页面
control 订单服务
control 库存服务
control 支付服务
database 订单库

用户 -> 前端页面: 提交订单
前端页面 -> 订单服务: 创建订单
订单服务 -> 库存服务: 预占库存
库存服务 -->> 订单服务: 返回结果

opt 库存充足
订单服务 -> 订单库: 保存订单
订单库 -->> 订单服务: 返回订单号
订单服务 -> 支付服务: 发起支付
支付服务 -->> 订单服务: 返回支付链接
订单服务 -->> 前端页面: 返回支付页
前端页面 -->> 用户: 展示支付二维码
end

note over 支付服务: 用户完成支付后会触发异步回调`
  },
  {
    key: 'approval',
    label: '审批流',
    description: '请假申请、主管审批、抄送通知',
    source: `title: 请假审批时序图

actor 员工
participant 请假页面
control 审批服务
participant 主管
participant 通知中心

员工 -> 请假页面: 填写请假申请
请假页面 -> 审批服务: 提交审批单
审批服务 -> 主管: 推送待审批消息

loop 审批轮询
主管 -> 审批服务: 提交审批结果
end

alt 审批通过
审批服务 -> 通知中心: 发送通过通知
通知中心 -->> 员工: 通知审批通过
else 审批驳回
审批服务 -> 通知中心: 发送驳回通知
通知中心 -->> 员工: 通知审批驳回
end`
  }
];

export const DEFAULT_INPUT = TEMPLATE_PRESETS[0].source;
