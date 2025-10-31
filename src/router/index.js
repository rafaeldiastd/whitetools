import { createRouter, createWebHistory } from 'vue-router';
import BearHiveCreate from '../views/BearHive/Create.vue';
import BearHiveView from '../views/BearHive/View.vue';
import ScheduleCreate from '../views/Schedule/Create.vue';
import ScheduleView from '../views/Schedule/View.vue';
import ListTransferView from '../views/ListTransfer/View.vue';
import ListTransferCreate from '../views/ListTransfer/Create.vue';

const routes = [
  {
    path: '/',
    name: 'schedule-create',
    component: ScheduleCreate,
  },
  {
    path: '/schedule/:id',
    name: 'schedule-view',
    component: ScheduleView,
    props: true,
  },
  {
    path: '/transfer/:id',
    name: 'transfer-view',
    component: ListTransferView,
    props: true,
  },
    {
    path: '/transfer/create',
    name: 'transfer-create',
    component: ListTransferCreate,
    props: true,
  },
  // {
  //   path: '/bearhive/create',
  //   name: 'bearhive-create',
  //   component: BearHiveCreate,
  // },
  // {
  //   path: '/bearhive/view',
  //   name: 'bearhive-view',
  //   component: BearHiveView,
  // },
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