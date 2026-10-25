export const DEFAULT_EDITOR_STATE = {
  nodes: [
    { type: 'start', label: '开始' },
    { type: 'io', label: '提交请假申请' },
    { type: 'process', label: '系统校验申请材料' },
    { type: 'decision', label: '材料是否完整' },
    { type: 'process', label: '部门主管审批' },
    { type: 'decision', label: '主管是否通过' },
    { type: 'process', label: '人事备案并更新考勤' },
    { type: 'io', label: '通知申请人审批结果' },
    { type: 'end', label: '结束' }
  ],
  links: [
    { sourceLabel: '开始', targetLabel: '提交请假申请', label: '' },
    { sourceLabel: '提交请假申请', targetLabel: '系统校验申请材料', label: '' },
    { sourceLabel: '系统校验申请材料', targetLabel: '材料是否完整', label: '' },
    { sourceLabel: '材料是否完整', targetLabel: '部门主管审批', label: '是' },
    { sourceLabel: '材料是否完整', targetLabel: '提交请假申请', label: '否' },
    { sourceLabel: '部门主管审批', targetLabel: '主管是否通过', label: '' },
    { sourceLabel: '主管是否通过', targetLabel: '人事备案并更新考勤', label: '是' },
    { sourceLabel: '主管是否通过', targetLabel: '通知申请人审批结果', label: '否' },
    { sourceLabel: '人事备案并更新考勤', targetLabel: '通知申请人审批结果', label: '' },
    { sourceLabel: '通知申请人审批结果', targetLabel: '结束', label: '' }
  ]
};
