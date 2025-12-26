/**
 * 渲染进程的环境变量和全局类型声明文件
 */

/// <reference types="vite/client" />

/**
 * 声明 .vue 文件的模块定义
 * 使得 TypeScript 能够识别并导入 Vue 组件文件
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
