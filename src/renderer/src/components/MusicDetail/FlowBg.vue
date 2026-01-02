<script setup lang="ts">
import { colorExtraction, gradualChange, useRhythm } from '@/components/MusicDetail/useMusic'
import { onMounted, onUnmounted, ref, watch, type WatchStopHandle } from 'vue'
import { findBestColors, toggleImg } from '@/utils'
import { useMusicAction } from '@/store/music'
import { useSettings } from '@/store/settings'

interface Props {
  bg: string
}
const bestColors = ref<any[]>([])
const props = defineProps<Props>()
const music = useMusicAction()
const settings = useSettings()
const rgb = ref<any[]>([])

// 内存优化: 保存cleanup函数和watch停止句柄，用于组件卸载时清理
let rhythmCleanup: (() => void) | null = null
let stopWatchBg: WatchStopHandle | null = null

onMounted(() => {
  const rhythmBox = document.querySelector('#rhythm-box') as HTMLDivElement
  const { splitImg, cleanup } = useRhythm(rhythmBox)
  rhythmCleanup = cleanup

  // 图片切换时，更新流动背景
  // 保存watch停止句柄
  stopWatchBg = watch(
    [() => props.bg, () => settings.state.lyricBg],
    ([bg, lyricBg]) => {
      if (!bg) {
        return
      }
      // 使用较小的图片尺寸进行颜色提取，减少内存占用
      toggleImg(bg, '200y200').then((img) => {
        rgb.value = colorExtraction(img)
        bestColors.value = findBestColors(rgb.value, 2)
        music.updateBgColor(bestColors.value)
        gradualChange(img, bestColors.value)
        if (lyricBg === 'rhythm' && rhythmBox) {
          splitImg(img)
        }
      })
    },
    {
      immediate: true
    }
  )
})

// 组件卸载时清理所有资源
onUnmounted(() => {
  // 停止watch
  stopWatchBg?.()
  // 清理节律背景资源
  rhythmCleanup?.()
})
</script>

<template>
  <div class="flow-bg-container">
    <div id="gradual1" />
    <div id="gradual2" />
    <div v-show="settings.state.lyricBg === 'rhythm'" id="rhythm-box" />
  </div>
</template>

<style scoped lang="scss">
/* 
 * 流动背景性能优化说明:
 * 1. 使用 will-change 提示浏览器预先优化
 * 2. 使用 transform: translate3d(0,0,0) 开启GPU硬件加速
 * 3. 使用 contain 属性限制重绘范围
 * 4. 降低 blur 值从 120px 到 80px，在保持效果的同时减少GPU开销
 */
.flow-bg-container {
  position: absolute;
  width: 100%;
  height: 100%;
  /* 使用contain限制布局计算范围 */
  contain: layout style;
}

#gradual1,
#gradual2 {
  height: 100%;
  width: 100%;
  transition: opacity 1s ease-out;
  position: absolute;
  /* GPU加速 */
  will-change: opacity, background-image;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

#rhythm-box {
  position: absolute;
  width: 100%;
  height: 100%;
  /* 
   * 性能优化: 将blur从120px降低到80px
   * 80px的模糊效果视觉上差异不大，但GPU开销显著降低
   * 模糊半径越大，需要采样的像素越多，计算量呈指数增长
   */
  filter: blur(80px);
  /* GPU加速优化 */
  will-change: filter;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  /* 限制重绘范围 */
  contain: layout style paint;

  :global(.cut-image) {
    transition: background-image 0.3s linear;
    /* 已在JS中添加will-change和contain */
  }
}
</style>
