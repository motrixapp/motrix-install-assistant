import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import HomePage from './Home.vue'
import SetupPage from './Setup.vue'
import FinishedPage from './Finished.vue'

export const routes = [
  { path: '/', component: HomePage },
  { path: '/setup', component: SetupPage },
  { path: '/finished', component: FinishedPage },
]

const history = createWebHashHistory()

export const router = createRouter({
  history,
  routes,
})