export const TEMPLATE_PRESETS = [
  {
    key: 'ecommerce',
    label: '电商平台',
    description: '覆盖订单履约、支付与商品管理的复杂关系',
    source: `title: 电商订单履约类图

class 用户 {
  +用户ID: Long
  +用户名: String
  +手机号: String
  --
  +提交订单(): void
  +维护收货地址(): void
}

class 收货地址 {
  +地址ID: Long
  +收件人: String
  +联系电话: String
  +详细地址: String
  --
  +设为默认地址(): void
}

class 订单 {
  +订单号: String
  +订单状态: String
  +创建时间: DateTime
  +订单总额: Decimal
  --
  +计算总额(): Decimal
  +取消订单(): Boolean
}

class 订单项 {
  +订单项ID: Long
  +商品名称: String
  +数量: Int
  +成交单价: Decimal
  --
  +计算小计(): Decimal
}

class 商品 {
  +商品ID: Long
  +商品名称: String
  +销售单价: Decimal
  +库存数量: Int
  --
  +扣减库存(): Boolean
}

class 优惠券 {
  +券编号: String
  +优惠类型: String
  +优惠金额: Decimal
  --
  +校验有效性(): Boolean
}

abstract 支付记录 {
  +支付流水号: String
  +支付状态: String
  +支付时间: DateTime
  --
  +发起支付(): Boolean
  +退款(): Boolean
}

class 在线支付 {
  +第三方交易号: String
  +支付渠道: String
  --
  +查询支付结果(): String
}

interface 支付网关 {
  --
  +统一下单(): String
  +关闭交易(): Boolean
}

用户 "1" --> "n" 收货地址
用户 "1" --> "n" 订单
订单 "1" *--> "n" 订单项
订单项 "n" --> "1" 商品
订单 "1" o--> "0..1" 优惠券
订单 "1" --> "1" 在线支付
在线支付 --|> 支付记录
在线支付 ..|> 支付网关`
  },
  {
    key: 'library',
    label: '图书借阅',
    description: '读者、借阅单、图书的简单关系',
    source: `title: 图书借阅系统类图

class 读者 {
  +读者编号: String
  +姓名: String
  --
  +借阅图书(): void
}

class 借阅记录 {
  +借阅日期: Date
  +应还日期: Date
  --
  +归还(): void
}

class 图书 {
  +图书编号: String
  +书名: String
  --
  +借出(): Boolean
}

读者 "1" --> "n" 借阅记录
图书 "1" --> "n" 借阅记录`
  },
  {
    key: 'course',
    label: '选课管理',
    description: '学生、课程、选课记录的简单关系',
    source: `title: 选课管理类图

class 学生 {
  +学号: String
  +姓名: String
  --
  +选课(): void
}

class 课程 {
  +课程编号: String
  +课程名称: String
  +学分: Decimal
  --
  +开放选课(): void
}

class 选课记录 {
  +选课时间: Date
  +成绩: Decimal
  --
  +计算成绩(): Decimal
}

学生 "1" --> "n" 选课记录
课程 "1" --> "n" 选课记录`
  }
];

export const DEFAULT_INPUT = TEMPLATE_PRESETS[0].source;
