import { kv } from '@vercel/kv'

export const kvService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await kv.get<T>(key)
    } catch (error) {
      console.error('KV get error:', error)
      return null
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await kv.set(key, value)
    } catch (error) {
      console.error('KV set error:', error)
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await kv.del(key)
    } catch (error) {
      console.error('KV delete error:', error)
    }
  },

  async getBlackboards(): Promise<any[]> {
    return await this.get<any[]>('blackboards') || []
  },

  async saveBlackboards(blackboards: any[]): Promise<void> {
    await this.set('blackboards', blackboards)
  },

  async getTabs(): Promise<any[]> {
    return await this.get<any[]>('tabs') || []
  },

  async saveTabs(tabs: any[]): Promise<void> {
    await this.set('tabs', tabs)
  },

  async getTheme(): Promise<'light' | 'dark'> {
    return await this.get<'light' | 'dark'>('theme') || 'light'
  },

  async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    await this.set('theme', theme)
  }
}
