export default [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home/index.vue')
  },
  {
    path: '/play-list',
    name: 'playList',
    component: () => import('@/views/PlayList/index.vue')
  },
  {
    path: '/daily-recommend',
    name: 'dailyRecommend',
    component: () => import('@/views/DailyRecommend/index.vue')
  }
]