/**
 * 渲染进程的环境变量和全局类型声明文件
 */

/// <reference types="vite/client" />

/**
 * 声明 .vue 文件的模块定义
 * 使得 TypeScript 能够识别并导入 Vue 组件文件
 * 这里有个小问题，这么设置后，即使导入不存在的组件也不会报错
 * 这个设计是为了让 Vue 3 TypeScript 项目能够识别 .vue 文件，但副作用是即使 .vue 文件不存在，TypeScript 也不会报错。
 * 如果移除这个设置，会导致每个vue组件都需要明确声明类型，工作量会大幅增加，这也是为什么大多数 Vue 项目都采用现在这种宽松的做法。
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // 原代码: DefineComponent<{}, {}, any>
  // 使用 Record<string, never> 替代 {} 避免 ESLint 报错，但保持相同的宽松类型检查
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}
