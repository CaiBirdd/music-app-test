<script setup lang="ts">
import Header from '@/layout/BaseHeader/index.vue'
import Aside from '@/layout/BaseAside/index.vue'
import Bottom from '@/layout/BaseBottom/index.vue'
</script>

<template>
  <div id="opacity-bg" style="position: fixed; width: 100%; height: 100%; transition: 0.5s"></div>
  <div id="opacity-bg1" style="position: fixed; width: 100%; height: 100%; transition: 0.5s"></div>
  <div style="height: 100%; position: relative; z-index: auto">
    <div id="box">
      <Aside></Aside>
      <div class="main">
        <Header></Header>
        <div class="body">
          <router-view></router-view>
        </div>
      </div>
    </div>
    <div style="height: 20px"></div>
  </div>
  <Bottom>
    <template #default>
      <div style="text-align: center; line-height: 75px;">播放器区域（待实现）</div>
    </template>
  </Bottom>
</template>

<style lang="less">
//@import '@/assets/base.less'; 已经全局自动引入了

.bottom-show {
  visibility: visible;
  opacity: 1;
}
.bottom-visible {
  visibility: hidden;
  opacity: 0;
}
</style>