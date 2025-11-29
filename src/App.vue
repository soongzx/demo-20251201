<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s, color 0.3s;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 深色主题全局样式 */
.dark-theme {
  background-color: #1a1a1a;
  color: #ffffff;
}
</style>
