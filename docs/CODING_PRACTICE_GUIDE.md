# 🎯 Music-App 手敲练习指南

> 本文档根据项目特性和面试重要性，将所有文件分为「必须手敲」「建议手敲」「看懂即可」三个级别
>
> 目的：通过手敲核心代码加深理解，面试时能够流畅讲解实现原理

---

## 📊 文件统计

| 级别        | 文件数 | 预计耗时   | 说明                   |
| ----------- | ------ | ---------- | ---------------------- |
| 🔴 必须手敲 | 15 个  | 15-17 小时 | 核心亮点，面试必问     |
| 🟡 建议手敲 | 14 个  | 4-6 小时   | 重要功能，有余力再敲   |
| 🟢 看懂即可 | 95 个  | 2-3 小时   | 通用代码，理解逻辑即可 |

> 💡 **说明**：「必须手敲」已按依赖关系排序，请按顺序学习

---

## 🔴 必须手敲（核心亮点，面试必问）

> 这些是项目的**核心技术亮点**，面试官很可能深入追问，必须能脱口而出实现原理
>
> ⚠️ **按照下方推荐顺序手敲**，因为有依赖关系

---

### 📋 必须手敲文件总览（按推荐顺序排列）

| 序号 | 文件            | 路径                                     | 代码行 | 依赖的其他文件                  |
| ---- | --------------- | ---------------------------------------- | ------ | ------------------------------- |
| 1    | parser.ts       | `utils/lyric/parser.ts`                  | ~150   | 无依赖 ✅                       |
| 2    | player.ts       | `utils/lyric/player.ts`                  | ~310   | parser.ts、gsap                 |
| 3    | style.scss      | `utils/lyric/style.scss`                 | ~60    | 无依赖 ✅                       |
| 4    | index.ts        | `utils/lyric/index.ts`                   | ~5     | parser.ts                       |
| 5    | index.ts        | `utils/index.ts`                         | ~315   | 无依赖 ✅                       |
| 6    | useMusic.ts     | `components/MusicDetail/useMusic.ts`     | ~150   | colorthief                      |
| 7    | FlowBg.vue      | `components/MusicDetail/FlowBg.vue`      | ~70    | useMusic.ts、utils/index.ts     |
| 8    | listener.ts     | `components/MusicPlayer/listener.ts`     | ~60    | 无依赖 ✅                       |
| 9    | ProgressBar.vue | `components/MusicPlayer/ProgressBar.vue` | ~120   | store/music.ts                  |
| 10   | index.vue       | `components/MusicPlayer/index.vue`       | ~310   | listener.ts、lyric、store       |
| 11   | music.ts        | `store/music.ts`                         | ~250   | lyric/parser.ts、utils/index.ts |
| 12   | index.ts        | `store/index.ts`                         | ~135   | 无依赖 ✅                       |
| 13   | index.ts        | `router/index.ts`                        | ~80    | utils/index.ts、store/flags.ts  |
| 14   | request.ts      | `utils/request.ts`                       | ~65    | 无依赖 ✅                       |
| 15   | App.vue         | `App.vue`                                | ~100   | store、MusicPlayer、MusicDetail |

---

### 🔢 详细手敲顺序与依赖说明

#### 第一阶段：歌词模块（最核心亮点）⭐⭐⭐⭐⭐

> 🎯 这是项目最大亮点，自研替换第三方依赖，**面试必问**

**顺序 1：parser.ts（歌词解析器）**

```
📁 src/renderer/src/utils/lyric/parser.ts
📊 约 150 行
🔗 依赖：无，可直接开始
📚 前置知识：
   - 正则表达式基础（分组、贪婪匹配）
   - TypeScript 类型定义（interface、type）
```

**核心内容**：

- LRC 时间标签正则：`/\[(\d{1,2}:\d{1,2}(?:[.:]\d{1,3})?)\]/g`
- 时间格式转换：`'01:02.410'` → `62.41` 秒
- 多时间标签处理
- 双语歌词合并（容差匹配 ±0.5s）

**面试考点**：正则怎么写？时间转换逻辑？双语合并算法？

---

**顺序 2：player.ts（歌词播放器）**

```
📁 src/renderer/src/utils/lyric/player.ts
📊 约 310 行
🔗 代码依赖：
   - parser.ts → LyricLine 类型定义
   - gsap → 动画库
📚 前置知识：
   - 看懂 parser.ts 中的 LyricLine 接口
   - GSAP 基础：gsap.to(target, { duration, y, ease })
   - requestAnimationFrame 用法
   - 二分查找算法原理
```

**核心内容**：

- **二分查找**定位当前行（O(log n)）
- **requestAnimationFrame** 时间同步
- **GSAP** 平滑滚动动画
- 用户滚动检测与冲突处理

**面试考点**：二分查找原理？raf vs setInterval？用户滚动如何暂停自动滚动？

---

**顺序 3：style.scss + index.ts**

```
📁 src/renderer/src/utils/lyric/style.scss（~60 行）
📁 src/renderer/src/utils/lyric/index.ts（~5 行）
🔗 依赖：无
📚 前置知识：SCSS 嵌套语法
```

简单文件，快速完成。

---

#### 第二阶段：工具函数（被多处依赖）⭐⭐⭐⭐

> 🎯 工具函数被颜色提取、播放器、路由等多处使用，**先敲工具再敲组件**

**顺序 5：utils/index.ts**

```
📁 src/renderer/src/utils/index.ts
📊 约 315 行
🔗 依赖：无，可直接开始
📚 前置知识：
   - HSL 颜色空间概念（色相、饱和度、亮度）
   - Promise 基础
   - Image 对象的 onload 事件
```

**核心内容**：

- `formattingTime()` 时间格式化
- `rgbToHsl()` + `isGoodColor()` + `findBestColors()` 颜色算法
- `lookup()` 嵌套属性安全取值
- `toggleImg()` 图片预加载防闪烁
- `animation()` 基于时间的动画执行器

**面试考点**：HSL 颜色空间？嵌套取值怎么实现？图片预加载原理？

---

#### 第三阶段：颜色提取与流动背景（视觉亮点）⭐⭐⭐⭐⭐

> 🎯 从专辑封面提取颜色、Canvas 切图动画，**视觉效果亮点**

**顺序 6：useMusic.ts（颜色提取 + Canvas 切图）**

```
📁 src/renderer/src/components/MusicDetail/useMusic.ts
📊 约 150 行
🔗 代码依赖：
   - colorthief → 第三方颜色提取库
📚 前置知识：
   - 先看懂 utils/index.ts 中的 findBestColors() 颜色过滤算法
   - ColorThief 基本用法：new ColorThief().getPalette(img)
   - Canvas API：drawImage、getImageData
   - CSS @keyframes 动态注入原理
```

**核心内容**：

- `colorExtraction()` 调用 ColorThief 提取调色板
- `gradualChange()` 双层渐变过渡动画
- `useRhythm()` Canvas 切图 + 动态 CSS Keyframes 注入

**面试考点**：ColorThief 原理？Canvas drawImage？动态 CSS 注入？

---

**顺序 7：FlowBg.vue（流动背景组件）**

```
📁 src/renderer/src/components/MusicDetail/FlowBg.vue
📊 约 70 行
🔗 代码依赖：
   - useMusic.ts → colorExtraction, gradualChange, useRhythm
   - utils/index.ts → findBestColors, toggleImg
   - store/music.ts → useMusicAction（获取/更新主题色）
   - store/settings.ts → useSettings（获取用户设置）
📚 前置知识：
   - 先敲完 useMusic.ts
   - Vue3 watch 的 immediate 选项
   - 理解 store/music.ts 中的 updateBgColor 方法
```

**核心内容**：

- watch 监听图片切换
- 触发颜色提取和背景更新

---

#### 第四阶段：播放器核心（业务核心）⭐⭐⭐⭐⭐

> 🎯 音乐播放器主体，音量过渡、事件监听，**业务逻辑核心**

**顺序 8：listener.ts（事件总线）**

```
📁 src/renderer/src/components/MusicPlayer/listener.ts
📊 约 60 行
🔗 依赖：无，可直接开始
📚 前置知识：
   - 发布订阅设计模式
   - Vue3 onMounted 生命周期
   - audio 元素的 loadeddata、loadedmetadata 事件
```

**核心内容**：

- 发布订阅模式实现
- 支持 changeSong、handleFirstLoad、cutSong 事件
- 监听器暂停/恢复机制

**面试考点**：发布订阅模式原理？为什么需要暂停监听器？

---

**顺序 9：ProgressBar.vue（进度条）**

```
📁 src/renderer/src/components/MusicPlayer/ProgressBar.vue
📊 约 120 行
🔗 代码依赖：
   - store/music.ts → useMusicAction（获取 currentTime、bgColor）
   - store/flags.ts → useFlags（获取详情页展开状态）
   - api/musicList.ts → GetMusicDetailData 类型（看懂即可）
📚 前置知识：
   - Vue3 computed 的 get/set 写法（实现双向绑定）
   - CSS Variables 动态样式
   - Element Plus el-slider 组件
```

**核心内容**：

- computed get/set 实现双向绑定
- CSS Variables 动态主题色
- 展开/收起不同样式

---

**顺序 10：MusicPlayer/index.vue（播放器主体）**

```
📁 src/renderer/src/components/MusicPlayer/index.vue
📊 约 310 行
🔗 代码依赖：
   - listener.ts → useListener, ListenerName
   - utils/lyric → LyricPlayer 类
   - store/music.ts → useMusicAction
   - store/index.ts → useUserInfo
   - ProgressBar.vue（已敲完）
   - usePlayList.ts → 歌单数据（看懂即可）
   - DetailLeft.vue、DetailCenter.vue、DetailRight.vue（看懂即可）
📚 前置知识：
   - 先敲完 listener.ts 和 lyric/player.ts
   - Promise 封装异步操作
   - setInterval + clearInterval 实现渐变
   - audio 元素的 play/pause/currentTime 属性
```

**核心内容**：

- **音量渐变过渡**（Promise 封装 setInterval）
- 重写 audio.play/pause 方法
- 歌词播放器初始化与同步
- 播放模式切换（心动/顺序/随机/单曲）

**面试考点**：Promise 封装音量过渡？为什么重写 play/pause？播放模式如何实现？

---

#### 第五阶段：状态管理（Pinia）⭐⭐⭐⭐

> 🎯 全局状态管理，理解数据流向

**顺序 11：store/music.ts**

```
📁 src/renderer/src/store/music.ts
📊 约 250 行
🔗 代码依赖：
   - utils/lyric → parseLRC, mergeLyricsWithTranslation
   - utils/index.ts → randomNum
   - api/musicList.ts → API 函数和类型（看懂即可）
📚 前置知识：
   - 先敲完 lyric/parser.ts（理解歌词解析）
   - Pinia defineStore 的组合式写法
   - Vue3 reactive、watch
   - localStorage 持久化
```

**核心内容**：

- 音乐播放状态管理
- 歌词获取与合并
- 播放列表管理
- 心动模式智能推荐
- bgColor 主题色更新

**面试考点**：Pinia 组合式写法？状态如何持久化？心动模式怎么实现？

---

**顺序 12：store/index.ts**

```
📁 src/renderer/src/store/index.ts
📊 约 135 行
🔗 依赖：无核心依赖
📚 前置知识：
   - Pinia defineStore 组合式写法
   - localStorage 操作
   - 事件监听模式（addEvent/executeEvent）
```

**核心内容**：

- 用户信息管理
- 侧边栏菜单动态更新
- localStorage 缓存

---

#### 第六阶段：路由与请求（工程化）⭐⭐⭐⭐

**顺序 13：router/index.ts**

```
📁 src/renderer/src/router/index.ts
📊 约 80 行
🔗 代码依赖：
   - utils/index.ts → parsePathQuery 函数
   - store/flags.ts → useFlags（看懂即可）
   - store/store.ts → pinia 实例
   - router/routes.ts → 路由配置（看懂即可）
📚 前置知识：
   - Vue Router 4 createRouter、createWebHashHistory
   - 路由守卫 beforeEach
   - 函数重写/代理模式
```

**核心内容**：

- **重写 router.push**（自动累加 count）
- 全局前置守卫
- 前进/后退按钮可用性判断

**面试考点**：为什么重写 push？路由深度追踪用途？

---

**顺序 14：request.ts**

```
📁 src/renderer/src/utils/request.ts
📊 约 65 行
🔗 依赖：无
📚 前置知识：
   - Axios 基础用法
   - 拦截器概念（请求拦截、响应拦截）
   - HTTP Cookie 机制
```

**核心内容**：

- Axios 实例创建
- 请求拦截器（Cookie 注入、时间戳防缓存）
- 响应拦截器（统一错误处理）

**面试考点**：Axios 拦截器原理？为什么加时间戳？

---

#### 第七阶段：全局布局（收尾）⭐⭐⭐

**顺序 15：App.vue**

```
📁 src/renderer/src/App.vue
📊 约 100 行
🔗 代码依赖：
   - store/music.ts → useMusicAction
   - store/flags.ts → useFlags
   - store/index.ts → useUserInfo
   - store/settings.ts → useSettings
   - components/ContextMenu/useContextMenu.ts → provide 菜单状态
   - layout/ → Header、Aside、Bottom（看懂即可）
   - components/MusicPlayer、MusicDetail、Login（已敲完或看懂）
   - utils/shortcutKey.ts → 快捷键初始化（看懂即可）
📚 前置知识：
   - Vue3 Teleport 组件（动态切换 disabled）
   - provide/inject 依赖注入
   - window 全局属性挂载
```

**核心内容**：

- 全局布局结构
- **Teleport 动态传送**播放器组件
- provide 全局右键菜单状态
- 快捷键初始化

**面试考点**：Teleport 的 disabled 动态切换？provide/inject 用法？

---

## 🟡 建议手敲（重要功能，有余力再敲）

> 这些是项目的重要功能模块，面试可能涉及，建议有时间就手敲
>
> ⚠️ 以下文件可在完成「必须手敲」后按顺序练习

### 1. 右键菜单⭐⭐⭐⭐

| 序号 | 文件                  | 路径                                                        | 代码行数 | 依赖文件          |
| ---- | --------------------- | ----------------------------------------------------------- | -------- | ----------------- |
| 1    | **useContextMenu.ts** | `src/renderer/src/components/ContextMenu/useContextMenu.ts` | ~25 行   | 无                |
| 2    | **index.vue**         | `src/renderer/src/components/ContextMenu/index.vue`         | ~120 行  | useContextMenu.ts |

```
📚 前置知识：
   - Symbol 的唯一性特性
   - Vue3 provide/inject 依赖注入
   - Teleport 传送门组件
   - CSS backdrop-filter 毛玻璃效果
```

**面试考点**：

- 为什么用 Symbol 作为 inject key？（避免命名冲突）
- Teleport 有什么作用？（脱离 DOM 层级限制）

---

### 2. 搜索组件⭐⭐⭐⭐

| 序号 | 文件             | 路径                                              | 代码行数 | 依赖文件                     |
| ---- | ---------------- | ------------------------------------------------- | -------- | ---------------------------- |
| 1    | **useSearch.ts** | `src/renderer/src/components/Search/useSearch.ts` | ~25 行   | api/search.ts（看懂即可）    |
| 2    | **index.vue**    | `src/renderer/src/components/Search/index.vue`    | ~290 行  | useSearch.ts、store/flags.ts |

```
📚 前置知识：
   - Vue3 reactive 响应式
   - 防抖（debounce）概念
   - localStorage 持久化搜索历史
   - 字符串 replace 实现关键词高亮
🔗 看懂即可：
   - api/search.ts → searchSuggest、searchHotDetail API
   - components/Search/List.vue → 搜索结果列表展示
   - components/Search/type.ts → 类型定义
```

**面试考点**：

- 搜索关键词高亮怎么实现？（正则替换 + v-html）
- 搜索历史如何持久化？（localStorage + Symbol key）

---

### 3. 歌曲列表⭐⭐⭐⭐

| 序号 | 文件          | 路径                                             | 代码行数 | 依赖文件                  |
| ---- | ------------- | ------------------------------------------------ | -------- | ------------------------- |
| 1    | **config.ts** | `src/renderer/src/views/PlayList/config.ts`      | ~50 行   | 无                        |
| 2    | **index.vue** | `src/renderer/src/components/SongList/index.vue` | ~530 行  | config.ts、store/music.ts |

```
📚 前置知识：
   - 配置化渲染思想（通过配置对象驱动 UI）
   - Web Animations API（element.animate()）
   - Vue3 slot 插槽
   - 双击事件 @dblclick
🔗 看懂即可：
   - api/musicList.ts → 歌曲数据类型
```

**面试考点**：

- 配置化渲染的好处？（复用性高、易于维护）
- Web Animations API 怎么用？（替代 CSS transition 实现复杂动画）

---

### 4. 登录组件⭐⭐⭐

| 序号 | 文件          | 路径                                          | 代码行数 | 依赖文件                     |
| ---- | ------------- | --------------------------------------------- | -------- | ---------------------------- |
| 1    | **index.vue** | `src/renderer/src/components/Login/index.vue` | ~320 行  | api/login.ts、store/index.ts |

```
📚 前置知识：
   - 轮询（setInterval）实现扫码状态检测
   - 状态机思想（待扫描→已扫描待确认→已确认/已过期）
   - Element Plus Dialog 弹窗组件
   - 二维码生成原理（qrcode 库，看懂即可）
🔗 看懂即可：
   - api/login.ts → 二维码生成、状态检测 API
   - utils/cookies.ts → Cookie 操作
```

**面试考点**：

- 扫码登录的状态机是什么？（800-待扫描、801-待确认、802-已授权、803-已过期）
- 轮询间隔怎么设计？（通常 1-3 秒，过期后停止）

---

### 5. Electron 主进程⭐⭐⭐

| 序号 | 文件          | 路径                 | 代码行数 | 依赖文件  |
| ---- | ------------- | -------------------- | -------- | --------- |
| 1    | **module.ts** | `src/main/module.ts` | ~40 行   | 无        |
| 2    | **index.ts**  | `src/main/index.ts`  | ~82 行   | module.ts |

```
📚 前置知识：
   - Electron 进程模型（主进程 vs 渲染进程）
   - IPC 通信（ipcMain.on / ipcRenderer.send）
   - BrowserWindow 配置项
   - preload 脚本的作用
🔗 看懂即可：
   - src/preload/index.ts → 预加载脚本暴露 API
   - electron-builder.yml → 打包配置
```

**面试考点**：

- Electron 主进程和渲染进程的区别？（主进程管理窗口，渲染进程运行网页）
- IPC 通信怎么实现？（ipcMain/ipcRenderer + contextBridge）

---

### 6. 其他重要文件⭐⭐⭐

| 文件                      | 路径                                                       | 代码行数 | 手敲原因                | 前置知识               |
| ------------------------- | ---------------------------------------------------------- | -------- | ----------------------- | ---------------------- |
| **shortcutKey.ts**        | `src/renderer/src/utils/shortcutKey.ts`                    | ~35 行   | 全局快捷键              | keydown 事件、keyCode  |
| **usePlayList.ts**        | `src/renderer/src/layout/BaseAside/usePlayList.ts`         | ~90 行   | 歌单数据获取逻辑        | 组合式函数封装         |
| **LyricDisplay.vue**      | `src/renderer/src/components/MusicDetail/LyricDisplay.vue` | ~185 行  | 歌词展示、GSAP 封面动画 | 先敲完 lyric/player.ts |
| **MusicDetail/index.vue** | `src/renderer/src/components/MusicDetail/index.vue`        | ~150 行  | 音乐详情弹窗            | 先敲完 FlowBg.vue      |

---

## 🟢 看懂即可（通用代码，理解逻辑即可）

> 这些文件功能相对简单或通用，看懂逻辑即可，不需要手敲
>
> 📁 共 65+ 个文件

### 1. 布局组件（7 个）

| 文件                   | 路径                                             | 说明         |
| ---------------------- | ------------------------------------------------ | ------------ |
| BaseHeader/index.vue   | `src/renderer/src/layout/BaseHeader/index.vue`   | 头部导航栏   |
| BaseHeader/handle.ts   | `src/renderer/src/layout/BaseHeader/handle.ts`   | 窗口控制函数 |
| BaseAside/index.vue    | `src/renderer/src/layout/BaseAside/index.vue`    | 侧边栏       |
| BaseAside/item.vue     | `src/renderer/src/layout/BaseAside/item.vue`     | 侧边栏菜单项 |
| BaseAside/config.ts    | `src/renderer/src/layout/BaseAside/config.ts`    | 侧边栏配置   |
| BaseAside/animation.ts | `src/renderer/src/layout/BaseAside/animation.ts` | 侧边栏动画   |
| BaseBottom/index.vue   | `src/renderer/src/layout/BaseBottom/index.vue`   | 底部播放栏   |

---

### 2. 播放器子组件（5 个）

| 文件             | 路径                                                       | 说明                    |
| ---------------- | ---------------------------------------------------------- | ----------------------- |
| DetailLeft.vue   | `src/renderer/src/components/MusicPlayer/DetailLeft.vue`   | 播放器左侧（封面+歌名） |
| DetailCenter.vue | `src/renderer/src/components/MusicPlayer/DetailCenter.vue` | 播放器中间（控制按钮）  |
| DetailRight.vue  | `src/renderer/src/components/MusicPlayer/DetailRight.vue`  | 播放器右侧（音量+列表） |
| Volume.vue       | `src/renderer/src/components/MusicPlayer/Volume.vue`       | 音量控制                |
| useMusic.ts      | `src/renderer/src/components/MusicPlayer/useMusic.ts`      | 喜欢/删除歌曲           |

---

### 3. 通用 UI 组件（20 个）

| 文件                      | 路径                                                    | 说明           |
| ------------------------- | ------------------------------------------------------- | -------------- |
| Card/index.vue            | `src/renderer/src/components/Card/index.vue`            | 卡片组件       |
| BaseButton/index.vue      | `src/renderer/src/components/BaseButton/index.vue`      | 按钮组件       |
| Pagination/index.vue      | `src/renderer/src/components/Pagination/index.vue`      | 分页组件       |
| Tabs/index.vue            | `src/renderer/src/components/Tabs/index.vue`            | 标签页组件     |
| Tabs/TabPane.vue          | `src/renderer/src/components/Tabs/TabPane.vue`          | 标签页子组件   |
| SongInfo/index.vue        | `src/renderer/src/components/SongInfo/index.vue`        | 歌单信息头部   |
| PlayListDrawer/index.vue  | `src/renderer/src/components/PlayListDrawer/index.vue`  | 播放列表抽屉   |
| PlayListDrawer/config.ts  | `src/renderer/src/components/PlayListDrawer/config.ts`  | 抽屉配置       |
| UserDetailCard/index.vue  | `src/renderer/src/components/UserDetailCard/index.vue`  | 用户信息卡片   |
| UserDetailList/index.vue  | `src/renderer/src/components/UserDetailList/index.vue`  | 用户详情列表   |
| AdaptiveList/index.vue    | `src/renderer/src/components/AdaptiveList/index.vue`    | 自适应列表     |
| AdaptiveListBox/index.vue | `src/renderer/src/components/AdaptiveListBox/index.vue` | 自适应列表容器 |
| AreaBox/index.vue         | `src/renderer/src/components/AreaBox/index.vue`         | 区域容器       |
| List/index.vue            | `src/renderer/src/components/List/index.vue`            | 通用列表       |
| NotFund/index.vue         | `src/renderer/src/components/NotFund/index.vue`         | 404 组件       |
| SkeletonCard/index.vue    | `src/renderer/src/components/SkeletonCard/index.vue`    | 骨架屏         |
| SongListCreator.vue       | `src/renderer/src/components/SongListCreator.vue`       | 歌单创建       |
| Versions.vue              | `src/renderer/src/components/Versions.vue`              | 版本信息       |
| Search/List.vue           | `src/renderer/src/components/Search/List.vue`           | 搜索列表       |
| Search/type.ts            | `src/renderer/src/components/Search/type.ts`            | 搜索类型定义   |

---

### 4. 页面视图（26 个）

| 文件                                        | 路径                                              | 说明          |
| ------------------------------------------- | ------------------------------------------------- | ------------- |
| Home/index.vue                              | `src/renderer/src/views/Home/index.vue`           | 首页          |
| Home/config.ts                              | `src/renderer/src/views/Home/config.ts`           | 首页配置      |
| Home/components/Custom.vue                  | `src/renderer/src/views/Home/components/`         | 首页-定制化   |
| Home/components/individual.vue              | `src/renderer/src/views/Home/components/`         | 首页-个性推荐 |
| Home/components/NewestMusic.vue             | `src/renderer/src/views/Home/components/`         | 首页-最新音乐 |
| Home/components/RankingList.vue             | `src/renderer/src/views/Home/components/`         | 首页-排行榜   |
| Home/components/Singer.vue                  | `src/renderer/src/views/Home/components/`         | 首页-歌手     |
| Home/components/SongMenu.vue                | `src/renderer/src/views/Home/components/`         | 首页-歌单     |
| PlayList/index.vue                          | `src/renderer/src/views/PlayList/index.vue`       | 歌单页        |
| SearchList/index.vue                        | `src/renderer/src/views/SearchList/index.vue`     | 搜索结果页    |
| SearchList/config.ts                        | `src/renderer/src/views/SearchList/config.ts`     | 搜索配置      |
| DailyRecommend/index.vue                    | `src/renderer/src/views/DailyRecommend/index.vue` | 每日推荐      |
| DailyRecommend/dailyRecommendSongsConfig.ts | `src/renderer/src/views/DailyRecommend/`          | 日推配置      |
| Setting/index.vue                           | `src/renderer/src/views/Setting/index.vue`        | 设置页        |
| Comment/index.vue                           | `src/renderer/src/views/Comment/index.vue`        | 评论页        |
| SingerPage/index.vue                        | `src/renderer/src/views/SingerPage/index.vue`     | 歌手页        |
| SingerPage/config.ts                        | `src/renderer/src/views/SingerPage/config.ts`     | 歌手配置      |
| UserDetail/index.vue                        | `src/renderer/src/views/UserDetail/index.vue`     | 用户详情      |
| UserDetail/config.ts                        | `src/renderer/src/views/UserDetail/config.ts`     | 用户配置      |
| Video/index.vue                             | `src/renderer/src/views/Video/index.vue`          | 视频页        |
| PrivateFm/index.vue                         | `src/renderer/src/views/PrivateFm/index.vue`      | 私人 FM       |
| LatelyPlay/index.vue                        | `src/renderer/src/views/LatelyPlay/index.vue`     | 最近播放      |
| LatelyPlay/config.ts                        | `src/renderer/src/views/LatelyPlay/config.ts`     | 配置          |
| MusicCloud/index.vue                        | `src/renderer/src/views/MusicCloud/index.vue`     | 云盘          |
| MusicCloud/config.ts                        | `src/renderer/src/views/MusicCloud/config.ts`     | 配置          |
| Local/index.vue                             | `src/renderer/src/views/Local/index.vue`          | 本地音乐      |
| Local/config.ts                             | `src/renderer/src/views/Local/config.ts`          | 配置          |
| Follow/index.vue                            | `src/renderer/src/views/Follow/index.vue`         | 关注页        |
| UserCover/index.vue                         | `src/renderer/src/views/UserCover/index.vue`      | 用户封面      |
| UserCover/config.ts                         | `src/renderer/src/views/UserCover/config.ts`      | 配置          |

---

### 5. API 接口（6 个）

| 文件         | 路径                                | 说明         |
| ------------ | ----------------------------------- | ------------ |
| musicList.ts | `src/renderer/src/api/musicList.ts` | 音乐列表 API |
| home.ts      | `src/renderer/src/api/home.ts`      | 首页 API     |
| login.ts     | `src/renderer/src/api/login.ts`     | 登录 API     |
| search.ts    | `src/renderer/src/api/search.ts`    | 搜索 API     |
| play.ts      | `src/renderer/src/api/play.ts`      | 播放 API     |
| user.ts      | `src/renderer/src/api/user.ts`      | 用户 API     |

---

### 6. Store 其他（4 个）

| 文件        | 路径                                 | 说明         |
| ----------- | ------------------------------------ | ------------ |
| flags.ts    | `src/renderer/src/store/flags.ts`    | 全局状态标志 |
| settings.ts | `src/renderer/src/store/settings.ts` | 用户设置     |
| theme.ts    | `src/renderer/src/store/theme.ts`    | 主题状态     |
| store.ts    | `src/renderer/src/store/store.ts`    | Pinia 实例   |

---

### 7. 样式文件（4 个）

| 文件                | 路径                                          | 说明         |
| ------------------- | --------------------------------------------- | ------------ |
| base.scss           | `src/renderer/src/assets/base.scss`           | 全局基础样式 |
| scroll.scss         | `src/renderer/src/assets/scroll.scss`         | 滚动条样式   |
| theme/mixin.scss    | `src/renderer/src/assets/theme/mixin.scss`    | SCSS 混合宏  |
| theme/variable.scss | `src/renderer/src/assets/theme/variable.scss` | 主题变量     |

---

### 8. 配置与类型文件（10 个）

| 文件                    | 路径                                       | 说明         |
| ----------------------- | ------------------------------------------ | ------------ |
| main.ts                 | `src/renderer/src/main.ts`                 | Vue 入口     |
| routes.ts               | `src/renderer/src/router/routes.ts`        | 路由配置     |
| plugins/component.ts    | `src/renderer/src/plugins/component.ts`    | 组件注册插件 |
| plugins/element-icon.ts | `src/renderer/src/plugins/element-icon.ts` | 图标注册     |
| types/components.d.ts   | `src/renderer/src/types/components.d.ts`   | 组件类型声明 |
| types/global.d.ts       | `src/renderer/src/types/global.d.ts`       | 全局类型声明 |
| types/router.d.ts       | `src/renderer/src/types/router.d.ts`       | 路由类型声明 |
| env.d.ts                | `src/renderer/src/env.d.ts`                | 环境变量类型 |
| utils/cookies.ts        | `src/renderer/src/utils/cookies.ts`        | Cookie 操作  |
| utils/useLogin.ts       | `src/renderer/src/utils/useLogin.ts`       | 登录 hook    |
| utils/userInfo.ts       | `src/renderer/src/utils/userInfo.ts`       | 用户信息     |

---

### 9. Electron 预加载（2 个）

| 文件       | 路径                     | 说明       |
| ---------- | ------------------------ | ---------- |
| index.ts   | `src/preload/index.ts`   | 预加载脚本 |
| index.d.ts | `src/preload/index.d.ts` | 类型声明   |

---

### 10. 项目配置文件（7 个）

| 文件                    | 路径   | 说明              |
| ----------------------- | ------ | ----------------- |
| package.json            | 根目录 | 依赖配置          |
| electron.vite.config.ts | 根目录 | Vite 配置         |
| tsconfig.json           | 根目录 | TypeScript 主配置 |
| tsconfig.node.json      | 根目录 | Node 配置         |
| tsconfig.web.json       | 根目录 | Web 配置          |
| eslint.config.mjs       | 根目录 | ESLint 配置       |
| electron-builder.yml    | 根目录 | 打包配置          |

---

## 📅 推荐学习计划（5 天完成）

> 按照依赖关系优化后的学习顺序

### 第一天：歌词模块（4 小时）⭐⭐⭐⭐⭐

| 顺序 | 文件       | 耗时     | 重点内容                     |
| ---- | ---------- | -------- | ---------------------------- |
| 1    | parser.ts  | 1.5 小时 | LRC 正则、时间转换、双语合并 |
| 2    | player.ts  | 2 小时   | 二分查找、raf、GSAP 滚动     |
| 3    | style.scss | 0.5 小时 | 歌词高亮样式                 |
| 4    | index.ts   | 5 分钟   | 模块导出                     |

**今日目标**：能手写 LRC 解析器，能解释二分查找和 raf 原理

---

### 第二天：工具函数 + 颜色提取（4 小时）⭐⭐⭐⭐⭐

| 顺序 | 文件           | 耗时     | 重点内容                         |
| ---- | -------------- | -------- | -------------------------------- |
| 5    | utils/index.ts | 2 小时   | 颜色算法、时间格式化、图片预加载 |
| 6    | useMusic.ts    | 1.5 小时 | ColorThief、Canvas 切图          |
| 7    | FlowBg.vue     | 0.5 小时 | 流动背景、watch 触发             |

**今日目标**：能解释 HSL 过滤逻辑，能手写 Canvas drawImage

---

### 第三天：播放器核心（4 小时）⭐⭐⭐⭐⭐

| 顺序 | 文件                  | 耗时     | 重点内容                   |
| ---- | --------------------- | -------- | -------------------------- |
| 8    | listener.ts           | 0.5 小时 | 发布订阅模式               |
| 9    | ProgressBar.vue       | 1 小时   | computed get/set、动态主题 |
| 10   | MusicPlayer/index.vue | 2.5 小时 | 音量过渡、play/pause 重写  |

**今日目标**：能手写 Promise 封装音量过渡，能解释播放模式逻辑

---

### 第四天：状态管理 + 路由（3 小时）⭐⭐⭐⭐

| 顺序 | 文件            | 耗时     | 重点内容                |
| ---- | --------------- | -------- | ----------------------- |
| 11   | store/music.ts  | 1.5 小时 | Pinia 组合式、歌词获取  |
| 12   | store/index.ts  | 0.5 小时 | 用户信息、localStorage  |
| 13   | router/index.ts | 1 小时   | 重写 push、路由深度追踪 |

**今日目标**：能解释 Pinia vs Vuex，能说清路由深度追踪用途

---

### 第五天：请求封装 + 全局布局（2 小时）⭐⭐⭐

| 顺序 | 文件       | 耗时     | 重点内容                 |
| ---- | ---------- | -------- | ------------------------ |
| 14   | request.ts | 0.5 小时 | Axios 拦截器             |
| 15   | App.vue    | 1.5 小时 | Teleport、provide/inject |

**今日目标**：能解释 Axios 拦截器设计，能解释 Teleport 动态切换

---

### 有余力继续（可选）

| 优先级 | 文件               | 说明             |
| ------ | ------------------ | ---------------- |
| 高     | ContextMenu/       | Symbol + provide |
| 高     | Search/index.vue   | 搜索高亮、防抖   |
| 中     | SongList/index.vue | 配置化渲染       |
| 中     | Login/index.vue    | 扫码轮询状态机   |
| 低     | src/main/index.ts  | Electron IPC     |

---

## 🎤 面试模拟问答

### Q1: 你的歌词模块是怎么实现的？

**答**：我自研了 LRC 歌词解析器和播放器。解析器用正则 `/\[(\d{1,2}:\d{1,2}(?:[.:]\d{1,3})?)\]/g` 匹配时间标签，支持多时间标签和双语歌词合并。播放器用二分查找（O(log n)）定位当前行，用 requestAnimationFrame 同步时间，用 GSAP 实现平滑滚动。

### Q2: 二分查找为什么比线性查找好？

**答**：歌词可能有几百行，线性查找每次都要从头遍历，O(n)。二分查找利用歌词已按时间排序的特性，每次排除一半，O(log n)。对于 100 行歌词，线性最坏 100 次比较，二分最多 7 次。

### Q3: requestAnimationFrame 和 setInterval 有什么区别？

**答**：raf 与浏览器刷新率同步（通常 60fps），页面不可见时自动暂停省资源；setInterval 固定间隔可能与刷新率不匹配造成掉帧，且后台依然执行浪费资源。

### Q4: 颜色提取是怎么做的？

**答**：用 ColorThief 从专辑封面提取调色板，然后通过 RGB→HSL 转换过滤掉过亮（l>0.8）、过暗（l<0.2）、过饱和或过淡的颜色，最后选取色差最大的两个颜色做渐变背景。

### Q5: 为什么用 Pinia 不用 Vuex？

**答**：Pinia 是 Vue3 官方推荐的状态管理，更轻量、TypeScript 支持更好、不需要 mutations、支持组合式 API 写法。这个项目主要用 Pinia 的 setup 语法，代码更简洁。

### Q6: 音量渐变过渡怎么实现的？

**答**：用 Promise 封装 setInterval，每 16ms 递增/递减音量 0.01，达到目标值后 resolve。切歌时先淡出到 0，切换后再淡入到用户设置的音量，避免突兀的声音切换。

### Q7: 路由深度追踪有什么用？

**答**：重写 router.push 自动累加 count 记录路由深度。用于判断前进/后退按钮是否可用：count > 0 时后退可用，count < history.length - 1 时前进可用。单页应用无法直接获取浏览器历史栈，这是一种变通方案。

### Q8: 为什么用 Symbol 作为 provide/inject 的 key？

**答**：Symbol 是唯一值，可以避免不同组件库或模块之间的命名冲突。即使两个地方都用了同名字符串 key，Symbol 能保证它们不会互相覆盖。

### Q9: Teleport 组件有什么作用？

**答**：Teleport 可以将组件渲染到 DOM 树的其他位置，比如把 Modal 渲染到 body 下，避免被父组件的 overflow:hidden 或 z-index 影响。项目中用 disabled 属性动态切换是否传送。

### Q10: 发布订阅模式和观察者模式有什么区别？

**答**：观察者模式是目标和观察者直接交互，发布订阅模式有一个中间的事件通道（Event Bus）解耦发布者和订阅者。项目中的 listener.ts 就是发布订阅模式，组件之间通过事件名通信，互不依赖。

---

## 📋 快速参考表

### 技术栈速查

| 技术         | 版本 | 用途       | 关键文件                |
| ------------ | ---- | ---------- | ----------------------- |
| Vue 3        | 3.x  | 前端框架   | 所有 .vue 文件          |
| Pinia        | 2.x  | 状态管理   | store/\*.ts             |
| Vue Router   | 4.x  | 路由管理   | router/index.ts         |
| Electron     | 28+  | 桌面应用   | src/main/\*.ts          |
| TypeScript   | 5.x  | 类型系统   | 所有 .ts 文件           |
| GSAP         | 3.x  | 动画库     | lyric/player.ts         |
| ColorThief   | 2.x  | 颜色提取   | MusicDetail/useMusic.ts |
| Axios        | 1.x  | HTTP 请求  | utils/request.ts        |
| Element Plus | 2.x  | UI 组件库  | 各组件中                |
| SCSS         | -    | 样式预处理 | 所有 .scss 文件         |

### 核心设计模式速查

| 模式     | 应用场景         | 关键文件                    |
| -------- | ---------------- | --------------------------- |
| 发布订阅 | 音频事件监听     | MusicPlayer/listener.ts     |
| 单例     | 全局 audio 元素  | App.vue (window.$audio)     |
| 组合式   | 逻辑复用         | useMusic.ts, usePlayList.ts |
| 配置化   | 列表渲染         | SongList + config.ts        |
| 代理     | router.push 重写 | router/index.ts             |

### 面试高频考点速查

| 考点             | 答案关键词                              | 对应文件             |
| ---------------- | --------------------------------------- | -------------------- |
| 二分查找         | O(log n)、已排序、中间值比较            | lyric/player.ts      |
| raf vs interval  | 刷新率同步、省资源、自动暂停            | lyric/player.ts      |
| HSL 颜色空间     | 色相 H、饱和度 S、亮度 L                | utils/index.ts       |
| Promise 封装     | resolve/reject、异步流程控制            | MusicPlayer/index    |
| computed get/set | 双向绑定、响应式                        | ProgressBar.vue      |
| Pinia vs Vuex    | 轻量、TS 支持、组合式 API、无 mutations | store/music.ts       |
| provide/inject   | 跨层级通信、Symbol key                  | App.vue, ContextMenu |
| Teleport         | DOM 位置、disabled 动态切换             | App.vue, ContextMenu |

---

## ❓ 常见问题 FAQ

### Q: 手敲代码时需要一字不差吗？

**A**: 不需要。重点是理解逻辑和设计思想，变量名、注释可以用自己的风格。但核心算法（如二分查找、正则表达式）建议完整手写。

### Q: 如果某个依赖文件太复杂，可以跳过吗？

**A**: 可以。比如 `api/*.ts` 这类 API 调用文件，只需要知道它返回什么数据即可，不需要深入研究。重点放在「必须手敲」的 15 个文件上。

### Q: 手敲完一个文件后怎么验证？

**A**:

1. 对比原文件，检查核心逻辑是否一致
2. 尝试口头讲解实现原理，看能否流畅表达
3. 想象面试官可能问的问题，准备好回答

### Q: 时间不够怎么办？

**A**: 优先级排序：

1. **最优先**：lyric/parser.ts + player.ts（最大亮点）
2. **次优先**：MusicPlayer/index.vue（业务核心）
3. **再次**：useMusic.ts + FlowBg.vue（视觉亮点）
4. **有时间**：store/music.ts + router/index.ts

### Q: 面试时被问到没敲过的部分怎么办？

**A**: 诚实说「这部分我主要是阅读理解，没有深入实现」，然后说出你对这部分的理解。面试官更看重诚实和学习能力。

---

## 📦 文件覆盖检查清单

> 确保所有文件都已分类

### ✅ 已覆盖目录

- [x] `src/renderer/src/utils/lyric/` - 4 个文件（必须手敲）
- [x] `src/renderer/src/utils/` - 6 个文件
- [x] `src/renderer/src/components/MusicDetail/` - 4 个文件
- [x] `src/renderer/src/components/MusicPlayer/` - 8 个文件
- [x] `src/renderer/src/components/ContextMenu/` - 2 个文件
- [x] `src/renderer/src/components/Search/` - 4 个文件
- [x] `src/renderer/src/components/SongList/` - 1 个文件
- [x] `src/renderer/src/components/Login/` - 1 个文件
- [x] `src/renderer/src/components/` 其他 - 18 个文件
- [x] `src/renderer/src/store/` - 6 个文件
- [x] `src/renderer/src/router/` - 2 个文件
- [x] `src/renderer/src/layout/` - 7 个文件
- [x] `src/renderer/src/views/` - 30 个文件
- [x] `src/renderer/src/api/` - 6 个文件
- [x] `src/renderer/src/assets/` - 4 个样式文件
- [x] `src/renderer/src/plugins/` - 2 个文件
- [x] `src/renderer/src/types/` - 3 个文件
- [x] `src/main/` - 2 个文件
- [x] `src/preload/` - 2 个文件
- [x] 根目录配置文件 - 7 个

### ⚠️ 空目录/不计入

- [x] `src/renderer/src/components/VirtualList/` - 空目录
- [x] `src/renderer/src/assets/font/` - 字体资源
- [x] `src/renderer/src/assets/iconfont/` - 图标资源
- [x] `build/` - 打包配置
- [x] `resources/` - 静态资源

---

## ✅ 学习完成检查清单

### 阶段一：歌词模块

- [ ] 能独立手写 LRC 时间标签正则 `/\[(\d{1,2}:\d{1,2}(?:[.:]\d{1,3})?)\]/g`
- [ ] 能手写二分查找并解释 O(log n) 原理
- [ ] 能解释 requestAnimationFrame vs setInterval 的 3 个区别
- [ ] 能解释双语歌词容差匹配算法（±0.5s）

### 阶段二：颜色与背景

- [ ] 能解释 RGB→HSL 转换的意义（为什么要转换）
- [ ] 能解释 ColorThief 颜色提取原理（中位切分算法）
- [ ] 能手写 Canvas drawImage 切图 9 宫格
- [ ] 能解释动态 CSS Keyframes 注入（document.styleSheets）

### 阶段三：播放器

- [ ] 能手写 Promise 封装 setInterval 音量过渡
- [ ] 能手写发布订阅模式（addListener、executeListener）
- [ ] 能解释 computed get/set 实现双向绑定
- [ ] 能解释播放模式（0-心动、1-顺序、2-随机、3-单曲）实现

### 阶段四：状态与路由

- [ ] 能解释 Pinia defineStore 的两种写法（选项式 vs 组合式）
- [ ] 能说出 Pinia vs Vuex 至少 3 个区别
- [ ] 能解释路由深度追踪实现（重写 push 累加 count）
- [ ] 能解释 router.push 重写的目的（前进/后退按钮可用性）

### 阶段五：工程化

- [ ] 能解释 Axios 请求拦截器（Cookie 注入、时间戳防缓存）
- [ ] 能解释 Axios 响应拦截器（统一错误处理）
- [ ] 能解释 Teleport 的 disabled 动态切换场景
- [ ] 能解释 provide/inject + Symbol 用法及优势
- [ ] 能说出 Electron 主进程与渲染进程至少 3 个区别

---

## 🎯 最终目标

完成本指南后，你应该能够：

1. **技术深度**：对 15 个核心文件的实现原理了如指掌
2. **表达能力**：能用 1-2 分钟清晰讲解任意一个技术点
3. **应变能力**：面对追问能从原理层面回答
4. **项目理解**：能画出项目的整体架构图和数据流向

**面试时的黄金法则**：

- 先说「是什么」（这个功能做了什么）
- 再说「为什么」（为什么这样设计）
- 最后说「怎么做」（核心实现逻辑）

---

## 📘 TypeScript 专项学习指南

> 本项目全面使用 TypeScript，以下是项目中实际用到的 TS 特性，按重要性和使用频率排序

### 1. 基础类型定义（必须掌握）⭐⭐⭐⭐⭐

#### 1.1 interface 接口定义

**项目实例**：`utils/lyric/parser.ts`

```typescript
// 歌词行数据结构
export interface LyricLine {
  time: number // 时间戳（秒）
  text: string // 歌词文本
  translation?: string // 可选：翻译文本
}

// 歌词播放器配置
export interface LyricPlayerOptions {
  container: HTMLElement
  audio: HTMLAudioElement
  onLineClick?: (time: number, index: number) => void // 可选回调
  onLineChange?: (index: number) => void
}
```

**要点**：

- `?` 表示可选属性
- 函数类型：`(参数: 类型) => 返回类型`
- 接口可继承：`interface B extends A { }`

---

#### 1.2 type 类型别名

**项目实例**：`store/music.ts`

```typescript
// 联合类型：限定值的范围
export type Lyric = {
  time: number | boolean // 联合类型：number 或 boolean
  text: string
  line: number
}

// 字面量联合类型：限定为特定值
type OrderStatus = 0 | 1 | 2 | 3 // 心动/顺序/随机/单曲

// 从已有类型提取
type ListenerName = 'changeSong' | 'handleFirstLoad' | 'cutSong'
```

**interface vs type 区别**：
| 特性 | interface | type |
|------|-----------|------|
| 扩展方式 | extends | & 交叉类型 |
| 重复声明 | 自动合并 | 报错 |
| 适用场景 | 对象结构 | 联合类型、元组 |

---

### 2. Vue3 + TypeScript（核心用法）⭐⭐⭐⭐⭐

#### 2.1 defineProps 泛型写法

**项目实例**：`components/MusicPlayer/ProgressBar.vue`

```typescript
// 方式一：泛型写法（推荐）
interface Props {
  songs: GetMusicDetailData
}
const props = defineProps<Props>()

// 方式二：带默认值
const props = withDefaults(defineProps<Props>(), {
  songs: () => ({}) // 默认值用函数返回
})
```

---

#### 2.2 defineEmits 类型定义

**项目实例**：`components/MusicPlayer/index.vue`

```typescript
// 定义组件可触发的事件及参数类型
const emit = defineEmits<{
  playEnd: [] // 无参数
  cutSong: [];
  (e: 'update:modelValue', value: number): void // 带参数
}>()

// 使用
emit('playEnd')
emit('update:modelValue', 100)
```

---

#### 2.3 ref 和 reactive 泛型

**项目实例**：`store/music.ts`、`components/MusicPlayer/index.vue`

```typescript
import { ref, reactive } from 'vue'

// ref 泛型：简单类型
const isPlay = ref<boolean>(false)
const audio = ref<HTMLAudioElement>() // 可能为 undefined
const keywords = ref<string>('')

// reactive 泛型：复杂对象
interface State {
  musicUrl: string
  songs: GetMusicDetailData
  lyric: Lyric[]
  orderStatusVal: 0 | 1 | 2 | 3
}

const state: State = reactive({
  musicUrl: '',
  songs: {},
  lyric: [],
  orderStatusVal: 1
})
```

---

#### 2.4 computed 类型推断

**项目实例**：`components/MusicPlayer/ProgressBar.vue`

```typescript
import { computed } from 'vue'

// 自动推断返回类型
const progress = computed(() => {
  return (music.state.currentTime / duration) * 100
}) // 类型：ComputedRef<number>

// 手动指定类型（get/set 写法）
const model = computed<number>({
  get() {
    return ((music.state.currentTime * 1000) / props.songs.dt) * 100
  },
  set(val: number) {
    window.$audio.time = (val * props.songs.dt) / 100 / 1000
  }
})
```

---

### 3. 高级类型工具（进阶必备）⭐⭐⭐⭐

#### 3.1 Partial\<T\> - 所有属性变可选

**项目实例**：`store/music.ts`

```typescript
interface User {
  id: number
  name: string
  avatar: string
}

// Partial<User> 等价于：
// { id?: number; name?: string; avatar?: string }
const state: State = reactive({
  currentItem: null as Partial<GetPlayListDetailRes['playlist']> | null
})
```

---

#### 3.2 Omit\<T, K\> - 排除指定属性

**项目实例**：`components/MusicPlayer/index.vue`

```typescript
// 原始 HTMLAudioElement 有 play 和 pause 方法
// 我们要重写它们，所以先排除再自定义
type userAudio = {
  play: (lengthen?: boolean) => Promise<undefined>
  pause: (isNeed?: boolean, lengthen?: boolean) => Promise<undefined>
} & Omit<HTMLAudioElement, 'pause' | 'play'>

// Omit 排除了原有的 play/pause，然后用 & 交叉类型添加自定义版本
```

---

#### 3.3 UnwrapRef\<T\> - 解包 ref 类型

**项目实例**：`components/MusicPlayer/index.vue`

```typescript
import { UnwrapRef } from 'vue'

// 暴露给父组件的实例类型
export interface MusicPlayerInstanceType {
  el: UnwrapRef<userAudio> // 解包后的 audio 元素
  isPlay: UnwrapRef<boolean> // 解包后的布尔值
  reset: (val: boolean) => void
  pause: typeof pause
  play: typeof play
  time: number
}

// UnwrapRef<Ref<T>> = T
// 用于获取 ref 内部的实际类型
```

---

#### 3.4 ReturnType\<T\> - 获取函数返回类型

```typescript
// 获取函数的返回值类型
function usePlayList() {
  return {
    state: reactive({ ... }),
    getPlayListDetailFn: async () => { ... }
  }
}

// 自动获取 usePlayList 的返回类型
type PlayListReturn = ReturnType<typeof usePlayList>
```

---

#### 3.5 索引访问类型

**项目实例**：`store/music.ts`

```typescript
interface GetPlayListDetailRes {
  code: number
  playlist: {
    id: number
    name: string
    tracks: Track[]
  }
}

// 通过索引访问嵌套类型
type Playlist = GetPlayListDetailRes['playlist'] // 获取 playlist 的类型
type Tracks = GetPlayListDetailRes['playlist']['tracks'] // 获取 tracks 的类型
```

---

### 4. 函数类型定义⭐⭐⭐⭐

#### 4.1 函数参数与返回值

**项目实例**：`utils/index.ts`

```typescript
// 基础函数类型
function formattingTime(time: number): string {
  // ...
  return `${minutes}:${seconds}`
}

// 可选参数 + 默认值
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  // 返回元组类型
  return [h, s, l]
}

// 回调函数参数
function animation(
  duration: number,
  callback: (progress: number) => void, // 回调函数类型
  easing?: (t: number) => number // 可选参数
): void {
  // ...
}
```

---

#### 4.2 异步函数类型

**项目实例**：`api/musicList.ts`

```typescript
// 异步函数返回 Promise
async function getMusicDetail(ids: number[]): Promise<GetMusicDetailData[]> {
  const { songs } = await request.get('/song/detail', { params: { ids } })
  return songs
}

// 泛型请求封装
async function request<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await axios.request<T>(config)
  return response.data
}
```

---

### 5. 类与泛型⭐⭐⭐

#### 5.1 类的类型定义

**项目实例**：`utils/lyric/player.ts`

```typescript
export class LyricPlayer {
  // 私有属性
  private container: HTMLElement
  private audio: HTMLAudioElement
  private lyrics: LyricLine[] = []
  private currentIndex: number = -1
  private rafId: number | null = null

  // 可选的回调属性
  private onLineClick?: (time: number, index: number) => void
  private onLineChange?: (index: number) => void

  // 构造函数参数类型
  constructor(options: LyricPlayerOptions) {
    this.container = options.container
    this.audio = options.audio
    this.onLineClick = options.onLineClick
    this.onLineChange = options.onLineChange
  }

  // 公共方法
  public setLyrics(lyrics: LyricLine[]): void {
    this.lyrics = lyrics
  }

  // 私有方法
  private findCurrentIndex(time: number): number {
    // 二分查找实现
  }
}
```

**访问修饰符**：

- `private`：仅类内部访问
- `public`：任何地方都能访问（默认）
- `protected`：类内部和子类可访问

---

### 6. 类型断言与类型守卫⭐⭐⭐

#### 6.1 类型断言 as

**项目实例**：`components/MusicDetail/useMusic.ts`

```typescript
// 断言 DOM 元素类型
const gradual1 = document.querySelector('#gradual1') as HTMLDivElement
const rhythmBox = document.querySelector('#rhythm-box') as HTMLDivElement

// 断言返回值类型
const palette = colorThief.getPalette(img) as Array<Array<string>>

// 断言为 any（不推荐，但有时必要）
;(activeMenu.value as any).hideMenu()
```

---

#### 6.2 类型守卫

**项目实例**：`router/index.ts`、`utils/index.ts`

```typescript
// typeof 类型守卫
router.push = (params) => {
  if (typeof params === 'string') {
    // 这里 params 被收窄为 string
    const result = parsePathQuery(params)
  } else {
    // 这里 params 被收窄为对象类型
    to = { ...params }
  }
}

// 自定义类型守卫
function isString(val: unknown): val is string {
  return typeof val === 'string'
}

// 使用
if (isString(value)) {
  // value 在这里被推断为 string
  console.log(value.toUpperCase())
}
```

---

### 7. 泛型进阶⭐⭐⭐

#### 7.1 泛型函数

```typescript
// 基础泛型函数
function identity<T>(arg: T): T {
  return arg
}

// 泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 使用
const user = { name: 'John', age: 30 }
const name = getProperty(user, 'name') // 类型：string
const age = getProperty(user, 'age') // 类型：number
```

---

#### 7.2 泛型接口

```typescript
// API 响应通用结构
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 使用
type UserResponse = ApiResponse<User>
type SongListResponse = ApiResponse<Song[]>
```

---

### 8. 项目中的类型文件⭐⭐

#### 8.1 全局类型声明

**文件**：`src/renderer/src/types/global.d.ts`

```typescript
// 扩展 Window 接口
declare global {
  interface Window {
    $audio: MusicPlayerInstanceType
    $login: LoginInstance
  }
}

// 声明模块类型（无类型定义的库）
declare module 'colorthief' {
  export default class ColorThief {
    getPalette(img: HTMLImageElement, colorCount?: number): number[][]
    getColor(img: HTMLImageElement): number[]
  }
}
```

---

#### 8.2 Vue 组件类型增强

**文件**：`src/renderer/src/types/components.d.ts`

```typescript
// 全局组件类型声明（配合 unplugin-vue-components）
declare module 'vue' {
  export interface GlobalComponents {
    ElButton: (typeof import('element-plus'))['ElButton']
    ElInput: (typeof import('element-plus'))['ElInput']
    // ...
  }
}
```

---

### 9. TypeScript 配置文件解读

**文件**：`tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext", // 编译目标
    "module": "ESNext", // 模块系统
    "strict": true, // 严格模式（推荐开启）
    "jsx": "preserve", // JSX 处理
    "moduleResolution": "Node", // 模块解析策略
    "esModuleInterop": true, // ES 模块互操作
    "skipLibCheck": true, // 跳过库文件检查
    "baseUrl": ".", // 基础路径
    "paths": {
      // 路径别名
      "@/*": ["src/renderer/src/*"]
    }
  }
}
```

**重要配置项**：

- `strict: true`：开启所有严格检查
- `paths`：配合 Vite 的 alias 实现路径别名
- `skipLibCheck`：加快编译速度

---

### 10. TypeScript 学习检查清单

#### 基础篇

- [ ] 能区分 interface 和 type 的使用场景
- [ ] 能写出带可选参数的函数类型
- [ ] 能使用联合类型 `|` 和交叉类型 `&`
- [ ] 能使用字面量类型限定值范围

#### Vue + TS 篇

- [ ] 能用泛型写法定义 defineProps
- [ ] 能正确定义 defineEmits 的事件类型
- [ ] 能给 ref 和 reactive 添加类型
- [ ] 能给 computed 的 get/set 添加类型

#### 进阶篇

- [ ] 能使用 Partial、Omit、Pick 等工具类型
- [ ] 能使用类型断言 as
- [ ] 能写自定义类型守卫函数
- [ ] 能理解泛型约束 `<T extends U>`

#### 实战篇

- [ ] 能为 API 响应定义完整类型
- [ ] 能为 Pinia store 定义状态类型
- [ ] 能扩展全局 Window 接口
- [ ] 能为无类型的第三方库写声明文件

---

### 11. TypeScript 面试常见问题

**Q1: any、unknown、never 有什么区别？**

**答**：

- `any`：放弃类型检查，可以赋值给任何类型
- `unknown`：安全的 any，使用前必须类型收窄
- `never`：永不存在的类型，用于永不返回的函数或不可能的分支

**Q2: interface 和 type 怎么选？**

**答**：

- 定义对象结构用 `interface`（可扩展、可合并）
- 定义联合类型、元组、工具类型用 `type`
- 项目统一风格即可，本项目主要用 interface

**Q3: 为什么要用 TypeScript？**

**答**：

1. 编译时类型检查，减少运行时错误
2. 更好的 IDE 支持（自动补全、重构）
3. 代码即文档，接口定义清晰
4. 大型项目可维护性更强

**Q4: 如何处理没有类型定义的第三方库？**

**答**：

1. 先找 `@types/xxx`：`npm install @types/colorthief`
2. 没有则自己写声明文件 `.d.ts`
3. 临时方案：`declare module 'xxx'`

---

_文档生成时间：2025 年 1 月_
_最后更新：2025 年 12 月 31 日_
_文件总数统计：124 个（不含空目录和资源文件）_
_核心手敲文件：15 个 | 建议手敲：14 个 | 看懂即可：95 个_
