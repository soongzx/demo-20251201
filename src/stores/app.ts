import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CONFIG } from '../utils/config'
import { kvService } from '../services/kv'
import type { Tab, Blackboard } from '../types'

export const useAppStore = defineStore('app', () => {
  // 状态
  const isLoggedIn = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const tabs = ref<Tab[]>([])
  const currentTabId = ref<string | null>(null)
  const blackboards = ref<Blackboard[]>([])

  // 计算属性
  const currentTab = computed(() => {
    return tabs.value.find(tab => tab.id === currentTabId.value)
  })

  const currentBlackboard = computed(() => {
    return blackboards.value.find(board => board.id === currentTabId.value)
  })

  const canAddTab = computed(() => {
    return tabs.value.length < CONFIG.MAX_TABS
  })

  // 方法
  async function initialize() {
    // 从KV加载数据
    const savedTheme = await kvService.getTheme()
    const savedTabs = await kvService.getTabs()
    const savedBlackboards = await kvService.getBlackboards()

    theme.value = savedTheme
    tabs.value = savedTabs
    blackboards.value = savedBlackboards

    if (tabs.value.length > 0) {
      currentTabId.value = tabs.value[0]?.id || null
    }
  }

  function login(username: string, password: string): boolean {
    if (username === CONFIG.USERNAME && password === CONFIG.PASSWORD) {
      isLoggedIn.value = true
      return true
    }
    return false
  }

  function logout() {
    isLoggedIn.value = false
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    kvService.saveTheme(theme.value)
  }

  function addTab() {
    if (!canAddTab.value) return

    const newTabId = `tab-${Date.now()}`
    const newTab: Tab = {
      id: newTabId,
      title: `Tab ${tabs.value.length + 1}`,
      content: ''
    }

    const newBlackboard: Blackboard = {
      id: newTabId,
      title: newTab.title,
      items: []
    }

    tabs.value.push(newTab)
    blackboards.value.push(newBlackboard)
    currentTabId.value = newTabId

    kvService.saveTabs(tabs.value)
    kvService.saveBlackboards(blackboards.value)
  }

  function removeTab(tabId: string) {
    const index = tabs.value.findIndex(tab => tab.id === tabId)
    if (index === -1) return

    tabs.value.splice(index, 1)
    blackboards.value.splice(index, 1)

    if (currentTabId.value === tabId) {
      currentTabId.value = tabs.value.length > 0 ? tabs.value[0]?.id || null : null
    }

    kvService.saveTabs(tabs.value)
    kvService.saveBlackboards(blackboards.value)
  }

  function switchTab(tabId: string) {
    currentTabId.value = tabId
  }

  function updateBlackboard(blackboard: Blackboard) {
    const index = blackboards.value.findIndex(board => board.id === blackboard.id)
    if (index === -1) return

    blackboards.value[index] = blackboard
    kvService.saveBlackboards(blackboards.value)
  }

  function autoSave() {
    kvService.saveTabs(tabs.value)
    kvService.saveBlackboards(blackboards.value)
  }

  return {
    // 状态
    isLoggedIn,
    theme,
    tabs,
    currentTabId,
    blackboards,
    // 计算属性
    currentTab,
    currentBlackboard,
    canAddTab,
    // 方法
    initialize,
    login,
    logout,
    toggleTheme,
    addTab,
    removeTab,
    switchTab,
    updateBlackboard,
    autoSave
  }
})
