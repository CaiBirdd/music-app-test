<script setup lang="ts">
interface Props {
  count: number
}
defineProps<Props>()
</script>

<template>
  <div>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss"></style>
