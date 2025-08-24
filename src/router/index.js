import { createRouter, createWebHistory } from 'vue-router'
import BearHiveCreate from '../views/BearHive/Create.vue'
import BearHiveView from '../views/BearHive/View.vue'
import ScheduleCreate from '../views/Schedule/Create.vue'
import ScheduleView from '../views/Schedule/View.vue'

const routes = [
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
    path: '/',
    name: 'schedule-create',
    component: ScheduleCreate,
  },
  {
    path: '/schedule/:id',
    name: 'schedule-view',
    component: ScheduleView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }

]

 export const router = createRouter({
  history: createWebHistory(),
  routes
})