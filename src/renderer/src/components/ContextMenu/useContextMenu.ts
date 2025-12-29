import { ref } from 'vue'

const MENU_KEY = Symbol('context-menu-key')

export const useContextMenu = (): any => {
  const activeMenu = ref(null)

  const setActiveMenu = (menu: any): void => {
    if (activeMenu.value && activeMenu.value !== menu) {
      // 前缀分号用于避免 ASI（自动分号插入）的潜在问题
      // 当一行代码以括号 ( 开头时，解析器可能误认为它是上一行的延续
      // 分号可以明确地告诉解析器这是一个新的语句，防止意外行为
      ;(activeMenu.value as any).hideMenu()
    }
    activeMenu.value = menu
  }

  return {
    MENU_KEY,
    activeMenu,
    setActiveMenu
  }
}
