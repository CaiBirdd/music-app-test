<script setup lang="ts" name="MusicDetail">
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <div v-show="model" class="music-detail-container">
    <div class="music-detail-bottom"></div>
  </div>
</template>

<style scoped lang="less">
.music-detail-container {
  position: fixed;
  inset: 0;
  z-index: 2000;
}
.music-detail-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>