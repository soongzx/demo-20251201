<template>
  <div class="main-container" :class="{ 'dark-theme': theme === 'dark' }" ref="mainContainer">
    <header class="header">
      <div class="header-left">
        <h1 class="app-title">FreeBoard</h1>
        <div class="edge-config-greeting" v-if="greeting">
          {{ greeting }}
        </div>
      </div>
      <div class="header-right">
        <el-button @click="toggleTheme" type="text" size="large" round>
          <el-icon :size="20">{{ theme === 'light' ? 'Moon' : 'Sunny' }}</el-icon>
          <span>{{ theme === 'light' ? '深色' : '浅色' }}</span>
        </el-button>
        <el-button @click="handleLogout" type="text" size="large" round>
          <el-icon :size="20">Logout</el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </header>
    
    <div class="tabs-container">
      <el-tabs v-model="activeTab" type="card" @tab-remove="handleTabRemove" @tab-click="handleTabClick" stretch>
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
        circle
        :icon="Plus"
      >
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
import { Plus, Moon, Sunny, Logout } from '@element-plus/icons-vue'
import { edgeConfigService } from '../services/edgeConfig'

const router = useRouter()
const appStore = useAppStore()
const mainContainer = ref<HTMLElement | null>(null)
const greeting = ref<string>('')

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

// 获取Edge Config中的问候语
const loadGreeting = async () => {
  try {
    greeting.value = await edgeConfigService.getGreeting()
  } catch (error) {
    console.error('Failed to load greeting from Edge Config:', error)
  }
}

// 初始化应用
onMounted(async () => {
  await loadGreeting()
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
  transition: background-color 0.3s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-container.dark-theme {
  background-color: #1a1a1a;
  color: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 64px;
  background-color: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 100;
}

.main-container.dark-theme .header {
  background-color: #2c2c2c;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.app-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.main-container.dark-theme .app-title {
  color: #69b1ff;
}

.edge-config-greeting {
  font-size: 14px;
  color: #606266;
  margin-left: 16px;
  font-weight: 400;
  background: linear-gradient(135deg, #409eff 0%, #69b1ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: greetingFadeIn 0.5s ease-in;
}

.main-container.dark-theme .edge-config-greeting {
  background: linear-gradient(135deg, #69b1ff 0%, #91caff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes greetingFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-right {
  display: flex;
  gap: 20px;
}

.header-right .el-button {
  transition: all 0.2s ease;
}

.header-right .el-button:hover {
  transform: translateY(-2px);
}

.tabs-container {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.add-tab-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 100;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.add-tab-btn:hover {
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

/* 标签页样式优化 */
:deep(.el-tabs__header) {
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.main-container.dark-theme :deep(.el-tabs__header) {
  background-color: #2c2c2c;
  border-bottom: 1px solid #404040;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: #e4e7ed;
  transition: all 0.3s ease;
}

.main-container.dark-theme :deep(.el-tabs__nav-wrap::after) {
  background-color: #404040;
}

:deep(.el-tabs__item) {
  color: #606266;
  transition: all 0.3s ease;
  font-weight: 500;
}

:deep(.el-tabs__item:hover) {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 600;
}

.main-container.dark-theme :deep(.el-tabs__item) {
  color: #cccccc;
}

.main-container.dark-theme :deep(.el-tabs__item:hover) {
  color: #69b1ff;
  background-color: rgba(105, 177, 255, 0.1);
}

.main-container.dark-theme :deep(.el-tabs__item.is-active) {
  color: #69b1ff;
}

:deep(.el-tabs__active-bar) {
  background-color: #409eff;
  height: 3px;
  transition: all 0.3s ease;
}

.main-container.dark-theme :deep(.el-tabs__active-bar) {
  background-color: #69b1ff;
}

/* 卡片样式 */
:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.main-container.dark-theme :deep(.el-card) {
  background-color: #2c2c2c;
  border: 1px solid #404040;
}
</style>
