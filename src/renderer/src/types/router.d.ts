/**
 * 扩展 vue-router 的类型定义
 * 
 * 注意：必须保留顶部的 `import 'vue-router'`。
 * 在 TypeScript 中，只有包含顶层 import/export 的文件才会被视为模块。
 * 只有在模块上下文中，`declare module 'vue-router'` 才会执行“模块扩展（Augmentation）”而非“模块覆盖”。
 * 如果删除该 import，TypeScript 将会覆盖整个 vue-router 模块，导致 createRouter 等原始成员丢失。
 */
import 'vue-router'

declare module 'vue-router' {
  interface LocationQuery {
    uid?: number // 用户id
    key?: string // 搜索关键字
    id: number // 歌单歌曲id
    count: number // 当前分页
    position?: 1 // 用于songList组件定位到歌曲
  }
}
