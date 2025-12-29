<script setup lang="ts">
interface Props {
  isPlay: boolean
  orderStatusVal: number
  orderStatus: string[]
}
const props = defineProps<Props>()
const emit = defineEmits(['setOrderHandler', 'cutSong', 'pause', 'play'])
</script>

<template>
  <div class="center">
    <div class="cut-container">
      <svg
        style="width: 20px"
        :class="['icon', 'iconfont', props.orderStatus[orderStatusVal]]"
        aria-hidden="true"
        @click="emit('setOrderHandler')"
      >
        <use :xlink:href="'#' + props.orderStatus[orderStatusVal]"></use>
      </svg>
      <i class="iconfont cut icon-shangyishou" @click="emit('cutSong', false)"></i>
      <i v-show="isPlay" class="iconfont operation icon-Pause" @click="$emit('pause')"></i>
      <i v-show="!isPlay" class="iconfont operation icon-kaishi1" @click="$emit('play', false)"></i>
      <i class="iconfont cut icon-xiayishou" @click="emit('cutSong', true)"></i>
    </div>
  </div>
</template>

<style scoped lang="less">
.center {
  color: rgb(212, 212, 212);
  width: 441px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .cut-container {
    //width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon-xihuan5 {
      font-size: 22px !important;
    }
    .icon {
      font-size: 18px;
    }
    .iconfont {
      cursor: pointer;
    }
    .iconfont + .iconfont {
      margin-left: 35px;
    }

    .iconfont:not(.operation):hover {
      color: rgb(194, 58, 59);
    }

    .operation:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .cut {
      font-size: 18px;
    }

    .operation {
      //margin: 0 40px;
      color: @text;
      font-size: 18px;
      display: inline-block;
      width: 37px;
      line-height: 37px;
      text-align: center;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.05);

      &::before {
        margin-left: 3px;
      }
    }

    .icon-Pause {
      font-size: 16px;

      &::before {
        margin-left: 1px;
      }
    }
  }
}
</style>
