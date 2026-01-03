<script setup lang="ts">
import { colorExtraction, gradualChange, useRhythm } from '@/components/MusicDetail/useMusic'
import { onMounted, ref, watch } from 'vue'
import { findBestColors, toggleImg } from '@/utils'
import { useMusicAction } from '@/store/music'
import { useSettings } from '@/store/settings'
import { useFlags } from '@/store/flags'

interface Props {
  bg: string
}
const bestColors = ref<any[]>([])
const props = defineProps<Props>()
const music = useMusicAction()
const settings = useSettings()
const flags = useFlags()
const rgb = ref<any[]>([])

// 保存 rhythmBox 和 splitImg 引用，供唤醒时使用
let rhythmBoxRef: HTMLDivElement | null = null
let splitImgFn: ((img: HTMLImageElement) => void) | null = null

/**
 * 执行完整的背景渲染逻辑
 * 包括：颜色提取、渐变背景、节律背景
 */
const executeFullRender = (bg: string, lyricBg: string) => {
  toggleImg(bg, '200y200').then((img) => {
    rgb.value = colorExtraction(img)
    bestColors.value = findBestColors(rgb.value, 2)
    music.updateBgColor(bestColors.value)
    gradualChange(img, bestColors.value)
    // 只有节律背景模式才执行 splitImg（Canvas绘图 + CSS规则插入）
    if (lyricBg === 'rhythm' && rhythmBoxRef && splitImgFn) {
      splitImgFn(img)
    }
  })
}

/**
 * 执行轻量级渲染（仅颜色提取，给底部播放栏使用）
 * 不执行 gradualChange 和 splitImg，避免后台GPU开销
 */
const executeLightRender = (bg: string) => {
  toggleImg(bg, '200y200').then((img) => {
    rgb.value = colorExtraction(img)
    bestColors.value = findBestColors(rgb.value, 2)
    music.updateBgColor(bestColors.value)
  })
}

onMounted(() => {
  rhythmBoxRef = document.querySelector('#rhythm-box') as HTMLDivElement
  const { splitImg } = useRhythm(rhythmBoxRef)
  splitImgFn = splitImg

  // 图片切换时，更新流动背景
  watch(
    [() => props.bg, () => settings.state.lyricBg],
    ([bg, lyricBg]) => {
      if (!bg) {
        return
      }

      /**
       * 【性能优化 - 休眠机制】
       * 问题：MusicDetail 组件使用 CSS transform 隐藏而非 v-if 销毁，
       *       导致 onUnmounted 永不触发，后台切歌时仍执行重渲染逻辑。
       * 解决：当详情页关闭时，只执行轻量级颜色提取（给底部栏用），
       *       跳过 gradualChange 和 splitImg 等高开销操作。
       */
      if (!flags.isOpenDetail) {
        // 详情页关闭时：仅更新颜色，不执行 Canvas/CSS/DOM 操作
        executeLightRender(bg)
        return
      }

      // 详情页打开时：执行完整渲染流程
      executeFullRender(bg, lyricBg)
    },
    {
      immediate: true
    }
  )

  /**
   * 【唤醒机制】监听详情页打开状态
   * 当用户打开详情页时，补做一次完整渲染，确保背景正确显示
   */
  watch(
    () => flags.isOpenDetail,
    (isOpen) => {
      if (isOpen && props.bg) {
        // 唤醒时执行完整渲染
        executeFullRender(props.bg, settings.state.lyricBg)
      }
    }
  )
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
