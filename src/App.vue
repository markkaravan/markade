<script setup>
import MainPage from './views/MainPage.vue'
</script>

<template>
  <router-view> </router-view>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

@font-face {
  font-family: 'Orbitron';
  src: url('@/assets/fonts/Orbitron.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'ZenDots';
  src: url('@/assets/fonts/ZenDots.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
</style>
