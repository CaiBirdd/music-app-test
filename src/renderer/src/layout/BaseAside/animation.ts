export const beforeEnter = (el) => {
  el.style.height = '0';
}
export const enter = (el) => {
  // 这里是一个简单的示例，实际可能需要根据内容动态计算高度
  el.style.height = el.scrollHeight + 'px';
}
export const afterEnter = (el) => {
  // 过渡完成后清除内联样式，使高度回到自动状态
  el.style.height = null;
}
export const beforeLeave = (el) => {
  el.style.height = el.scrollHeight + 'px';
}
export const leave = (el) => {
  el.style.height = '0';
}
export const afterLeave = (el) => {
  el.style.height = null;
}
// 为可折叠面板（如侧边栏子菜单）提供 Vue 过渡钩子（transition hooks），实现高度从 0 到内容高度的平滑展开与从内容高度到 0 的折叠动画。