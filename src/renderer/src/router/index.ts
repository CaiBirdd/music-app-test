import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useFlags } from '@/store/flags'
import pinia from '@/store/store'
import { parsePathQuery } from '@/utils'

/**
 * 创建路由实例
 * 使用 Hash 模式，并配置路由表和滚动行为
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
  scrollBehavior: () => ({ top: 0 })
})

// 保存原始的 push 方法
const originPush = router.push
const flags = useFlags(pinia)

/**
 * 重写 router.push 方法
 * 每次跳转时自动在 query 中添加或累加 count 参数，用于记录页面跳转深度或实现类似多级路由的效果
 */
router.push = (params) => {
  let to
  // 获取当前路由的 count，如果不存在则默认为 0
  let count = +router.currentRoute.value.query.count!

  if (typeof params === 'string') {
    // 处理字符串形式的跳转路径
    const result = parsePathQuery(params)
    to = {
      path: result.path,
      query: {
        count: ++count,
        ...result.query
      }
    }
  } else {
    // 处理对象形式的跳转参数
    to = {
      ...params,
      query: {
        ...params.query,
        count: ++count
      }
    }
  }
  // 调用原始 push 方法执行跳转
  return originPush(to)
}

/**
 * 全局前置守卫
 * 1. 确保每个路由都有 count 参数（默认为 1）
 * 2. 记录并更新最大跳转深度 maxCount
 */
router.beforeEach((to, from, next) => {
  const count = to.query.count
  if (!count) {
    // 如果没有 count，重定向到带 count=1 的路由
    next({
      ...to,
      query: {
        ...to.query,
        count: 1
      }
    })
  } else {
    // 更新全局状态中的最大计数值
    if (+count > flags.maxCount) {
      flags.maxCount = +count
    }
    next()
  }
})

export default router
