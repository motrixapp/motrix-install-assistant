<script lang="ts">
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { usePreferredDark } from '@vueuse/core'
import { ElConfigProvider, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { ipcRenderer } from 'electron'

export default {
  components: {
    ElConfigProvider
  },
  setup() {
    const { t } = useI18n()
    const isDark = usePreferredDark()
    const rootEle = document.querySelector('html') as HTMLHtmlElement

    watchEffect(() => {
      rootEle.classList.remove('dark', 'light')
      rootEle.classList.add(isDark.value ? 'dark' : 'light')
    })

    const router = useRouter()
    ipcRenderer.on('install-finished', () => {
      router.push('/finished')
    })

    ipcRenderer.on('mia:exception', (_event, exception: string) => {
      console.error('mia:exception', _event, exception)
      ElNotification({
        title: 'Error',
        message: t(`error.${exception}`),
        type: 'error',
      })
    })

    const buttonConfig = {
      autoInsertSpace: true
    }
    return { isDark, buttonConfig }
  }
}
</script>

<template>
  <el-config-provider :button="buttonConfig">
    <router-view />
  </el-config-provider>
</template>
