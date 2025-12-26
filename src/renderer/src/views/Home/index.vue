<script setup lang="ts">
import { banner  } from '@/api/home'
import { onMounted } from 'vue'
import { ref } from 'vue'
const bannerData = ref<any[]>([])
onMounted ( async () =>{
  const res = await banner()
  bannerData.value = res.banners
  console.log(res)
})
</script>

<template>
  <div class="padding-container">
    <h1>首页</h1>
    <p>Phase 2 布局框架完成！</p>
    <p>（提示：Phase 4 会替换为完整版首页） 以下内容是轮播图的数据，用来测试接口是否跑通</p>
  </div>
  <div class="banner">
   <elem-carousel :autoplay="true" height="100px">
     <elem-carousel-item v-for="item in bannerData" :key="item">
       <img :src="item.imageUrl" style="width: 40%; height: 40%;" />
     </elem-carousel-item>
   </elem-carousel>
  </div>
</template>