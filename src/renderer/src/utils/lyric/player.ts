/**
 * 歌词播放器
 * 核心功能：时间同步、平滑滚动、二分查找、用户交互
 */

import gsap from 'gsap'
import type { LyricLine } from './parser'

export interface LyricPlayerOptions {
  container: HTMLElement
  audio: HTMLAudioElement
  onLineClick?: (time: number, index: number) => void
  onLineChange?: (index: number) => void
}

export class LyricPlayer {
  private container: HTMLElement
  private audio: HTMLAudioElement
  private lyrics: LyricLine[] = []
  private currentIndex: number = -1
  private rafId: number | null = null
  private isPlaying: boolean = false
  private isUserScrolling: boolean = false
  private scrollTimer: ReturnType<typeof setTimeout> | null = null
  private lineElements: HTMLElement[] = []
  private onLineClick?: (time: number, index: number) => void
  private onLineChange?: (index: number) => void
  private noTimestamp: boolean = false

  constructor(options: LyricPlayerOptions) {
    this.container = options.container
    this.audio = options.audio
    this.onLineClick = options.onLineClick
    this.onLineChange = options.onLineChange
    this.initEvents()
  }

  private initEvents(): void {
    // 用户滚动检测
    this.container.addEventListener('wheel', this.handleWheel, { passive: true })

    // 点击歌词跳转（事件委托）
    this.container.addEventListener('click', this.handleClick)
  }

  private handleWheel = (): void => {
    this.isUserScrolling = true
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    this.scrollTimer = setTimeout(() => {
      this.isUserScrolling = false
    }, 3000)
  }

  private handleClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement
    const lineEl = target.closest('.lyric-line') as HTMLElement
    if (!lineEl || this.noTimestamp) return

    const index = parseInt(lineEl.dataset.index || '0', 10)
    if (index >= 0 && index < this.lyrics.length) {
      const time = this.lyrics[index].time
      this.onLineClick?.(time, index)
    }
  }

  /**
   * 设置歌词数据并渲染
   */
  setLyrics(lyrics: LyricLine[], noTimestamp: boolean = false): void {
    this.lyrics = lyrics
    this.noTimestamp = noTimestamp
    this.currentIndex = -1
    this.render()

    if (!noTimestamp && lyrics.length > 0) {
      this.updateLine(0, true)
    }
  }

  /**
   * 渲染歌词 DOM
   */
  private render(): void {
    if (!this.container) return

    if (this.lyrics.length === 0) {
      this.container.innerHTML = `<div class="lyric-empty">暂无歌词</div>`
      this.lineElements = []
      return
    }

    const fragment = document.createDocumentFragment()
    this.lineElements = []

    // 顶部占位，让第一行能滚动到中间
    const topSpacer = document.createElement('div')
    topSpacer.className = 'lyric-spacer'
    topSpacer.style.height = '45%'
    fragment.appendChild(topSpacer)

    for (const line of this.lyrics) {
      const div = document.createElement('div')
      div.className = 'lyric-line'
      div.dataset.index = String(line.index)
      div.textContent = line.text || '...'
      if (this.noTimestamp) {
        div.classList.add('no-timestamp')
      }
      this.lineElements.push(div)
      fragment.appendChild(div)
    }

    // 底部占位，让最后一行能滚动到中间
    const bottomSpacer = document.createElement('div')
    bottomSpacer.className = 'lyric-spacer'
    bottomSpacer.style.height = '45%'
    fragment.appendChild(bottomSpacer)

    this.container.innerHTML = ''
    this.container.appendChild(fragment)
  }

  /**
   * 二分查找当前应该高亮的行
   */
  private findCurrentLine(time: number): number {
    if (this.lyrics.length === 0) return -1

    let left = 0
    let right = this.lyrics.length - 1

    // 时间在第一行之前
    if (time < this.lyrics[0].time) return 0

    // 时间在最后一行之后
    if (time >= this.lyrics[right].time) return right

    // 二分查找
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midTime = this.lyrics[mid].time
      const nextTime = mid < this.lyrics.length - 1 ? this.lyrics[mid + 1].time : Infinity

      if (time >= midTime && time < nextTime) {
        return mid
      }

      if (time < midTime) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    return left
  }

  /**
   * 更新当前行高亮和滚动
   */
  private updateLine(index: number, force: boolean = false): void {
    if (index === this.currentIndex && !force) return
    if (index < 0 || index >= this.lineElements.length) return

    // 移除旧的高亮
    if (this.currentIndex >= 0 && this.currentIndex < this.lineElements.length) {
      this.lineElements[this.currentIndex].classList.remove('active')
    }

    // 添加新的高亮
    this.currentIndex = index
    this.lineElements[index].classList.add('active')

    // 滚动到当前行
    this.scrollToLine(index, force)

    // 回调
    this.onLineChange?.(index)
  }

  /**
   * 平滑滚动到指定行（居中显示）
   */
  private scrollToLine(index: number, immediate: boolean = false): void {
    if (this.isUserScrolling && !immediate) return
    if (!this.lineElements[index]) return

    const lineEl = this.lineElements[index]
    const containerHeight = this.container.clientHeight
    const lineTop = lineEl.offsetTop
    const lineHeight = lineEl.clientHeight
    const targetScroll = lineTop - containerHeight / 2 + lineHeight / 2

    if (immediate) {
      this.container.scrollTop = targetScroll
    } else {
      gsap.to(this.container, {
        scrollTop: targetScroll,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
  }

  /**
   * 时间同步循环
   */
  private timeLoop = (): void => {
    if (!this.isPlaying || this.noTimestamp) return

    const currentTime = this.audio.currentTime
    const index = this.findCurrentLine(currentTime)

    if (index !== this.currentIndex) {
      this.updateLine(index)
    }

    this.rafId = requestAnimationFrame(this.timeLoop)
  }

  private startLoop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    this.rafId = requestAnimationFrame(this.timeLoop)
  }

  private stopLoop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * 开始播放
   */
  play(): void {
    if (this.noTimestamp) return
    this.isPlaying = true
    this.startLoop()
  }

  /**
   * 暂停
   */
  pause(): void {
    this.isPlaying = false
    this.stopLoop()
  }

  /**
   * 同步当前行索引（seek 后调用）
   */
  syncIndex(): void {
    if (this.noTimestamp) return
    const currentTime = this.audio.currentTime
    const index = this.findCurrentLine(currentTime)
    this.updateLine(index, true)

    // 恢复播放状态
    if (this.isPlaying) {
      this.startLoop()
    }
  }

  /**
   * 获取当前行索引
   */
  getIndex(): number {
    return this.currentIndex
  }

  /**
   * 获取播放状态
   */
  getPlayStatus(): boolean {
    return this.isPlaying
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.stopLoop()
    this.container.removeEventListener('wheel', this.handleWheel)
    this.container.removeEventListener('click', this.handleClick)

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }

    this.lineElements = []
    this.lyrics = []
  }
}
