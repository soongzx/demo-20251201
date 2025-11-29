<template>
  <div class="main-container" :class="{ 'dark-theme': theme === 'dark' }" ref="mainContainer">
    <header class="header">
      <div class="header-left">
        <h1>FreeBoard</h1>
      </div>
      <div class="header-right">
        <el-button @click="toggleTheme" type="text">
          {{ theme === 'light' ? '🌙 深色' : '☀️ 浅色' }}
        </el-button>
        <el-button @click="handleLogout" type="text">退出登录</el-button>
      </div>
    </header>
    
    <div class="tabs-container">
      <el-tabs v-model="activeTab" type="card" @tab-remove="handleTabRemove" @tab-click="handleTabClick">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.title"
          :name="tab.id"
          closable
        >
          <BlackboardComponent
            :blackboard="currentBlackboard"
            @update:blackboard="handleBlackboardUpdate"
          />
        </el-tab-pane>
      </el-tabs>
      <el-button 
        class="add-tab-btn"
        @click="handleAddTab"
        :disabled="!canAddTab"
        type="primary"
        size="small"
      >
        +
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { CONFIG } from '../utils/config'
import BlackboardComponent from '../components/BlackboardComponent.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const mainContainer = ref<HTMLElement | null>(null)

const { 
  theme, 
  tabs, 
  currentTabId, 
  currentBlackboard, 
  canAddTab, 
  toggleTheme, 
  addTab, 
  removeTab, 
  switchTab, 
  updateBlackboard, 
  initialize 
} = appStore

const activeTab = ref<string>(currentTabId || '')
let autoSaveTimer: number | null = null

// 监听主题变化，更新document的class
watch(() => theme, (newTheme) => {
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark-theme')
    document.body.classList.add('dark-theme')
  } else {
    document.documentElement.classList.remove('dark-theme')
    document.body.classList.remove('dark-theme')
  }
  
  // 触发自定义事件，通知其他组件
  window.dispatchEvent(new CustomEvent('themechange'))
}, { immediate: true })

// 监听当前标签页变化
watch(() => currentTabId, (newVal) => {
  if (newVal) {
    activeTab.value = newVal
  }
})

// 初始化应用
onMounted(async () => {
  await initialize()
  
  // 设置自动保存定时器
  autoSaveTimer = window.setInterval(() => {
    appStore.autoSave()
  }, CONFIG.AUTO_SAVE_INTERVAL)
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})

// 处理添加标签页
const handleAddTab = () => {
  addTab()
}

// 处理移除标签页
const handleTabRemove = (targetName: string) => {
  removeTab(targetName)
}

// 处理标签页切换
const handleTabClick = (tab: any) => {
  switchTab(tab.paneName)
}

// 处理黑板更新
const handleBlackboardUpdate = (updatedBlackboard: any) => {
  updateBlackboard(updatedBlackboard)
}

// 处理退出登录
const handleLogout = () => {
  appStore.logout()
  router.push('/')
  ElMessage.success('已退出登录')
}
</script>

<style scoped>
.main-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  transition: background-color 0.3s;
}

.main-container.dark-theme {
  background-color: #1a1a1a;
  color: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.main-container.dark-theme .header {
  background-color: #2c2c2c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header h1 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.main-container.dark-theme .header h1 {
  color: #ffffff;
}

.header-right {
  display: flex;
  gap: 10px;
}

.tabs-container {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.add-tab-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

:deep(.el-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.main-container.dark-theme :deep(.el-tabs__header) {
  background-color: #2c2c2c;
  border-bottom: 1px solid #404040;
}

.main-container.dark-theme :deep(.el-tabs__nav-wrap::after) {
  background-color: #404040;
}

.main-container.dark-theme :deep(.el-tabs__item) {
  color: #cccccc;
}

.main-container.dark-theme :deep(.el-tabs__item.is-active) {
  color: #409eff;
}

.main-container.dark-theme :deep(.el-tabs__item:hover) {
  color: #409eff;
}

.main-container.dark-theme :deep(.el-tabs__active-bar) {
  background-color: #409eff;
}

.main-container.dark-theme :deep(.el-card) {
  background-color: #2c2c2c;
  border: 1px solid #404040;
}
</style>
