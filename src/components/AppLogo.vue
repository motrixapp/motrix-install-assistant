<script setup lang="ts">
const props = defineProps<{ width?: string, height?: string }>()

const { width, height } = props
const style = {
  width,
  height
}
</script>

<template>
  <div class="logo" :style="style">
    <a href="https://motrix.app/" target="_blank">
      <img src="../assets/app-logo.png" alt="App Logo" />
    </a>
  </div>
</template>

<style>
.logo {
  display: inline-block;
  width: 16rem;
  height: 16rem;
  will-change: filter;
  transition: filter 300ms;
  text-align: center;
}

.logo > a {
  display: inline-block;
}

.logo img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
</style>