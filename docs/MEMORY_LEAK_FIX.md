# 内存泄漏修复优化

## 问题描述

应用在使用过程中内存占用持续增长：
- 初始启动: ~500MB
- 使用10-15分钟后: ~1.2GB

同时出现功能问题：歌曲详情页的图片和歌词偶尔不随歌曲切换更新。

## 问题根源分析

### 1. 定时器未清理

**Search/index.vue** - 递归 setTimeout 永不停止

```typescript
// 问题代码
const getSearchDefault = async () => {
  const { data } = await searchDefault()
  // ...
  setTimeout(getSearchDefault, 30000) // 递归调用，永不停止
}
getSearchDefault()
```

每30秒创建一个新的定时器，组件销毁后仍在运行，导致：
- 定时器累积
- 闭包引用无法释放
- 网络请求持续发送

### 2. Watch 监听器未停止

**LyricDisplay.vue / FlowBg.vue** - 在 `nextTick` 或 `onMounted` 中创建的 watch 没有保存停止句柄

```typescript
// 问题代码
nextTick(() => {
  watch(() => props.bg, (val) => {
    // 处理逻辑
  })
  // watch 没有保存返回的 stop 函数
})
```

虽然 Vue 会在组件卸载时自动停止 watch，但在某些情况下（如组件重新渲染但未完全卸载），这些 watch 可能继续运行。

### 3. GSAP 动画未清理

**LyricDisplay.vue** - 每次切换歌曲都创建新的 timeline，旧动画未被清理

```typescript
// 问题代码
watch(() => props.bg, async (val) => {
  const tl = gsap.timeline() // 每次都创建新实例
  tl.to(bgEl, { /* ... */ })
  // 旧的 timeline 未被 kill()
})
```

GSAP 动画实例会持有 DOM 元素引用，未清理会导致内存泄漏。

### 4. LyricPlayer 未销毁

**MusicPlayer/index.vue** - LyricPlayer 实例只创建不销毁

```typescript
// 问题代码
let player: LyricPlayer | null = null

function initPlayer() {
  if (player) return // 已存在则直接返回，不更新
  // ...
}
// 缺少 onUnmounted 清理
```

LyricPlayer 内部保存了事件监听器和 DOM 引用，未调用 `destroy()` 会导致资源泄漏。

### 5. 数组持续增长

**store/music.ts** - lastIndexList 没有长度限制

```typescript
// 问题代码
watch(() => state.value.index, (value, oldValue) => {
  state.value.lastIndexList.push(oldValue) // 无限增长
})
```

播放历史记录持续累积，长时间使用后会占用大量内存。

### 6. Image 对象事件处理器未清理

**utils/index.ts** - toggleImg 创建的 Image 对象事件未清理

```typescript
// 问题代码
img.onload = () => {
  resolve(img)
  // onload 和 onerror 仍然引用闭包
}
```

事件处理器会保持对闭包的引用，阻止垃圾回收。

## 修复方案

### 1. Search/index.vue - 定时器清理

```typescript
// 保存定时器ID
let searchDefaultTimer: ReturnType<typeof setTimeout> | null = null

const getSearchDefault = async () => {
  const { data } = await searchDefault()
  // ...
  if (searchDefaultTimer) {
    clearTimeout(searchDefaultTimer)
  }
  searchDefaultTimer = setTimeout(getSearchDefault, 30000)
}

// 组件卸载时清理
onUnmounted(() => {
  if (searchDefaultTimer) {
    clearTimeout(searchDefaultTimer)
    searchDefaultTimer = null
  }
})
```

### 2. LyricDisplay.vue - Watch 和 GSAP 清理

```typescript
// 保存停止句柄和动画实例
let stopWatchPlay: WatchStopHandle | null = null
let stopWatchBg: WatchStopHandle | null = null
let currentTimeline: gsap.core.Timeline | null = null

nextTick(() => {
  stopWatchBg = watch(() => props.bg, async (val) => {
    // 清理上一个动画
    if (currentTimeline) {
      currentTimeline.kill()
    }
    currentTimeline = gsap.timeline()
    // ...
  })
})

onUnmounted(() => {
  stopWatchPlay?.()
  stopWatchBg?.()
  if (currentTimeline) {
    currentTimeline.kill()
    currentTimeline = null
  }
})
```

### 3. MusicPlayer/index.vue - LyricPlayer 销毁

```typescript
function initPlayer() {
  const container = document.querySelector('.lyric-container')
  if (!container || !audio.value) return

  // 如果已存在，先销毁旧实例
  if (player) {
    player.destroy()
  }

  player = new LyricPlayer({
    container,
    audio: audio.value,
    onLineClick: handleLyricClick
  })
}

onUnmounted(() => {
  clearInterval(timer)
  if (player) {
    player.destroy()
    player = null
  }
  // 移除事件监听器
  if (audio.value && audioErrorHandler) {
    audio.value.removeEventListener('error', audioErrorHandler)
  }
  if (audio.value) {
    audio.value.oncanplay = null
  }
})
```

### 4. store/music.ts - 限制数组长度

```typescript
watch(() => state.value.index, (value, oldValue) => {
  state.value.lastIndexList.push(oldValue)
  // 限制历史记录最大长度
  const MAX_HISTORY_LENGTH = 100
  if (state.value.lastIndexList.length > MAX_HISTORY_LENGTH) {
    state.value.lastIndexList = state.value.lastIndexList.slice(-MAX_HISTORY_LENGTH)
  }
})
```

### 5. FlowBg.vue - Watch 停止句柄

```typescript
let stopWatchBg: WatchStopHandle | null = null

onMounted(() => {
  const { splitImg, cleanup } = useRhythm(rhythmBox)
  rhythmCleanup = cleanup

  // 保存 watch 停止句柄
  stopWatchBg = watch([() => props.bg, () => settings.state.lyricBg], ([bg, lyricBg]) => {
    // ...
  })
})

onUnmounted(() => {
  stopWatchBg?.()
  rhythmCleanup?.()
})
```

### 6. utils/index.ts - Image 事件清理

```typescript
export function toggleImg(src: string, size?: string): Promise<HTMLImageElement> {
  // ...
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // 清理事件处理器，帮助垃圾回收
      img.onload = null
      img.onerror = null
      resolve(img)
    }
    img.onerror = () => {
      img.onload = null
      img.onerror = null
      reject(new Error(`Failed to load image: ${src}`))
    }
  })
}
```

## 修复文件清单

| 文件 | 问题 | 修复方式 |
|------|------|----------|
| `src/renderer/src/components/Search/index.vue` | setTimeout递归 | 添加定时器清理 |
| `src/renderer/src/components/MusicDetail/LyricDisplay.vue` | Watch/GSAP未清理 | 保存句柄并清理 |
| `src/renderer/src/components/MusicPlayer/index.vue` | LyricPlayer未销毁 | 添加destroy调用 |
| `src/renderer/src/store/music.ts` | 数组无限增长 | 限制最大长度 |
| `src/renderer/src/components/MusicDetail/FlowBg.vue` | Watch未清理 | 保存停止句柄 |
| `src/renderer/src/utils/index.ts` | Image事件未清理 | 清理事件处理器 |

## 内存泄漏排查技巧

### 1. Chrome DevTools Memory 面板

1. 打开 DevTools → Memory 面板
2. 选择 "Heap snapshot"
3. 操作应用（如切换几首歌曲）
4. 再次拍摄快照
5. 比较两个快照，查看增长的对象

### 2. Performance Monitor

1. DevTools → More tools → Performance Monitor
2. 观察 JS heap size 变化趋势
3. 正常应用应该呈现锯齿状（有涨有降）
4. 持续上涨说明存在泄漏

### 3. 常见泄漏模式

- **定时器**: setInterval/setTimeout 未清理
- **事件监听器**: addEventListener 后未 removeEventListener
- **闭包**: 函数引用外部变量，阻止垃圾回收
- **DOM 引用**: JavaScript 对象持有 DOM 元素引用
- **全局变量**: 数据存储在全局对象中不断增长

## 预期效果

修复后的内存表现：
- 初始启动后内存稳定在 500-600MB
- 长时间使用（1小时以上）内存保持稳定
- 歌曲切换时内存有小幅波动，但会被垃圾回收

---

## 第二次修复 (搜索页面专项)

### 问题描述

用户反馈：在歌单页面播放歌曲内存保持正常(500-600MB)，但在搜索页面点击播放后内存逐渐增长。

### 问题分析

#### 1. Blob URL 未释放

**文件**: `src/renderer/src/views/SearchList/config.ts`

```typescript
// 问题代码
fetch(url)
  .then((response) => response.blob())
  .then((blob) => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob) // 创建了 Blob URL
    link.download = name + '.mp3'
    link.click()
    // Blob URL 永远不会被释放！
  })
```

每次下载都会创建一个 Blob URL，但从未调用 `URL.revokeObjectURL()` 释放。Blob URL 会持有整个音频文件的二进制数据，累积后占用大量内存。

#### 2. downloadVisible 状态对象持续增长

**文件**: `src/renderer/src/views/SearchList/config.ts`

```typescript
// 问题代码
const downloadVisible = ref<Record<number, boolean>>({})
// 每次点击下载无音源的歌曲
downloadVisible.value[id] = true
// 对象持续增长，键永远不会被删除
```

#### 3. itemRefs DOM 引用累积

**文件**: `src/renderer/src/components/SongList/index.vue`

```typescript
// 问题代码
const itemRefs = ref<Record<number, HTMLDivElement>>({})
const setItemRef = (el: any, id: number) => {
  if (el) {
    itemRefs.value[id] = el.$el || el
    // 引用只增不减，即使列表项已被移除
  }
}
```

搜索结果每次翻页都会添加新的 DOM 引用，但旧引用从不清理。

#### 4. oncanplay 闭包累积

**文件**: `src/renderer/src/store/music.ts`

```typescript
// 问题代码
window.$audio.el.oncanplay = async () => {
  // 每次播放都创建新闭包
  // 旧的闭包被覆盖但可能未被GC
}
```

### 修复方案

#### 1. 释放 Blob URL

```typescript
fetch(url)
  .then((response) => response.blob())
  .then((blob) => {
    const link = document.createElement('a')
    const blobUrl = URL.createObjectURL(blob)
    link.href = blobUrl
    link.download = name + '.mp3'
    link.click()
    // 内存优化: 下载开始后释放 Blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 1000)
  })
```

#### 2. 简化 downloadVisible 状态

```typescript
// 只保存当前正在处理的ID，而不是所有历史记录
const downloadVisible = ref<number | null>(null)

// 使用时
downloadVisible.value = id // 显示弹窗
downloadVisible.value = null // 关闭弹窗
```

#### 3. 清理不再需要的 itemRefs

```typescript
const setItemRef = (el: any, id: number) => {
  if (el) {
    itemRefs.value[id] = el.$el || el
  } else {
    // 元素被卸载时删除引用
    delete itemRefs.value[id]
  }
}

// 在列表更新时清理
watch(() => props.list, (val) => {
  filterList.value = val
  // 清理不再存在的项的DOM引用
  const currentIds = new Set(val.map((item) => item.id))
  Object.keys(itemRefs.value).forEach((key) => {
    const id = Number(key)
    if (!currentIds.has(id)) {
      delete itemRefs.value[id]
    }
  })
})
```

#### 4. 清理旧的 oncanplay 处理器

```typescript
// 先清理旧的处理器
window.$audio.el.oncanplay = null
window.$audio.el.oncanplay = async () => {
  try {
    await window.$audio.play()
  } catch (error) {
    console.error('播放失败:', error)
  }
}
```

### 本次修复文件清单

| 文件 | 问题 | 修复方式 |
|------|------|----------|
| `src/renderer/src/views/SearchList/config.ts` | Blob URL 泄漏 | 添加 revokeObjectURL 调用 |
| `src/renderer/src/views/SearchList/config.ts` | 状态对象增长 | 改用单值状态 |
| `src/renderer/src/components/SongList/index.vue` | DOM 引用累积 | 添加清理逻辑 |
| `src/renderer/src/store/music.ts` | 闭包累积 | 先置 null 再赋值 |

### 为什么搜索页面特别容易出问题

1. **高频操作**: 用户会频繁搜索、翻页、播放
2. **大量数据**: 搜索结果通常较多，每次都会创建新的 DOM 元素引用
3. **下载功能**: 只有搜索页面有下载按钮，Blob URL 泄漏只在这里发生
4. **列表切换**: 不像歌单页面，搜索结果每次都是全新的列表

---

## 日期

- 首次修复日期: 2026-01-02
- 第二次修复日期: 2026-01-02 (搜索页面专项)

