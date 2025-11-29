import { createClient } from '@vercel/edge-config'

// 创建Edge Config客户端实例，确保使用正确的环境变量
const edgeConfig = createClient({
  id: import.meta.env.EDGE_CONFIG_ID,
  token: import.meta.env.EDGE_CONFIG_TOKEN,
  digest: import.meta.env.EDGE_CONFIG_DIGEST
})

export const edgeConfigService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await edgeConfig.get<T>(key)
    } catch (error) {
      console.error('Edge Config get error:', error)
      return null
    }
  },

  async has(key: string): Promise<boolean> {
    try {
      return await edgeConfig.has(key)
    } catch (error) {
      console.error('Edge Config has error:', error)
      return false
    }
  },

  async getAll(): Promise<Record<string, any> | null> {
    try {
      return await edgeConfig.getAll()
    } catch (error) {
      console.error('Edge Config getAll error:', error)
      return null
    }
  },

  // 根据项目需求添加特定的getter方法
  async getGreeting(): Promise<string> {
    return await this.get<string>('greeting') || 'Hello from Edge Config!'
  },

  async getFeatureFlag(flagName: string): Promise<boolean> {
    return await this.get<boolean>(`feature_flags.${flagName}`) || false
  }
}