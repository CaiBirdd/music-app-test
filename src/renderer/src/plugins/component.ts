import type { App } from 'vue'

// Phase 2 占位：避免在 Phase 4 组件未创建前就产生 import 错误
export default (_app: App) => {
  // no-op
}