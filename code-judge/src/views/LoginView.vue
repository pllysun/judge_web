<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi, userApi } from '../services/api'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

// 状态变量
const isLoading = ref(false)
const errorMessage = ref('')

// 提交登录
async function login() {
  // 重置错误信息
  errorMessage.value = ''

  // 表单验证
  if (!form.email || !form.password) {
    errorMessage.value = '请填写邮箱和密码'
    return
  }

  try {
    isLoading.value = true

    const response = await authApi.login({
      email: form.email,
      password: form.password,
    })

    // 登录成功
    if (response.token) {
      // 先保存基本用户信息和token
      authStore.login(
        {
          email: form.email,
          loginId: response.loginId,
        },
        response.token,
      )

      try {
        // 获取用户详细信息
        const userInfo = await userApi.getUserInfo()
        if (userInfo && userInfo.data) {
          // 更新用户信息
          authStore.updateUserInfo(userInfo.data)
        }
      } catch (userInfoError) {
        console.error('获取用户信息失败:', userInfoError)
        // 获取用户信息失败不影响登录流程
      }

      // 跳转到首页
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">登录账号</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          或
          <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            注册新账号
          </router-link>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <!-- 错误提示 -->
          <div
            v-if="errorMessage"
            class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ errorMessage }}</span>
          </div>

          <form class="space-y-6" @submit.prevent="login">
            <!-- 邮箱 -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"> 邮箱地址 </label>
              <div class="mt-1">
                <input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- 密码 -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700"> 密码 </label>
              <div class="mt-1">
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- 记住我 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  v-model="form.rememberMe"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900"> 记住我 </label>
              </div>

              <div class="text-sm">
                <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                  忘记密码？
                </a>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isLoading" class="mr-2">
                  <svg
                    class="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                登录
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
