export interface Tab {
  id: string
  title: string
  content: string
}

export interface BlackboardItem {
  id: string
  type: 'text' | 'line'
  content: any
  position: { x: number; y: number }
  size?: { width: number; height: number }
}

export interface Blackboard {
  id: string
  title: string
  items: BlackboardItem[]
}

export interface User {
  username: string
  isLoggedIn: boolean
}

export interface AppState {
  theme: 'light' | 'dark'
  currentTabId: string | null
  tabs: Tab[]
  blackboards: Blackboard[]
}
