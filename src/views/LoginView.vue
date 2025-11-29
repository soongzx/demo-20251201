<template>
  <div class="login-container">
    <div class="login-form">
      <h1>FreeBoard</h1>
      <el-form :model="loginForm" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = () => {
  loading.value = true
  
  setTimeout(() => {
    const success = appStore.login(loginForm.username, loginForm.password)
    loading.value = false
    
    if (success) {
      ElMessage.success('登录成功')
      router.push('/main')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  }, 500)
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-form {
  width: 400px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-form h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
}
</style>
