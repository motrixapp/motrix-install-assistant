import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import { router } from './pages'
import { messages } from './locales/app'
import './styles/vendors.ts'
import './styles/index.scss'

import App from './App.vue'

const i18n = createI18n({
  locale: navigator.language,
  fallbackLocale: 'en-US',
  messages,
})

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app').$nextTick(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})
