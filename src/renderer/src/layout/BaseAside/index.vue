<script setup lang="ts" name="BaseAside">
import { useRouter } from 'vue-router'

const router = useRouter()
const gotoHome = () => router.push('/home')
</script>

<template>
  <div class="aside">
    <div class="title">侧边栏（Phase 2）</div>
    <div class="item" @click="gotoHome">为我推荐</div>
  </div>
</template>

<style scoped lang="less">
.aside {
  width: 235px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.03);
  padding: 10px 0;
  box-sizing: border-box;
  overflow: hidden;
}
.title {
  padding: 10px 20px;
  opacity: 0.8;
}
.item {
  padding: 10px 20px;
  cursor: pointer;
}
</style>