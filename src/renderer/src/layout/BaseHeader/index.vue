<script setup lang="ts" name="Header">
import { handle } from '@/layout/BaseHeader/handle'

const { minimize, maximize, unmaximize, close } = handle()
</script>

<template>
  <div class="window-container">
    <div class="left no-drag">
      <input class="search" placeholder="搜索（Phase 7 实现）" />
    </div>
    <div class="right no-drag">
      <button class="btn" @click="minimize">_</button>
      <button class="btn" @click="maximize">[ ]</button>
      <button class="btn" @click="unmaximize">[]</button>
      <button class="btn danger" @click="close">X</button>
    </div>
  </div>
</template>

<style scoped lang="less">
.window-container {
  height: 90px;
  width: 100%;
  padding-top: 30px;
  padding-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
.left {
  margin-left: 35px;
}
.search {
  width: 280px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  padding: 0 10px;
}
.right {
  margin-right: 15px;
  display: flex;
  gap: 12px;
}
.btn {
  height: 28px;
  min-width: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.danger {
  border-color: rgba(236, 65, 65, 0.35);
}
</style>