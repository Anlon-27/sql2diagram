export const DEFAULT_EDITOR_STATE = {
  systemName: '体育馆预约管理系统',
  topNodes: [
    { name: '用户' },
    { name: '管理员' }
  ],
  bottomNodes: [
    { name: '注册登录', parentName: '用户' },
    { name: '场馆浏览', parentName: '用户' },
    { name: '提交预约', parentName: '用户' },
    { name: '我的预约', parentName: '用户' },
    { name: '用户管理', parentName: '管理员' },
    { name: '场馆管理', parentName: '管理员' },
    { name: '预约管理', parentName: '管理员' },
    { name: '数据统计', parentName: '管理员' }
  ]
};
