import request from '@/utils/request'
import { GetMusicDetailData } from '@/api/musicList'

interface CloudSearch {
  code: number
  result: {
    searchQcReminder: null
    songCount: number
    songs: GetMusicDetailData[]
  }
}

interface SearchDefaultRes {
  code: number
  data: {
    realkeyword: string
    showKeyword: string
  }
}

// 搜索
export const cloudSearch = (keywords: string, offset: number, limit: number, type = 1) =>
  request.post<CloudSearch>('/cloudsearch', { keywords, limit, offset, type })

// 热搜列表(详细)
export const searchHotDetail = () => request.post('/search/hot/detail')

// 搜索建议
export const searchSuggest = (keywords: string, type: 'mobile' | '' = '') =>
  request.post('/search/suggest', { keywords, type })

// 搜索多重匹配
export const searchMultimatch = (keywords: string) =>
  request.post('/search/multimatch', { keywords })

// 默认搜索关键词
export const searchDefault = () => request.post<SearchDefaultRes>('/search/default')
