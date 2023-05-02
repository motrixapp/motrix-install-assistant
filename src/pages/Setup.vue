<script lang="ts">
import { ElProgress } from 'element-plus'
import { ipcRenderer } from 'electron'
import type { ProgressInfo } from 'electron-updater'

import AppLogo from '../components/AppLogo.vue'
import GitHubLogo from '../components/GitHubLogo.vue'

export default {
  data() {
    return {
      percentage: 0,
      downloaded: false,
    }
  },
  methods: {
    format (percentage: number) {
      if (percentage === 0) {
        return '0%'
      }
      if (percentage === 100) {
        return '100%'
      }
      return `${percentage.toFixed(1)}%`
    },
    handleCachesClick () {
      ipcRenderer.send('open-caches-path')
    },
    handleCancelClick () {
      ipcRenderer.send('cancel-download')
      this.$router.push('/')
    },
    handleInstallClick () {
      ipcRenderer.send('install-now')
    },
    handleDownloadProgress (event: any, progress: ProgressInfo) {
      console.log('download-progress', event, progress)
      this.percentage = progress.percent
    }
  },
  mounted () {
    ipcRenderer.once('update-downloaded', (event, downloadedFile) => {
      console.log('update-downloaded', event, downloadedFile)
      this.percentage = 100
      this.downloaded = true
      ipcRenderer.off('download-progress', this.handleDownloadProgress)
    })

    ipcRenderer.on('download-progress', this.handleDownloadProgress)
  }
}
</script>

<template>
  <div class="box setup">
    <div class="box-inner">
      <AppLogo width="12rem" height="12rem" />
      <h1>{{ $t('common.name') }}</h1>
      <div class="help">
        <p>{{ $t('setup.help') }}</p>
      </div>
      <div class="dir-tips">
        <p>{{ $t('setup.tips') }}<code @click="handleCachesClick">Caches</code> {{ $t('setup.dir') }}</p>
      </div>
      <div class="progress">
        <el-progress :percentage="percentage" color="#007aff" :format="format" />
      </div>
      <div class="actions">
        <el-button class="mo-btn-cancel" type="default" plain @click="handleCancelClick">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" :disabled="!downloaded" @click="handleInstallClick">
          {{ $t('common.install') }}
        </el-button>
      </div>
    </div>
    <GitHubLogo />
  </div>
</template>

<style>
.setup .help {
  border-radius: 3px;
  margin: 1.25rem 1rem 0.5rem;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  background-color: #fff;
  color: #000;
  border: 1px solid #cdcdcd;
  text-align: left;
}

.setup .help p {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0;
}

.setup .dir-tips {
  margin: 0 0 1rem;
}

.setup .dir-tips code {
  cursor: pointer;
}

.setup .dir-tips p {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0;
}

.setup .progress {
  margin: 0 auto;
  width: 80%;
  margin-bottom: 1.5rem;
}

.setup .actions {
  margin-bottom: 2rem;
}

@media screen and (min-width: 800px) {
  .setup .help {
    margin-left: 3rem;
    margin-right: 3rem;
  }
}

.dark .setup .help {
  background-color: #323232;
  color: #e0e0e0;
  border-color: #333;
}

.dark .el-button.mo-btn-cancel {
  background-color: #635C58;
  color: #fff;
  border-color: transparent;
}
</style>
