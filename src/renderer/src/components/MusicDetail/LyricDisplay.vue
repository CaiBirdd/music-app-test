<script lang="ts" setup>
import { toggleImg } from '@/utils'
import type { LyricLine } from '@/utils/lyric'
import { computed, nextTick, onUnmounted, useTemplateRef, watch, type WatchStopHandle } from 'vue'
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

// 内存优化: 保存watch停止句柄和GSAP动画实例，便于清理
let stopWatchPlay: WatchStopHandle | null = null
let stopWatchBg: WatchStopHandle | null = null
let currentTimeline: gsap.core.Timeline | null = null

nextTick(() => {
  const bgEl = document.querySelector('.cover-container') as HTMLDivElement
  const coverEl = document.querySelector('.img-cover') as HTMLDivElement

  // 保存watch停止句柄
  stopWatchPlay = watch(
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

  stopWatchBg = watch(
    () => props.bg,
    async (val) => {
      if (!bgEl || !val) return

      // 清理上一个动画，防止动画累积
      if (currentTimeline) {
        currentTimeline.kill()
      }

      // 创建一个 GSAP 时间轴
      currentTimeline = gsap.timeline()
      // 使用时间轴先缩小元素
      currentTimeline.to(bgEl, {
        height: '10vh',
        width: '10vh',
        duration: 0.3,
        ease: 'power1.out',
        transformOrigin: 'center'
      })

      toggleImg(val, '600y600').then((img) => {
        if (!currentTimeline) return
        currentTimeline.to(bgEl, {
          height: '45vh',
          width: '45vh',
          duration: 0.3,
          ease: 'power1.out',
          transformOrigin: 'center',
          onStart: () => {
            if (!props.videoPlayUrl) {
              ;(coverEl as HTMLDivElement).style.backgroundImage = `url(${img.src})`
            }
          }
        })
      })
    },
    { immediate: true }
  )
})

// 组件卸载时清理所有资源
onUnmounted(() => {
  // 停止watch
  stopWatchPlay?.()
  stopWatchBg?.()

  // 清理GSAP动画
  if (currentTimeline) {
    currentTimeline.kill()
    currentTimeline = null
  }
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
