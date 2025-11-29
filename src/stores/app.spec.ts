import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './app'
import { createPinia, setActivePinia } from 'pinia'

describe('App Store', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should have initial state', () => {
    const store = useAppStore()
    expect(store.isLoggedIn).toBe(false)
    expect(store.theme).toBe('light')
    expect(store.tabs).toEqual([])
    expect(store.currentTabId).toBeNull()
    expect(store.blackboards).toEqual([])
  })

  it('should toggle theme', () => {
    const store = useAppStore()
    const initialTheme = store.theme
    store.toggleTheme()
    expect(store.theme).toBe(initialTheme === 'light' ? 'dark' : 'light')
  })
})
