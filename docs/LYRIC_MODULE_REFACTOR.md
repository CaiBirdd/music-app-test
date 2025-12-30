# 歌词模块重构文档

## 📋 改造背景

原项目使用作者自己的 npm 包 `@lrc-player/parse` 和 `@lrc-player/core` 实现歌词解析和渲染滚动功能。为了更好地理解核心实现原理，便于面试讲解，我们自研实现了歌词模块，替换掉了这两个依赖。

---

## 📁 新增文件

```
src/renderer/src/utils/lyric/
├── index.ts        # 模块导出入口
├── parser.ts       # LRC 歌词解析器
├── player.ts       # 歌词播放器类
└── style.scss      # 歌词样式
```

---

## 🔧 修改文件

| 文件 | 修改内容 |
|------|----------|
| `store/music.ts` | 替换解析器引用，移除 YRC 相关逻辑 |
| `MusicPlayer/index.vue` | 替换 `@lrc-player/core` 为自研 `LyricPlayer` |
| `MusicDetail/LyricDisplay.vue` | 更新类型引用 |
| `MusicDetail/index.vue` | 移除 lrcMode 属性绑定 |
| `utils/index.ts` | 移除 Yrc 类型定义 |
| `package.json` | 移除 `@lrc-player/core` 和 `@lrc-player/parse` 依赖 |

---

## 🏗️ 核心模块设计

### 1. parser.ts - 歌词解析器

**数据结构定义：**

```typescript
interface LyricLine {
  time: number       // 开始时间（秒）
  duration: number   // 持续时间（秒）
  text: string       // 歌词文本
  index: number      // 行索引
}

interface ParseResult {
  lines: LyricLine[]
  noTimestamp: boolean  // 是否无时间戳（纯文本歌词）
}
```

**核心函数 `parseLRC()`：**

- 支持标准 LRC 格式：`[00:24.46]歌词内容`
- 支持多时间标签：`[03:05.32][01:28.24]同一句歌词`
- 自动跳过元数据：`[ti:xxx]`、`[ar:xxx]`、JSON 格式行
- 自动排序 + 计算每行 duration

### 2. player.ts - 歌词播放器

**类设计：**

```typescript
class LyricPlayer {
  // 核心属性
  private lyrics: LyricLine[]      // 歌词数据
  private currentIndex: number     // 当前高亮行
  private isUserScrolling: boolean // 用户是否在手动滚动
  private rafId: number | null     // requestAnimationFrame ID
  
  // 公共 API
  setLyrics(lyrics, noTimestamp)   // 设置歌词并渲染
  play()                           // 开始播放
  pause()                          // 暂停
  syncIndex()                      // 同步当前行（跳转后调用）
  destroy()                        // 销毁实例
}
```

---

## 🎯 核心技术点（面试可讲）

### 1. LRC 歌词格式解析

**技术要点：**
- 正则表达式匹配时间标签：`/\[(\d{1,2}:\d{1,2}(?:[.:]\d{1,3})?)\]/g`
- 时间格式转换：`'01:02.410'` → `62.41` 秒
- 多时间标签处理：同一句歌词可能对应多个时间点（副歌重复）
- 自动排序保证时间顺序

**示例代码：**
```typescript
function parseTime(timeStr: string): number {
  const parts = timeStr.split(':')
  const minutes = parseInt(parts[0], 10)
  const seconds = parseFloat(parts[1])
  return minutes * 60 + seconds
}
```

### 2. 二分查找定位当前行

**技术要点：**
- 时间复杂度 O(log n)，比线性查找 O(n) 更高效
- 适用于歌词数量较多的场景
- 边界处理：时间在第一行之前、最后一行之后

**核心实现：**
```typescript
private findCurrentLine(time: number): number {
  let left = 0, right = this.lyrics.length - 1
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const midTime = this.lyrics[mid].time
    const nextTime = mid < this.lyrics.length - 1 
      ? this.lyrics[mid + 1].time 
      : Infinity

    if (time >= midTime && time < nextTime) {
      return mid  // 找到当前行
    }
    if (time < midTime) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }
  return left
}
```

### 3. requestAnimationFrame 时间同步

**技术要点：**
- 使用 `requestAnimationFrame` 替代 `setInterval`
- 与浏览器刷新率同步（通常 60fps），更流畅
- 页面不可见时自动暂停，节省资源

**核心实现：**
```typescript
private timeLoop = (): void => {
  if (!this.isPlaying) return
  
  const currentTime = this.audio.currentTime
  const index = this.findCurrentLine(currentTime)
  
  if (index !== this.currentIndex) {
    this.updateLine(index)
  }
  
  this.rafId = requestAnimationFrame(this.timeLoop)
}
```

### 4. GSAP 平滑滚动

**技术要点：**
- 使用 GSAP 动画库实现平滑滚动
- 缓动函数 `power2.out` 提供自然的减速效果
- 滚动目标计算：让当前行居中显示

**核心实现：**
```typescript
private scrollToLine(index: number): void {
  const lineEl = this.lineElements[index]
  const containerHeight = this.container.clientHeight
  const lineTop = lineEl.offsetTop
  const lineHeight = lineEl.clientHeight
  // 计算目标位置，使当前行居中
  const targetScroll = lineTop - containerHeight / 2 + lineHeight / 2
  
  gsap.to(this.container, {
    scrollTop: targetScroll,
    duration: 0.4,
    ease: 'power2.out'
  })
}
```

### 5. 用户滚动检测与冲突处理

**技术要点：**
- 监听 `wheel` 事件检测用户手动滚动
- 用户滚动后 3 秒内暂停自动滚动
- 避免自动滚动与用户操作冲突，提升用户体验

**核心实现：**
```typescript
private handleWheel = (): void => {
  this.isUserScrolling = true
  if (this.scrollTimer) {
    clearTimeout(this.scrollTimer)
  }
  // 3秒后恢复自动滚动
  this.scrollTimer = setTimeout(() => {
    this.isUserScrolling = false
  }, 3000)
}
```

### 6. 事件委托处理点击

**技术要点：**
- 使用事件委托，只在容器上绑定一个事件
- 通过 `closest()` 查找目标歌词行
- 减少事件监听器数量，提升性能

**核心实现：**
```typescript
private handleClick = (e: MouseEvent): void => {
  const target = e.target as HTMLElement
  const lineEl = target.closest('.lyric-line') as HTMLElement
  if (!lineEl) return
  
  const index = parseInt(lineEl.dataset.index || '0', 10)
  const time = this.lyrics[index].time
  this.onLineClick?.(time, index)
}
```

### 7. DocumentFragment 优化 DOM 操作

**技术要点：**
- 使用 `DocumentFragment` 批量插入 DOM 节点
- 减少重排重绘次数，提升渲染性能
- 一次性将所有歌词行添加到文档中

**核心实现：**
```typescript
private render(): void {
  const fragment = document.createDocumentFragment()
  
  for (const line of this.lyrics) {
    const div = document.createElement('div')
    div.className = 'lyric-line'
    div.dataset.index = String(line.index)
    div.textContent = line.text
    fragment.appendChild(div)
  }
  
  this.container.innerHTML = ''
  this.container.appendChild(fragment)  // 一次性插入
}
```

---

## 📊 代码量统计

| 模块 | 代码行数 |
|------|----------|
| parser.ts | ~108 行 |
| player.ts | ~299 行 |
| style.scss | ~82 行 |
| index.ts | ~10 行 |
| **总计** | **~499 行** |

---

## ✅ 功能清单

- [x] LRC 歌词解析（支持多时间标签）
- [x] 歌词渲染与样式
- [x] 时间同步与自动滚动
- [x] 二分查找优化当前行定位
- [x] 平滑滚动动画（GSAP）
- [x] 用户滚动检测与冲突处理
- [x] 点击歌词跳转播放
- [x] 当前行高亮样式
- [x] 无时间戳歌词兼容
- [x] 资源清理（destroy）

