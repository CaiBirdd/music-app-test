<script setup lang="ts">
/**
 * 音乐播放进度条组件
 * - 未展开详情页：红色细线样式（1px）
 * - 展开详情页后：渐变色样式（6px），颜色从专辑封面提取
 */
import { computed } from 'vue'
import { GetMusicDetailData } from '@/api/musicList'
import { useMusicAction } from '@/store/music'
import { useFlags } from '@/store/flags'

interface Props {
  songs: GetMusicDetailData
}
const props = defineProps<Props>()
const music = useMusicAction()
const flags = useFlags()

/**
 * 进度条双向绑定值（0-100）
 * 使用 songs.dt（歌曲元数据时长，毫秒）替代 audio.duration
 * 原因：window.$audio.el.duration 在某些时机获取不到正确值
 */
const model = computed<number>({
  get() {
    const duration = props.songs.dt // 毫秒
    if (!duration) return 0
    // currentTime（秒）转毫秒后计算百分比
    return ((music.state.currentTime * 1000) / duration) * 100
  },
  set(val) {
    const duration = props.songs.dt // 毫秒
    if (!duration) return
    // 百分比转秒，设置播放位置
    window.$audio.time = (val * duration) / 100 / 1000
  }
})

// 渐变色（从专辑封面提取，默认红色）
const gradientColor1 = computed(() =>
  music.state.bgColor[1] ? `rgb(${music.state.bgColor[1]})` : 'rgb(236, 65, 65)'
)

const gradientColor2 = computed(() =>
  music.state.bgColor[0] ? `rgb(${music.state.bgColor[0]})` : 'rgb(236, 65, 65)'
)
</script>

<template>
  <div
    v-if="props.songs.ar"
    :class="['base-progress-bar', flags.isOpenDetail ? 'detail-progress' : 'view-progress']"
    style="width: 100%"
    :style="{
      '--gradient-color-1': gradientColor1,
      '--gradient-color-2': gradientColor2
    }"
  >
    <v-slider v-model="model"></v-slider>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-slider__button-wrapper) {
  cursor: pointer !important;
  display: none;
}
:deep(.v-slider-thumb) {
  display: none;
}
:deep(.el-slider__runway) {
  height: 1px;
  width: 100%;
  padding: 15px 0;
  background-color: transparent;
}

:deep(.el-slider) {
  width: 100%;
}
</style>
<style lang="scss">
/* 未展开详情页样式：红色细线 */
.base-progress-bar.view-progress {
  height: 31px;
  .v-input {
    margin-inline: 0;
  }
  .v-slider-track__fill {
    height: 1px;
    background-color: rgb(236, 65, 65);
    border-radius: 0;
  }
}

/* 通用样式：隐藏不需要的元素 */
.base-progress-bar {
  .v-input__details {
    display: none;
  }
  .v-slider-track__background {
    display: none;
  }
}

/* 展开详情页样式：渐变色效果 */
.base-progress-bar.detail-progress {
  height: 30px;
  .v-slider-track__fill {
    height: 6px;
    background-image: linear-gradient(to right, var(--gradient-color-1), var(--gradient-color-2));
    opacity: 0.8;
    border-radius: 6px;
    background-color: transparent;
  }
  .v-input {
    margin-inline: 0;
  }
}
</style>
