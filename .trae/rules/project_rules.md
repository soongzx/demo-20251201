# Vue 前端项目开发规范

## 1. 项目概述
本规范旨在确保 Vue 前端项目的代码一致性、可维护性和可扩展性。所有团队成员必须严格遵守本规范。

## 2. 技术栈
- **框架**: Vue 3 (Composition API 优先)
- **构建工具**: Vite
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: SCSS + CSS Modules
- **UI组件库**: Element Plus
- **HTTP客户端**: Axios
- **代码检查**: ESLint + Prettier

## 3. 目录结构
```
├── public/              # 静态资源
├── src/
│   ├── assets/         # 项目资源文件
│   │   ├── images/     # 图片资源
│   │   ├── styles/     # 全局样式
│   │   └── icons/      # 图标资源
│   ├── components/     # 公共组件
│   │   ├── Base/       # 基础组件 (原子组件)
│   │   ├── Business/   # 业务组件 (分子/组织组件)
│   │   └── Layout/     # 布局组件
│   ├── composables/    # 可复用的组合式函数
│   ├── directives/     # 自定义指令
│   ├── filters/        # 过滤器
│   ├── hooks/          # 自定义钩子
│   ├── layouts/        # 页面布局
│   ├── locales/        # 国际化文件
│   ├── plugins/        # 插件配置
│   ├── router/         # 路由配置
│   ├── services/       # API 服务
│   ├── stores/         # Pinia 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── vite-env.d.ts   # Vite 环境类型
├── tests/              # 测试文件
├── .eslintrc.js        # ESLint 配置
├── .prettierrc         # Prettier 配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── package.json        # 项目依赖
```

## 4. 代码风格规范

### 4.1 命名规范
- **文件命名**: 采用 kebab-case (短横线命名)
  - 组件文件: `user-profile.vue`
  - 工具文件: `date-utils.ts`
  - 类型定义: `user.types.ts`

- **组件命名**: 
  - 基础组件: 以 `Base` 前缀开头，如 `BaseButton.vue`
  - 业务组件: 以业务域命名，如 `UserList.vue`
  - 布局组件: 以 `Layout` 前缀开头，如 `LayoutHeader.vue`

- **变量命名**: 采用 camelCase
  - 局部变量: `userName`
  - 响应式变量: `const user = ref<User>(null)`

- **常量命名**: 采用 UPPER_SNAKE_CASE
  - `const API_BASE_URL = 'https://api.example.com'`

- **函数命名**: 采用 camelCase，使用动词开头
  - `getUserInfo()`, `updateProfile()`

### 4.2 代码格式
- **缩进**: 2个空格
- **行宽**: 100字符
- **引号**: 单引号 `'`
- **分号**: 不使用分号
- **大括号**: 与语句同行
- **空格**: 
  - 操作符前后加空格
  - 逗号后加空格
  - 函数参数括号内不加空格

## 5. Vue 组件开发规范

### 5.1 组件结构
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style lang="scss" scoped>
// 组件样式
</style>
```

### 5.2 Composition API 使用
- 优先使用 `script setup` 语法糖
- 按照以下顺序组织代码:
  1. 导入语句
  2. Props 定义
  3. Emits 定义
  4. 响应式数据 (ref, reactive)
  5. 计算属性 (computed)
  6. 生命周期钩子
  7. 方法定义
  8. 暴露给父组件的属性和方法 (defineExpose)

### 5.3 Props 和 Emits
- Props 必须定义类型和默认值
- Emits 必须定义类型
- 使用 `defineProps` 和 `defineEmits` 宏

```vue
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
  userId: string
  userName?: string
}

const props = defineProps<Props>({
  userId: { type: String, required: true },
  userName: { type: String, default: 'Unknown' }
})

const emit = defineEmits<{
  (e: 'update:userName', value: string): void
  (e: 'delete', id: string): void
}>()
</script>
```

### 5.4 模板规范
- 使用语义化标签
- 避免深度嵌套 (不超过4层)
- 使用 v-if/v-else-if/v-else 而不是多个 v-if
- 列表渲染必须使用 key，且 key 必须是唯一标识符
- 避免在模板中使用复杂表达式

## 6. 状态管理规范 (Pinia)

### 6.1 Store 结构
```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const isLoggedIn = computed(() => !!currentUser.value)

  // 操作
  function setUser(user: User) {
    currentUser.value = user
  }

  function logout() {
    currentUser.value = null
  }

  // 暴露状态和方法
  return {
    currentUser,
    isLoggedIn,
    setUser,
    logout
  }
})
```

### 6.2 Store 命名
- Store 文件采用 kebab-case: `user-store.ts`
- Store 函数采用 camelCase: `useUserStore()`

## 7. API 调用规范

### 7.1 Axios 配置
```typescript
// services/axios.ts
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    // 统一错误处理
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api
```

### 7.2 API 服务封装
```typescript
// services/user.ts
import api from './axios'
import type { User, UserLoginData } from '@/types/user'

export const userApi = {
  login(data: UserLoginData) {
    return api.post<User>('/auth/login', data)
  },
  getUserInfo(id: string) {
    return api.get<User>(`/users/${id}`)
  },
  updateUser(id: string, data: Partial<User>) {
    return api.put<User>(`/users/${id}`, data)
  }
}
```

## 8. 样式规范

### 8.1 SCSS 变量和混合宏
- 所有全局变量定义在 `src/assets/styles/variables.scss`
- 混合宏定义在 `src/assets/styles/mixins.scss`

### 8.2 CSS Modules
- 组件样式优先使用 CSS Modules
- 类名采用 camelCase

```vue
<template>
  <div :class="styles.container">
    <h1 :class="styles.title">Hello World</h1>
  </div>
</template>

<style lang="scss" module>
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
  color: $primary-color;
}
</style>
```

## 9. 测试规范

### 9.1 单元测试
- 使用 Vitest 进行单元测试
- 测试文件与被测试文件放在同一目录，命名为 `*.spec.ts`
- 测试覆盖率目标: 核心功能 ≥ 80%

### 9.2 组件测试
- 使用 Vue Test Utils 进行组件测试
- 测试组件的渲染、props、events 和生命周期

## 10. 性能优化

### 10.1 代码优化
- 使用 `v-memo` 缓存计算结果
- 使用 `defineAsyncComponent` 懒加载组件
- 使用 `keep-alive` 缓存组件状态
- 避免不必要的响应式数据

### 10.2 资源优化
- 图片使用 WebP 格式
- 使用 CDN 加载第三方库
- 代码分割和按需加载

## 11. 安全规范

### 11.1 XSS 防护
- 避免使用 `v-html`
- 对用户输入进行验证和过滤

### 11.2 CSRF 防护
- 使用 CSRF Token
- 验证请求来源

### 11.3 数据安全
- 不在前端存储敏感信息
- API 请求使用 HTTPS

## 12. Git 工作流程

### 12.1 分支策略
- `main`: 主分支，用于生产环境
- `develop`: 开发分支，用于集成测试
- `feature/xxx`: 功能分支，用于开发新功能
- `fix/xxx`: 修复分支，用于修复 bug
- `release/xxx`: 发布分支，用于准备发布

### 12.2 Commit 规范
- 格式: `type(scope): subject`
- `type` 可选值: feat, fix, docs, style, refactor, test, chore
- 示例: `feat(user): add login functionality`

## 13. 代码审查

### 13.1 审查要点
- 代码是否符合规范
- 是否存在性能问题
- 是否存在安全隐患
- 代码可读性和可维护性

### 13.2 审查流程
- 提交 PR 前自己检查
- 至少 2 名团队成员审查
- 通过审查后才能合并

## 14. 文档规范

### 14.1 代码注释
- 使用 JSDoc 注释函数和类型
- 复杂逻辑添加注释
- 组件添加说明文档

### 14.2 项目文档
- 更新 README.md
- 编写 API 文档
- 记录变更日志

## 15. 总结
本规范旨在提高团队开发效率和代码质量，所有团队成员必须严格遵守。规范会根据项目进展和团队反馈定期更新。