import { createRouter, createWebHistory } from 'vue-router';

import AppLayout from '../../layouts/AppLayout/AppLayout.vue';
import type { RouteRecordRaw } from 'vue-router';

const HomeView = () => import('../../features/shows/views/HomeView/HomeView.vue');
const GenreView = () => import('../../features/shows/views/GenreView/GenreView.vue');
const ShowDetailsView = () =>
  import('../../features/shows/views/ShowDetailsView/ShowDetailsView.vue');
const NotFoundView = () => import('../../features/shows/views/NotFoundView/NotFoundView.vue');

const routes: RouteRecordRaw[] = [
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
