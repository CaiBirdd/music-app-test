import Tabs from '@/components/Tabs/index.vue'
import TabPane from '@/components/Tabs/TabPane.vue'
import BaseButton from '@/components/BaseButton/index.vue'
import Card from '@/components/Card/index.vue'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Tabs: typeof Tabs
    TabPane: typeof TabPane
    BaseButton: typeof BaseButton
    Card: typeof Card
  }
}

export {}
// 用途：告诉 TypeScript/IDE，这些组件（Tabs、TabPane、BaseButton、Card）是全局可用的，模板里用它们不会报类型错误。
//效果：在模板里直接写 <Tabs/> 时能获得自动完成和类型检查。
