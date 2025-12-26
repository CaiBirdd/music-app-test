/**
 * 全局注册 Element Plus 图标组件
 * 该插件会遍历 @element-plus/icons-vue 中的所有图标并将其注册到 Vue 实例中
 */
import {App, Component} from "vue";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default (app: App) => {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component as Component)
  }
}