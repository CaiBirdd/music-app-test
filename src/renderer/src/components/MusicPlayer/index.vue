<script setup lang="ts">
import { ref, onMounted, UnwrapRef } from 'vue'
import { useUserInfo } from '@/store'
import { useMusicAction } from '@/store/music'
import ProgressBar from '@/components/MusicPlayer/ProgressBar.vue'
import { GetMusicDetailData } from '@/api/musicList'
import DetailLeft from '@/components/MusicPlayer/DetailLeft.vue'
import DetailCenter from '@/components/MusicPlayer/DetailCenter.vue'
import DetailRight from '@/components/MusicPlayer/DetailRight.vue'
import { ListenerName, useListener } from '@/components/MusicPlayer/listener'
import usePlayList, { playListState } from '@/layout/BaseAside/usePlayList'
import { LyricPlayer } from '@/utils/lyric'
import '@/utils/lyric/style.scss'

const orderStatus = ['icon-xihuan5', 'icon-xunhuan', 'icon-suijibofang', 'icon-danquxunhuan']
type userAudio = {
  play: (lengthen?: boolean) => Promise<undefined>
  pause: (isNeed?: boolean, lengthen?: boolean) => Promise<undefined>
} & Omit<HTMLAudioElement, 'pause' | 'play'>

export interface MusicPlayerInstanceType {
  el: UnwrapRef<userAudio>
  isPlay: UnwrapRef<boolean>
  reset: (val: boolean) => void
  pause: typeof pause
  play: typeof play
  time: number
  oldTime: number
  transitionIsPlay: UnwrapRef<boolean>
  addListener: (listener: ListenerName) => void
  cutSongHandler: () => void
}
interface Props {
  src: string
  ids?: number[]
  songs: GetMusicDetailData
}
const store = useUserInfo()
const props = defineProps<Props>()
const emit = defineEmits(['playEnd', 'cutSong'])
const isPlay = ref(false)
const audio = ref<userAudio>()
const music = useMusicAction()
const transitionIsPlay = ref(false)
const { addListener, executeListener } = useListener(audio)
const { getPlayListDetailFn } = usePlayList()
let player: LyricPlayer | null = null

function handleLyricClick(time: number) {
  if (audio.value) {
    audio.value.currentTime = time
  }
}
function seeked() {
  player?.syncIndex()
}
function initPlayer() {
  if (player) return
  const container = document.querySelector('.lyric-container') as HTMLDivElement
  if (container && audio.value) {
    player = new LyricPlayer({
      container,
      audio: audio.value as unknown as HTMLAudioElement,
      onLineClick: handleLyricClick
    })
  }
}
let originPlay: HTMLMediaElement['play']
let originPause: HTMLMediaElement['pause']

onMounted(() => {
  initPlayer()

  originPlay = audio.value!.play as HTMLMediaElement['play']
  originPause = audio.value!.pause as HTMLMediaElement['pause']
  // 播放，音量过渡提高
  audio.value!.play = play as any
  // 音量过渡减少为0，然后暂停
  audio.value!.pause = pause as any

  audio.value?.addEventListener('error', (event: any) => {
    if (event.target.error.code === 4) {
      //
    }
  })
})
function play(lengthen: boolean = false) {
  let volume = store.volume
  if (music.state.load) {
    cutSongHandler()
    music.state.load = false
  }
  player?.play()
  if (!audio.value) return Promise.resolve(undefined)
  audio.value.volume = 0
  originPlay.call(audio.value).catch(() => {
    // 音频源无效时静默处理
  })
  isPlay.value = true
  timeState.value.stop = false

  // 开始时直接改变就可以，让逐字歌词跟得上
  transitionIsPlay.value = true
  return transitionVolume(volume, true, lengthen).then(() => {})
}
function pause(isNeed: boolean = true, lengthen: boolean = false) {
  let volume = store.volume
  // 是否需要更新暂停标识， 什么时候不需要，就比如切换下一首歌的时候:
  // 这个时候会先调用pause暂停上一首进行过渡，然后在调用play播放，这个时候就不需要更新暂停标识
  isNeed && (isPlay.value = false)
  return transitionVolume(volume, false, lengthen).then(() => {
    player?.pause()
    // 暂停时应该等待音量过渡完成在改变，让逐字歌词也有一个暂停过渡效果
    transitionIsPlay.value = false
  })
}
let timer: NodeJS.Timeout
//NodeJS.Timer 是旧的类型名称，在较新的 Node.js 类型定义中已经被 NodeJS.Timeout 替代
// 当过渡完成时会返回Promise
function transitionVolume(
  volume: number,
  target: boolean = true,
  lengthen: boolean = false
): Promise<undefined> {
  clearInterval(timer)
  const playVolume = lengthen ? 40 : 15
  const pauseVolume = lengthen ? 20 : 10
  return new Promise((resolve) => {
    if (!audio.value) {
      resolve(undefined)
      return
    }
    if (target) {
      timer = setInterval(() => {
        if (!audio.value) {
          clearInterval(timer)
          resolve(undefined)
          return
        }
        audio.value.volume = Math.min(audio.value.volume + volume / playVolume, volume)
        if (audio.value.volume >= volume) {
          resolve(undefined)
          clearInterval(timer)
        }
      }, 50)
      return
    }
    timer = setInterval(() => {
      if (!audio.value) {
        clearInterval(timer)
        resolve(undefined)
        return
      }
      audio.value.volume = Math.max(audio.value.volume - volume / pauseVolume, 0)
      if (audio.value.volume <= 0) {
        clearInterval(timer)
        originPause.call(audio.value)
        audio.value.volume = volume
        resolve(undefined)
      }
    }, 50)
  })
}

const timeState = ref({
  stop: false,
  previousTime: 0 // 新增属性来保存旧的 currentTime
})

/**
 * 音频时间更新回调
 * 注意：不依赖 audio.duration（可能获取不到），只更新 currentTime
 */
const timeupdate = () => {
  if (timeState.value.stop) return
  timeState.value.previousTime = music.state.currentTime
  if (window.$audio) {
    music.state.currentTime = window.$audio.time as any
  }
}

const reset = (val: boolean) => {
  music.state.currentTime = 0
  isPlay.value = val
  transitionIsPlay.value = val
  // 这里需要停止timeupdate的事件监视，因为在暂停音乐时会过渡结束（就相当于还是在播放一段时间），
  //  这样会导致进度条进度重置不及时
  timeState.value.stop = true // 在每次play方法时都会重置stop值
}
const end = () => {
  emit('playEnd')
}
const setOrderHandler = () => {
  const runtimeList = music.state.runtimeList

  let newValue = (music.state.orderStatusVal + 1) % orderStatus.length

  // 如果上一次是心动模式并且当前播放的列表是”我喜欢的“，这次切换为其他，则重新获取”我喜欢的“列表,并更新进行时列表
  if (runtimeList?.specialType === 5 && music.state.orderStatusVal === 0 && newValue !== 0) {
    getPlayListDetailFn(runtimeList.id as number, '', false)
    music.updateTracks(
      playListState.value.playList,
      playListState.value.playList.map((item) => item.id)
    )
  }

  // 如果当前播放歌单不是”我喜欢的“列表，则心动模式不可用
  music.state.orderStatusVal =
    newValue === 0 && runtimeList?.specialType !== 5
      ? 1
      : (newValue as typeof music.state.orderStatusVal)

  music.getIntelliganceListHandler()
}

// 执行切换事件，随后暂停time监听器，等待歌曲加载完成后会打开
const cutSongHandler = () => {
  initPlayer()
  player?.setLyrics(music.state.lyric, music.state.noTimestamp)
  executeListener('cutSong')
}

const exposeObj = {
  el: audio,
  isPlay,
  reset,
  play,
  pause,
  transitionIsPlay,
  addListener,
  cutSongHandler
}
Object.defineProperty(exposeObj, 'time', {
  get(): number {
    return audio.value!.currentTime
  },
  set(time: number) {
    try {
      audio.value!.currentTime = time
    } catch (e) {
      console.error('设置time时出现了错误: ', e, ',time: ', time)
    }
  }
})
Object.defineProperty(exposeObj, 'oldTime', {
  get(): number {
    return timeState.value.previousTime
  }
})
defineExpose(exposeObj)
</script>

<template>
  <div class="bottom-container">
    <audio
      ref="audio"
      class="plyr-audio"
      :src="props.src"
      preload="auto"
      @timeupdate="timeupdate"
      @ended="end"
      @seeked="seeked"
    />
    <DetailLeft :songs="props.songs" />
    <DetailCenter
      :order-status="orderStatus"
      :is-play="isPlay"
      :order-status-val="music.state.orderStatusVal"
      @play="play"
      @pause="pause"
      @cut-song="(val) => emit('cutSong', val)"
      @set-order-handler="setOrderHandler"
    />
    <DetailRight
      :current-time="music.state.currentTime"
      :songs="props.songs"
      :audio="audio as any"
    />
  </div>
  <div class="plan-container">
    <ProgressBar :songs="props.songs" />
  </div>
</template>

<style lang="scss">
.plan-container {
  display: flex;
  align-items: center;
  height: 15px;
  position: absolute;
  top: -8.5px;
  width: 100%;
}
.el-overlay {
  .music-drawer {
    background-image: url('../../assets/defaultBg.png');
    @extend .bgSetting;
  }
}
</style>
<style lang="scss" scoped>
:deep(.el-drawer) {
  height: 100%;
}
.bottom-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 15px;
  backdrop-filter: blur(60px) saturate(210%);
}
</style>
