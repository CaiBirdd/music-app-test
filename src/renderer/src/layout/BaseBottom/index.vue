<script setup lang="ts" name="Bottom">
// 使用 Record<string, never> 代替 {}，避免空对象类型接受数字/字符串等非 nullish 值触发 ESLint 报错
defineSlots<{
  //default?: (props: {}) => any
  default?: (props: Record<string, never>) => any
}>()
</script>

<template>
  <div class="bottom-container container">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: 75px;
  //background-color: rgb(26,26,35);
  border-top: rgb(59, 59, 62) 1px solid;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1999;
  width: 100%;
}
.bottom-container {
  transition: 0.5s;
}
</style>
