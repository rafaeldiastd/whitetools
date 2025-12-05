import { createRouter, createWebHistory } from 'vue-router';
import BearHiveCreate from '../views/BearHive/Create.vue';
import BearHiveView from '../views/BearHive/View.vue';
import BearHiveAbout from '../views/BearHive/About.vue';

import ScheduleCreate from '../views/Schedule/Create.vue';
import ScheduleView from '../views/Schedule/View.vue';
import ScheduleAbout from '../views/Schedule/About.vue';

import ListTransferView from '../views/ListTransfer/View.vue';
import ListTransferCreate from '../views/ListTransfer/Create.vue';
import ListTransferAbout from '../views/ListTransfer/About.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  // Schedule Routes
  {
    path: '/schedule',
    name: 'schedule-about',
    component: ScheduleAbout,
  },
  {
    path: '/schedule/create',
    name: 'schedule-create',
    component: ScheduleCreate,
  },
  {
    path: '/schedule/:id',
    name: 'schedule-view',
    component: ScheduleView,
    props: true,
  },
  // Transfer Routes
  {
    path: '/transfer',
    name: 'transfer-about',
    component: ListTransferAbout,
  },
  {
    path: '/transfer/create',
    name: 'transfer-create',
    component: ListTransferCreate,
    props: true,
  },
  {
    path: '/transfer/:id',
    name: 'transfer-view',
    component: ListTransferView,
    props: true,
  },
  // BearHive Routes
  {
    path: '/bearhive',
    name: 'bearhive-about',
    component: BearHiveAbout,
  },
  {
    path: '/bearhive/create',
    name: 'bearhive-create',
    component: BearHiveCreate,
  },
  {
    path: '/bearhive/view',
    name: 'bearhive-view',
    component: BearHiveView,
  },
  {
    // A rota curinga deve ser a última
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;