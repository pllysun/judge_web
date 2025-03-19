<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../services/api'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
  agreeTerms: false,
})

// 状态变量
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const verificationId = ref('')
const isSendingCode = ref(false)
const codeSent = ref(false)
const countdown = ref(0)

// 发送验证码
async function sendVerificationCode() {
  if (!form.email) {
    errorMessage.value = '请输入邮箱地址'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errorMessage.value = '请输入有效的邮箱地址'
    return
  }

  try {
    isSendingCode.value = true
    errorMessage.value = ''

    const response = await authApi.sendVerificationCode(form.email)
    console.log('验证码发送响应:', response) // 添加日志查看响应结构

    // 确保verificationId正确设置
    if (response && response.data && response.data.verificationId) {
      verificationId.value = response.data.verificationId
    } else if (response && response.verificationId) {
      verificationId.value = response.verificationId
    } else {
      throw new Error('获取验证码ID失败，请重试')
    }

    codeSent.value = true
    successMessage.value = '验证码已发送到您的邮箱'

    // 倒计时60秒
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '发送验证码失败'
  } finally {
    isSendingCode.value = false
  }
}

// 提交注册
async function register() {
  // 重置错误信息
  errorMessage.value = ''

  // 表单验证
  if (!form.email || !form.password || !form.confirmPassword || !form.verificationCode) {
    errorMessage.value = '请填写所有必填字段'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  if (form.password.length < 6) {
    errorMessage.value = '密码长度至少为6个字符'
    return
  }

  if (!form.agreeTerms) {
    errorMessage.value = '请阅读并同意服务条款和隐私政策'
    return
  }

  if (!verificationId.value) {
    errorMessage.value = '请先获取验证码'
    return
  }

  try {
    isLoading.value = true

    const response = await authApi.register({
      email: form.email,
      password: form.password,
      verificationId: verificationId.value,
      verificationCode: form.verificationCode,
    })

    // 注册成功，显示成功消息
    successMessage.value = '注册成功！'

    // 跳转到登录页面
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '注册失败'
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
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">注册新账号</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          或
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            登录已有账号
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

          <!-- 成功提示 -->
          <div
            v-if="successMessage"
            class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ successMessage }}</span>
          </div>

          <form class="space-y-6" @submit.prevent="register">
            <!-- 邮箱 -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"> 邮箱地址 </label>
              <div class="mt-1 flex rounded-md shadow-sm">
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

            <!-- 验证码 -->
            <div>
              <label for="verification-code" class="block text-sm font-medium text-gray-700">
                验证码
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  id="verification-code"
                  v-model="form.verificationCode"
                  name="verification-code"
                  type="text"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  @click="sendVerificationCode"
                  :disabled="isSendingCode || countdown > 0"
                  class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </button>
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
                  autocomplete="new-password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- 确认密码 -->
            <div>
              <label for="password-confirm" class="block text-sm font-medium text-gray-700">
                确认密码
              </label>
              <div class="mt-1">
                <input
                  id="password-confirm"
                  v-model="form.confirmPassword"
                  name="password-confirm"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- 服务条款 -->
            <div class="flex items-center">
              <input
                id="terms"
                v-model="form.agreeTerms"
                name="terms"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="terms" class="ml-2 block text-sm text-gray-900">
                我已阅读并同意
                <a href="#" class="text-indigo-600 hover:text-indigo-500">服务条款</a> 和
                <a href="#" class="text-indigo-600 hover:text-indigo-500">隐私政策</a>
              </label>
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
                注册
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
