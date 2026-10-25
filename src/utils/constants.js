export const PRESET_SQL = `CREATE TABLE users (
  id BIGINT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  phone VARCHAR(20) COMMENT '手机号',
  email VARCHAR(100) COMMENT '邮箱',
  created_at DATETIME COMMENT '创建时间'
) COMMENT='用户信息';

CREATE TABLE orders (
  id BIGINT PRIMARY KEY COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  order_no VARCHAR(50) NOT NULL COMMENT '订单编号',
  total_amount DECIMAL(10,2) COMMENT '订单金额',
  status VARCHAR(20) COMMENT '订单状态',
  created_at DATETIME COMMENT '创建时间',
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='订单信息';

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY COMMENT '明细ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  product_name VARCHAR(100) NOT NULL COMMENT '商品名称',
  quantity INT NOT NULL COMMENT '数量',
  unit_price DECIMAL(10,2) COMMENT '单价',
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
) COMMENT='订单明细';`;

export const SLIDER_MAP = {
  'param-entity-font-size': { key: 'ENTITY_FONT_SIZE', suffix: 'px', min: 12, max: 30, step: 1 },
  'param-attr-font-size': { key: 'ATTR_FONT_SIZE', suffix: 'px', min: 10, max: 24, step: 1 },
  'param-entity-width': { key: 'ENTITY_WIDTH', suffix: 'px', min: 100, max: 300, step: 10 },
  'param-entity-height': { key: 'ENTITY_HEIGHT', suffix: 'px', min: 40, max: 120, step: 5 },
  'param-entity-border-width': { key: 'ENTITY_BORDER_WIDTH', suffix: 'px', min: 1, max: 5, step: 0.5 },
  'param-attr-border-width': { key: 'ATTR_BORDER_WIDTH', suffix: 'px', min: 1, max: 5, step: 0.5 },
  'param-conn-line-width': { key: 'CONN_LINE_WIDTH', suffix: 'px', min: 1, max: 5, step: 0.5 },
  'param-attr-rx': { key: 'ATTR_RX', suffix: 'px', min: 40, max: 120, step: 5 },
  'param-attr-ry': { key: 'ATTR_RY', suffix: 'px', min: 20, max: 60, step: 2 },
  'param-radius': { key: 'RADIUS', suffix: 'px', min: 150, max: 800, step: 10 }
};
