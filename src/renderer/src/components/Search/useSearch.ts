import { cloudSearch } from '@/api/search'
import { ref } from 'vue'
import { GetMusicDetailData } from '@/api/musicList'

interface State {
  resultList: GetMusicDetailData[]
  songCount: number
}

export default () => {
  const state = ref<State>({
    resultList: [],
    songCount: 0
  })
  const search = async (key: string, offset: number, limit = 30) => {
    const { result } = await cloudSearch(key, offset, limit)
    state.value.songCount = result.songCount
    state.value.resultList = result.songs
  }

  return {
    search
  }
}
