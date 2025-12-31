import request from '../utils/request'

// 创建歌单
export const createPlay = (
  name: number | string,
  privacy: '10' | '' = '',
  type: 'NORMAL' | 'VIDEO' | 'SHARED' = 'NORMAL'
) => request.get(`/playlist/create`, { params: { name, type, privacy } })

// 删除歌单
export const deletePlay = (ids: string[]) => request.post('/playlist/delete', { id: ids.join() })

// 对歌单添加或删除歌曲  op=add&pid=24381616&tracks=347231
export const deleteSong = (data) => request.get('/playlist/tracks', { params: data })

export const checkMusic = (id: number) => request.post('/check/music', { id })
