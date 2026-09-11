import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../../layouts/AppLayout/AppLayout.vue'
import { GenreView, HomeView, NotFoundView, ShowDetailsView } from '../../features/shows/views'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      component: AppLayout,

      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'genre/:genre',
          name: 'genre',
          component: GenreView,
        },
        {
          path: 'shows/:id',
          name: 'show-detail',
          component: ShowDetailsView,
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: NotFoundView,
        },
      ],
    },
  ],
})

export default router
