<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import { ipcRenderer } from 'electron'

import AppLogo from '../components/AppLogo.vue'
import GitHubLogo from '../components/GitHubLogo.vue'

const router = useRouter()

const handleContinueClick = () => {
  ipcRenderer.send('download-artifact')
  router.push('/setup')
}
</script>

<template>
  <div class="box intro">
    <div class="box-inner">
      <AppLogo />
      <h1>{{ $t('common.name') }}</h1>
      <p>{{ $t('home.welcome') }}</p>
      <div class="actions">
        <el-button type="primary" @click="handleContinueClick">
          {{ $t('common.continue') }}
        </el-button>
      </div>
    </div>
    <GitHubLogo />
  </div>
</template>

<style>
.intro p {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0 0 3rem;
}
</style>
