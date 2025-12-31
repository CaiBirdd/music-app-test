import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useSettings } from '@/store/settings'
import { setActivePinia } from 'pinia'
import pinia from '@/store/store'

// 激活 Pinia 实例，确保可以在非组件上下文中使用 store
setActivePinia(pinia)

// 获取全局设置 store，用于读取 API 基础地址
const settings = useSettings()

/**
 * 创建 Axios 实例
 * - timeout: 30秒超时时间，防止请求长时间挂起
 * - baseURL: 从设置中读取 API 基础地址，支持动态切换服务器
 */
const request = axios.create({
  timeout: 30000,
  baseURL: settings.state.baseUrl
})

/**
 * 动态设置 API 基础地址
 * @param url - 新的基础 URL
 * 使用场景：用户在设置中切换服务器地址时调用
 */
export function setBaseURL(url: string) {
  request.defaults.baseURL = url
}

/**
 * 需要忽略状态码检查的接口路径列表
 * 这些接口可能返回特殊的状态码（如 800-803 二维码状态），需要业务层自行处理
 */
const ignoreState = ['/login/qr/check']

/**
 * 请求拦截器
 * 在每个请求发送前执行，用于统一添加认证信息和防缓存参数
 */
request.interceptors.request.use(
  (config) => {
    // 确保 params 对象存在
    if (!config.params) {
      config.params = {}
    }

    // 自动添加用户登录凭证（cookie）到请求参数
    const cookie = localStorage.getItem(`MUSIC_U`)
    if (cookie) {
      config.params.cookie = `MUSIC_U=${cookie};`
    }

    // POST 请求 url 必须添加时间戳,使每次请求 url 不一样,不然请求会被缓存
    /* 由于接口做了缓存处理 ( 缓存 2 分钟,不缓存数据极容易引起网易服务器高频 ip 错误 , 可在 app.js 设置 ,
   可能会导致登录后获取不到 cookie), 相同的 url 会在两分钟内只向网易服务器发一次请求 ,
   如果遇到不需要缓 存结果的接口 , 可在请求 url 后面加一个时间戳参数使 url 不同 */
    config.params.timestamp = Date.now()
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 统一处理响应数据，进行错误检查和消息提示
 *
 * 重要：此拦截器直接返回 response.data 而非完整的 response 对象
 * 因此后续使用时无需再 .data，但也无法访问 status、headers 等信息
 */
request.interceptors.response.use(
  (response) => {
    // 解构获取 HTTP 状态码和业务状态码
    const {
      status,
      data: { code }
    } = response

    // 获取请求的 URL 路径（不含查询参数）
    const url = response.config.url?.split('?')[0] || ''

    // 检查响应是否成功
    // - 跳过 ignoreState 中的特殊接口
    // - 要求 HTTP 状态码为 200 且业务代码为 200
    if (!ignoreState.includes(url) && status !== 200 && code !== 200) {
      ElMessage.error(response.data.message || `请求出现错误，当前状态码为${code || status}`)
      return Promise.reject(response.data)
    }

    // 返回数据部分（注意：不是完整的 response 对象）
    return response.data
  },
  (error) => {
    // 处理请求错误（如网络错误、超时等）
    const data = error.response.data
    ElMessage.error(data.message || data.msg || error.message)

    return Promise.reject(data)
  }
)

/**
 * 自定义请求类型接口
 *
 * === 问题背景 ===
 * - Axios 默认返回类型是 AxiosResponse<T>，包含 data、status、headers 等完整响应信息
 * - 但我们的响应拦截器（第71行）已经返回了 response.data，只返回数据部分
 * - TypeScript 无法自动推断这个运行时行为变化，仍然认为返回的是 AxiosResponse<T>
 * - 导致使用时出现类型错误，如：const { lrc } = await getLyric(id) 会报错
 *
 * === 解决方案 ===
 * - 定义一个新的接口 CustomRequest，明确各个方法直接返回 Promise<T> 而不是 Promise<AxiosResponse<T>>
 * - 通过类型断言将原生的 request 对象转换为这个自定义类型
 * - 这样 TypeScript 就知道 request.get<User>() 会直接返回 Promise<User>
 *
 * === 使用示例 ===
 * 定义 API：
 * ```typescript
 * interface UserData { name: string; age: number }
 * export const getUser = () => request.get<UserData>('/api/user')
 * ```
 *
 * 调用 API：
 * ```typescript
 * const user = await getUser()  // 类型是 UserData，不是 AxiosResponse<UserData>
 * console.log(user.name)  // ✅ 直接访问，不需要 user.data.name
 *
 * const { lrc, tlyric } = await getLyric(id)  // ✅ 可以直接解构
 * ```
 *
 * === 权衡说明 ===
 * ✅ 优点：代码简洁，不需要每次 .data
 * ⚠️ 缺点：无法访问响应头、状态码等元数据
 * 💡 适用场景：大多数业务场景只需要数据，不需要响应元信息
 */
interface CustomRequest {
  /** GET 请求 */
  get<T = any>(url: string, config?: any): Promise<T>
  /** POST 请求 */
  post<T = any>(url: string, data?: any, config?: any): Promise<T>
  /** PUT 请求 */
  put<T = any>(url: string, data?: any, config?: any): Promise<T>
  /** DELETE 请求 */
  delete<T = any>(url: string, config?: any): Promise<T>
  /** PATCH 请求 */
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>
  /** 通用请求方法 */
  request<T = any>(config: any): Promise<T>
}

/**
 * 类型断言：将 request 转换为 CustomRequest 类型
 *
 * 使用 `as unknown as CustomRequest` 而不是直接 `as CustomRequest`：
 * - unknown 是 TypeScript 的"类型安全的 any"
 * - 作为中间类型可以避免直接转换时可能出现的类型兼容性错误
 * - 这是类型断言的最佳实践，确保类型转换的安全性
 */
export default request as unknown as CustomRequest
