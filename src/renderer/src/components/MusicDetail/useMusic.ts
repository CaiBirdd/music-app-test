import ColorThief from 'colorthief'

let pointer = 1

export function colorExtraction(img: HTMLImageElement) {
  const colorThief = new ColorThief()
  return colorThief.getPalette(img) as Array<Array<string>>
}

/**
 * 渐变背景切换函数
 * 使用双缓冲技术实现平滑过渡，避免闪烁
 */
export function gradualChange(img: HTMLImageElement, rgb: Array<Array<string>>) {
  const gradual1 = document.querySelector('#gradual1') as HTMLDivElement
  const gradual2 = document.querySelector('#gradual2') as HTMLDivElement
  if (!gradual1 || !gradual2) {
    return
  }
  if (img) {
    if (pointer === 0) {
      gradual1.style.backgroundImage = `linear-gradient(rgb(${rgb[0]}), rgb(${rgb[1]}))`
      gradual1.style.opacity = '1'

      gradual2.style.opacity = '0'
      pointer = 1
    } else {
      gradual2.style.backgroundImage = `linear-gradient(rgb(${rgb[0]}), rgb(${rgb[1]}))`
      gradual2.style.opacity = '1'

      gradual1.style.opacity = '0'
      pointer = 0
    }
  } else {
    if (pointer === 0) {
      gradual1.style.backgroundImage = ``
      gradual1.style.opacity = '1'

      gradual2.style.opacity = '0'
      pointer = 1
    } else {
      gradual2.style.backgroundImage = ``
      gradual2.style.opacity = '1'

      gradual1.style.opacity = '0'
      pointer = 0
    }
  }
}

/**
 * 节律背景效果Hook
 * 性能优化点:
 * 1. 复用canvas对象，避免重复创建
 * 2. 清理旧CSS规则，防止内存泄漏
 * 3. 使用requestAnimationFrame优化渲染时机
 * 4. 复用DOM元素，减少重排重绘
 */
export const useRhythm = (insertionEl: HTMLElement | null) => {
  // 创建并缓存style标签，避免重复创建
  const style = document.createElement('style')
  style.id = 'rhythm-animation-styles'
  document.head.appendChild(style)
  const stylesheet = style.sheet

  // 复用canvas对象池，避免每次切换图片都创建新canvas
  const canvasPool: HTMLCanvasElement[] = []
  for (let i = 0; i < 4; i++) {
    canvasPool.push(document.createElement('canvas'))
  }

  // 记录已插入的CSS规则数量，用于清理
  let insertedRulesCount = 0

  /**
   * 清理旧的CSS动画规则
   * 防止规则累积导致内存泄漏和性能下降
   */
  const clearOldRules = () => {
    if (!stylesheet) return
    // 从后往前删除，避免索引偏移问题
    while (insertedRulesCount > 0 && stylesheet.cssRules.length > 0) {
      stylesheet.deleteRule(stylesheet.cssRules.length - 1)
      insertedRulesCount--
    }
    insertedRulesCount = 0
  }

  /**
   * 分割图片并创建旋转动画效果
   * 将专辑封面分割为4块，分别在四角进行旋转动画
   */
  const splitImg = (img: HTMLImageElement) => {
    if (!insertionEl) return

    // 清理旧的CSS规则
    clearOldRules()

    const imgWidth = img.naturalWidth
    const imgHeight = img.naturalHeight
    const smallImageWidth = imgWidth / 2
    const smallImageHeight = imgHeight / 2
    let index = 0
    const nodesLength = insertionEl.childNodes.length

    // 使用requestAnimationFrame确保在下一帧渲染，减少卡顿
    requestAnimationFrame(() => {
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          // 复用canvas对象
          const cutCanvas = canvasPool[index]
          cutCanvas.width = smallImageWidth
          cutCanvas.height = smallImageHeight

          const cutCtx = cutCanvas.getContext('2d', {
            // 禁用alpha通道提升性能（背景不需要透明）
            alpha: false,
            // 降低绘制质量以提升性能
            desynchronized: true
          })
          if (!cutCtx) return

          // 绘制图片切片
          cutCtx.drawImage(
            img,
            x * smallImageWidth,
            y * smallImageHeight,
            smallImageWidth,
            smallImageHeight,
            0,
            0,
            smallImageWidth,
            smallImageHeight
          )

          // 使用较低质量的JPEG格式，显著减少内存占用
          // 由于会应用大模糊效果，图片质量损失不明显
          const imgUrl = cutCanvas.toDataURL('image/jpeg', 0.6)

          if (!nodesLength) {
            // 首次创建DOM元素
            const imageElement = document.createElement('div')
            imageElement.className = `cut-image cut-image-${index}`
            imageElement.style.cssText = `
              background-image: url(${imgUrl});
              width: 50vw;
              height: 50vh;
              position: absolute;
              left: ${x * 50}vw;
              top: ${y * 50}vh;
              background-size: cover;
              will-change: transform;
              contain: layout style paint;
            `
            insertionEl.appendChild(imageElement)
          } else {
            // 复用已有DOM元素，只更新背景图
            const node = insertionEl.childNodes[index] as HTMLElement
            node.style.backgroundImage = `url(${imgUrl})`
          }

          // 生成随机初始角度
          const deg = Math.floor(Math.random() * 360)
          const animationName = `cut-rotate-${index}-${Date.now()}`

          // 插入新的CSS动画规则
          if (stylesheet) {
            stylesheet.insertRule(
              `@keyframes ${animationName} {
                from { transform: rotate(${deg}deg) translate3d(0,0,0); }
                to { transform: rotate(${deg + 360}deg) translate3d(0,0,0); }
              }`,
              stylesheet.cssRules.length
            )
            insertedRulesCount++

            stylesheet.insertRule(
              `div.cut-image-${index} {
                animation: ${animationName} 80s infinite linear;
                backface-visibility: hidden;
                perspective: 1000px;
              }`,
              stylesheet.cssRules.length
            )
            insertedRulesCount++
          }

          index++
        }
      }
    })
  }

  /**
   * 清理函数，组件卸载时调用
   */
  const cleanup = () => {
    clearOldRules()
    const styleEl = document.getElementById('rhythm-animation-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }

  return {
    splitImg,
    cleanup
  }
}
