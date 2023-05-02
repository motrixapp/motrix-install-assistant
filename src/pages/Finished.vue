<script lang="ts">
import { useRouter } from 'vue-router'
import { ElButton, ElCheckbox } from 'element-plus'
import { ipcRenderer } from 'electron'

import AppLogo from '../components/AppLogo.vue'
import GitHubLogo from '../components/GitHubLogo.vue'

export default {
  data() {
    return {
      runNow: true,
    }
  },
  setup() {
  },
  methods: {
    handleReinstallClick () {
      const router = useRouter()
      router.push('/')
    },
    handleFinishedClick () {
      const { runNow } = this
      ipcRenderer.send('run-app', { runNow })
    }
  }
}
</script>

<template>
  <div class="box finished">
    <div class="box-inner">
      <AppLogo />
      <h1>{{ $t('common.name') }}</h1>
      <div>
        <p>{{ $t('finished.message') }}</p>
        <p>
          <el-checkbox v-model="runNow" :label="$t('finished.run')" />
        </p>
      </div>
      <div class="actions">
        <router-link to="/" class="action-btn">
          <el-button type="default">
            {{ $t('common.reinstall') }}
          </el-button>
        </router-link>
        <el-button type="primary" @click="handleFinishedClick">
          {{ $t('common.finish') }}
        </el-button>
      </div>
    </div>
    <GitHubLogo />
  </div>
</template>

<style>
.finished p {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0 0 2rem;
}

.finished .el-checkbox__input.is-checked + .el-checkbox__label {
  color: var(--el-checkbox-text-color)
}
</style>
