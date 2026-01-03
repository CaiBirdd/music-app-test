<script lang="ts" setup>
import { toggleImg } from '@/utils'
import type { LyricLine } from '@/utils/lyric'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import gsap from 'gsap'
import { useRouter } from 'vue-router'
import { useFlags } from '@/store/flags'

interface Props {
  lyric: LyricLine[]
  title: string
  bg?: string
  isBlur?: boolean
  ar: any[]
  videoPlayUrl: string | null
}
const props = withDefaults(defineProps<Props>(), {
  isBlur: true
})
const router = useRouter()
const flash = useFlags()
const videoCover = useTemplateRef<HTMLVideoElement>('videoCover')

// GSAP动画实例，用于清理上一个动画防止累积
let currentTimeline: gsap.core.Timeline | null = null

// 保存 DOM 引用，供唤醒时使用
let bgElRef: HTMLDivElement | null = null
let coverElRef: HTMLDivElement | null = null

// 用于追踪当前加载的图片URL，防止竞态条件
let currentLoadingBg: string | null = null

/**
 * 执行封面动画和图片加载
 * @param val 图片URL
 * @param immediate 是否立即显示（跳过缩小动画）
 */
const executeCoverAnimation = (val: string, immediate: boolean = false) => {
  if (!bgElRef || !val) return

  // 记录当前正在加载的图片URL，用于竞态条件检测
  currentLoadingBg = val

  // 清理上一个动画，防止动画累积
  if (currentTimeline) {
    currentTimeline.kill()
  }

  // 创建一个 GSAP 时间轴
  currentTimeline = gsap.timeline()

  if (!immediate) {
    // 使用时间轴先缩小元素
    currentTimeline.to(bgElRef, {
      height: '10vh',
      width: '10vh',
      duration: 0.3,
      ease: 'power1.out',
      transformOrigin: 'center'
    })
  }

  toggleImg(val, '600y600').then((img) => {
    /**
     * 【竞态条件检测】
     * 如果异步加载完成时，currentLoadingBg 已经变了，
     * 说明用户又切歌了，当前这次加载结果应该被丢弃
     */
    if (currentLoadingBg !== val) {
      return
    }

    if (!currentTimeline) return

    /**
     * 【immediate 模式优化】
     * 当 immediate=true 时，直接设置背景图，不依赖 GSAP 的 onStart 回调
     * 因为 duration=0 时 onStart 的执行时机可能不稳定
     */
    if (immediate && coverElRef && !props.videoPlayUrl) {
      coverElRef.style.backgroundImage = `url(${img.src})`
      // 确保尺寸正确
      bgElRef!.style.height = '45vh'
      bgElRef!.style.width = '45vh'
      return
    }

    currentTimeline.to(bgElRef, {
      height: '45vh',
      width: '45vh',
      duration: 0.3,
      ease: 'power1.out',
      transformOrigin: 'center',
      onStart: () => {
        if (!props.videoPlayUrl && coverElRef) {
          coverElRef.style.backgroundImage = `url(${img.src})`
        }
      }
    })
  })
}

nextTick(() => {
  bgElRef = document.querySelector('.cover-container') as HTMLDivElement
  coverElRef = document.querySelector('.img-cover') as HTMLDivElement

  // 监听播放状态，控制视频封面播放/暂停
  watch(
    () => window.$audio?.isPlay,
    (value) => {
      if (!props.videoPlayUrl) {
        return
      }
      if (!value) {
        videoCover.value?.pause()
      } else {
        videoCover.value?.play()
      }
    }
  )

  watch(
    () => props.bg,
    async (val) => {
      if (!bgElRef || !val) return

      /**
       * 【性能优化 - 休眠机制】
       * 问题：MusicDetail 组件使用 CSS transform 隐藏而非 v-if 销毁，
       *       导致 onUnmounted 永不触发，后台切歌时仍加载600x600大图并执行GSAP动画。
       * 解决：当详情页关闭时，仅清理旧动画，不加载大图、不创建新动画，
       *       等用户打开详情页时再执行渲染。
       */
      if (!flash.isOpenDetail) {
        // 详情页关闭时：只清理旧动画，不执行新渲染
        if (currentTimeline) {
          currentTimeline.kill()
          currentTimeline = null
        }
        return
      }

      // 详情页打开时：执行完整的封面动画
      executeCoverAnimation(val)
    },
    { immediate: true }
  )

  /**
   * 【唤醒机制】监听详情页打开状态
   * 当用户打开详情页时，补做一次封面渲染，确保图片正确显示
   */
  watch(
    () => flash.isOpenDetail,
    (isOpen) => {
      if (isOpen && props.bg) {
        // 唤醒时执行渲染（immediate=true 跳过缩小动画，直接显示）
        executeCoverAnimation(props.bg, true)
      }
    }
  )
})
const arNames = computed(() => {
  let result = ''
  props.ar.forEach((item, index) => {
    result += props.ar.length - 1 !== index ? item.name + '/' : item.name
  })
  return result
})
</script>

<template>
  <div :style="{ 'backdrop-filter': isBlur ? 'blur(0px)' : 'none' }" class="shadow">
    <div class="lyric-and-bg-container">
      <div
        class="cover-container"
        :style="{ transform: props.lyric.length ? '' : 'translateX(0)' }"
      >
        <div
          class="title"
          @click="
            () => {
              flash.isOpenDetail = false
              router.push({
                path: `/search`,
                query: {
                  key: props.title + '-' + arNames
                }
              })
            }
          "
        >
          {{ props.title }} -
          <span v-for="(item, index) in props.ar" :key="item.id"
            >{{ item.name }} <span v-if="props.ar.length - 1 !== index">/</span></span
          >
        </div>
        <video
          v-show="props.videoPlayUrl"
          ref="videoCover"
          class="video-cover"
          autoplay
          loop
          muted
          :src="props.videoPlayUrl || undefined"
        ></video>
        <div v-show="!props.videoPlayUrl" class="img-cover" />
      </div>

      <div v-show="props.lyric.length" class="lyric-container"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*
 * 歌词显示层性能优化说明:
 * 1. backdrop-filter 是高开销属性，使用 will-change 提示浏览器预优化
 * 2. 使用 contain 属性隔离重绘范围
 * 3. 使用 transform: translate3d 开启GPU合成层
 */
.shadow {
  backdrop-filter: blur(8px);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* GPU加速优化 - backdrop-filter是高开销属性 */
  will-change: backdrop-filter;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  /* 限制重绘范围 */
  contain: layout style;

  .lyric-and-bg-container {
    display: flex;
    margin-top: 17vh;
    justify-content: space-evenly;
    align-items: center;
    height: 58vh;
    /* 优化: 仅对transform属性使用过渡，避免触发全属性过渡 */
    transition: transform 1s ease-out;

    .cover-container {
      width: 45vh;
      transform-origin: center;
      /* 优化: 明确指定过渡属性 */
      transition:
        width 0.8s ease-out,
        height 0.8s ease-out;
      will-change: width, height;
    }

    .title {
      font-size: 25px;
      font-weight: 500;
      width: 100%;
      cursor: pointer;
      @include textOverflow(1);
    }

    .video-cover {
      height: 100%;
      width: 100%;
      border-radius: 5px;
    }

    .img-cover {
      height: 100%;
      width: 100%;
      border-radius: 5px;
      /* 优化: 仅对背景图过渡 */
      transition: background-image 0.8s ease-out;
      @extend .bgSetting;
    }

    .lyric-container {
      height: 145%;
      width: 42vw;
      border-radius: 5px;
      overflow: auto;
      mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(
        to bottom,
        transparent,
        black 10%,
        black 90%,
        transparent
      );
      position: relative;
      /* 优化滚动性能 */
      will-change: scroll-position;
      contain: layout style;
    }
  }
}
</style>
