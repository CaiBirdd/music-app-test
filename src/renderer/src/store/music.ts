import { defineStore } from 'pinia'
import {
  CurrentItem,
  getDynamicCover,
  getIntelliganceList,
  getLyric,
  getMusicDetail,
  GetMusicDetailData,
  getMusicUrl,
  GetPlayListDetailRes,
  updateScrobble
} from '@/api/musicList'
import { watch, reactive } from 'vue'
import { parseLRC } from '@/utils/lyric'
import { randomNum } from '@/utils'

export type Lyric = { time: number | boolean; text: string; line: number }
interface State {
  musicUrl: string
  songs: any
  currentItem: Partial<GetPlayListDetailRes['playlist']> | null
  runtimeList: CurrentItem | null
  runtimeIds: number[]
  lyric: any
  currentTime: 0
  noTimestamp: boolean
  // 原代码: bgColor: Array<Array<string>>
  bgColor: string[]
  videoPlayUrl: string | null
  // 0心动 1列表循环 2随机播放 3单曲循环
  orderStatusVal: 0 | 1 | 2 | 3
  load: boolean
  index: number
  lastIndexList: number[]
  searchList: any[]
}

// 会把用户当前正在播放的列表单独存储起来，以便切换歌单时没有播放切换的歌单不会被清空
export const useMusicAction = defineStore('musicActionId', () => {
  const state: State = reactive({
    musicUrl: '', // 用户当前播放器播放的音乐url
    songs: {}, // 用户当前播放器播放的音乐
    currentItem: null, // 用户当前选中的歌单列表，会随着用户选中的菜单变化
    runtimeList: null, // 用户当前正在播放音乐的列表
    runtimeIds: [], // 用户当前正在播放音乐的列表ids
    lyric: [],
    currentTime: 0,
    noTimestamp: false,
    bgColor: [], // 当前正在播放的音乐主题色
    videoPlayUrl: '',
    orderStatusVal: 0,
    load: false,
    lastIndexList: [],
    index: 0,
    searchList: []
  })
  watch(
    () => state.index,
    (value, oldValue) => {
      state.lastIndexList.push(oldValue)
    }
  )
  const updateSearchList = (val: any) => {
    state.searchList = val
  }
  const updateCurrentItem = (val: Partial<CurrentItem>) => {
    val.name = val.specialType === 5 ? '我喜欢的歌单' : val.name
    // 类型不匹配，使用as any断言以不影响功能
    state.currentItem = val as any
  }
  const updateRuntimeList = (list: CurrentItem, ids: number[]) => {
    if (list.specialType !== 5 && state.orderStatusVal === 0) {
      state.orderStatusVal = 1
    }
    state.runtimeList = list
    state.runtimeIds = ids

    getIntelliganceListHandler()
  }
  const updateTracks = (tracks: GetMusicDetailData[], ids: number[]) => {
    if (state.runtimeList) {
      state.runtimeList.tracks = tracks
      state.runtimeIds = ids
    }
  }
  // 获取歌词
  const getLyricHandler = async (id: number) => {
    const { lrc } = await getLyric(id)
    const result = parseLRC(lrc.lyric)
    state.lyric = result.lines
    state.noTimestamp = result.noTimestamp
    if (state.lyric.length === 1) {
      state.lyric = []
    }
  }
  const updateState = (data) => {
    Object.assign(state, data)
  }
  // 获取动态封面
  const getDynamicCoverHandler = async (id: number) => {
    try {
      const { data } = await getDynamicCover(id)
      if (data.videoPlayUrl) {
        state.videoPlayUrl = data.videoPlayUrl
      } else {
        state.videoPlayUrl = null
      }
    } catch {
      state.videoPlayUrl = null
    }
  }
  // 获取音乐url并播放
  const getMusicUrlHandler = async (item: GetMusicDetailData, i?: number) => {
    try {
      state.songs = item
      getLyricHandler(item.id)
      getDynamicCoverHandler(item.id)
      // id可能是string | number，添加as number断言
      updateScrobble(item.id, state.runtimeList?.id as number | undefined)
      const [{ data }] = await Promise.all([
        getMusicUrl(item.id),
        getMusicDetail(item.id.toString())
      ])
      state.index = i === undefined ? state.index : i
      if (window.$audio) {
        window.$audio.reset(true)
        await window.$audio.pause(false)
        state.musicUrl = data[0].url || ''
        window.$audio.cutSongHandler()
        // 监听audio是否加载完毕
        localStorage.setItem('MUSIC_CONFIG', JSON.stringify({ ...state, load: true }))

        window.$audio.el.oncanplay = async () => {
          try {
            await window.$audio.play()
            // localStorage.setItem('MUSIC_CONFIG', JSON.stringify({
            //   songs: item,
            //   lyric: state.lyric,
            //   lrcMode: state.lrcMode,
            //   videoPlayUrl: state.videoPlayUrl,
            //   index: index.value,
            //   musicUrl: state.musicUrl,
            //   runtimeIds: state.runtimeIds,
            //   orderStatusVal: state.orderStatusVal,
            //   runtimeList: state.runtimeList,
            //   bgColor: state.bgColor,
            // }))
          } catch (error) {
            console.error('播放失败:', error)
          }
        }
      }
    } catch (e) {
      console.log('getMusicUrlHandler函数错误：', e)
    }
  }
  // const setSongCache() {
  //   localStorage.setItem('MUSIC_CONFIG', JSON.stringify({
  //
  //   }))
  // }
  // 0心动 1列表循环 2随机播放 3单曲循环
  const orderTarget = (i: 0 | 1 | 2 | 3) => {
    if (i === 0) {
      return (state.index + 1) % state.runtimeIds.length
    } else if (i === 1) {
      return (state.index + 1) % state.runtimeIds.length
    } else if (i === 2) {
      return randomNum(0, state.runtimeIds.length - 1)
    } else {
      return state.index
    }
  }
  const playEnd = () => {
    state.index = orderTarget((state?.orderStatusVal ?? 0) as 0 | 1 | 2 | 3)
    if (state.index > state.runtimeIds.length - 1) {
      return
    }
    getMusicUrlHandler(state.runtimeList!.tracks[state.index])
  }
  // 切换歌曲
  const cutSongHandler = (target: boolean) => {
    if ([0, 1, 3].includes(state?.orderStatusVal ?? 0)) {
      state.index = target ? state.index + 1 : state.index - 1
      if (state.index > state.runtimeIds.length - 1) {
        state.index = 0
      } else if (state.index < 0) {
        state.index = state.runtimeIds.length - 1
      }
      getMusicUrlHandler(state.runtimeList!.tracks[state.index])
      return
    }
    if (!target) {
      const i =
        state.lastIndexList[state.lastIndexList.length - 1] || orderTarget(state?.orderStatusVal)
      getMusicUrlHandler(state.runtimeList!.tracks[i])
      state.lastIndexList.splice(state.lastIndexList.length - 1)
      return
    }
    playEnd()
  }
  // 原代码: const updateBgColor = (colors: Array<Array<string>>) => {
  //   state.bgColor = colors
  // }
  const updateBgColor = (colors: Array<Array<number>>) => {
    // 将 [89, 134, 167] 转换为 "89, 134, 167" 供 CSS v-bind 使用
    state.bgColor = colors.map((color) => color.join(', '))
  }
  // 获取心动歌曲列表  只支持我喜欢的列表 pid: 歌单id   id: 歌曲id
  const getIntelliganceListHandler = async () => {
    const runtimeList = state.runtimeList

    if (state.orderStatusVal !== 0 || !runtimeList || runtimeList.specialType !== 5) {
      return
    }

    const songs = state.songs
    // id可能是string | number，添加as number断言
    const { data } = await getIntelliganceList(
      runtimeList.id as number,
      songs.id as number,
      songs.id as number
    )

    const tracks = data
      .filter((item) => !!item.songInfo)
      .map((item) => {
        return item.songInfo!
      })
    const ids = tracks.map((item) => {
      return item!.id
    })
    updateTracks(tracks, ids)
  }

  return {
    state,
    updateState,
    updateCurrentItem,
    updateRuntimeList,
    getLyricHandler,
    getMusicUrlHandler,
    orderTarget,
    playEnd,
    cutSongHandler,
    updateBgColor,
    getIntelliganceListHandler,
    updateTracks,
    updateSearchList
  }
})
