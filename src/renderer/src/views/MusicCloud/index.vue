<script setup lang="ts">
import { useMusicAction } from '@/store/music'
import {
  getUserCloud,
  GetMusicDetailData,
  GetUserCloudRes,
  GetUserCloudSong,
  PlayList
} from '@/api/musicList'
import { columns } from './config'
import SongList from '@/components/SongList/index.vue'
import { reactive, ref } from 'vue'

const music = useMusicAction()
// GetUserCloudRes['data']
interface State {
  loading: boolean
  ids: number[]
  list: GetMusicDetailData[]
  listInfo: PlayList | object
  total: number
  page: number
  limit: number
}
const state: State = reactive({
  loading: true,
  ids: [],
  list: [],
  listInfo: {},
  total: 0,
  page: 1,
  limit: 100
})

getUserCloudFn()

async function getUserCloudFn() {
  state.loading = true
  const { data, count } = await getUserCloud(state.limit, (state.page - 1) * state.limit).finally(
    () => {
      state.loading = false
    }
  )
  state.total = count
  state.list = data.map((item) => {
    state.ids.push(item.simpleSong.id)
    return item.simpleSong
  })
  music.updateCurrentItem({ id: 'cloud-songs', tracks: state.list })
}

const currentChange = (val: number) => {
  state.page = val
  getUserCloudFn()
}
</script>

<template>
  <SongList
    is-loading-endflyback
    is-paging
    :songs="music.state.songs"
    :columns="columns"
    :loading="state.loading"
    :ids="state.ids"
    :list="state.list"
    :list-info="state.listInfo"
    :page-size="state.limit"
    :total="state.total"
    :current-page="state.page"
    @play="music.getMusicUrlHandler"
    @current-change="currentChange"
  ></SongList>
</template>

<style scoped></style>
