<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  verificationCode: '',
})

// 验证码相关状态
const verificationId = ref('')
const isCodeSent = ref(false)
const countdown = ref(0)
const timer = ref<number | null>(null)

// 状态变量
const isLoading = ref(false)
const isSendingCode = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 发送验证码
async function sendVerificationCode() {
  if (countdown.value > 0) return

  // 重置错误信息
  errorMessage.value = ''

  // 表单验证
  if (!form.oldPassword) {
    errorMessage.value = '请输入旧密码'
    return
  }

  try {
    isSendingCode.value = true

    // 调用发送验证码API
    const response = await authApi.sendPasswordResetCode(form.oldPassword)

    // 保存验证码ID
    verificationId.value = response.data.verificationId
    isCodeSent.value = true

    // 开始倒计时
    countdown.value = 60
    timer.value = window.setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--
      } else {
        if (timer.value) {
          clearInterval(timer.value)
          timer.value = null
        }
      }
    }, 1000)

    successMessage.value = '验证码已发送到您的邮箱'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '发送验证码失败'
  } finally {
    isSendingCode.value = false
  }
}

// 提交修改密码
async function changePassword() {
  // 重置错误信息
  errorMessage.value = ''
  successMessage.value = ''

  // 表单验证
  if (!form.oldPassword) {
    errorMessage.value = '请输入旧密码'
    return
  }

  if (!form.newPassword) {
    errorMessage.value = '请输入新密码'
    return
  }

  if (form.newPassword.length < 6 || form.newPassword.length > 16) {
    errorMessage.value = '密码长度必须在6-16个字符之间'
    return
  }

  if (!/^[a-zA-Z0-9]{6,16}$/.test(form.newPassword)) {
    errorMessage.value = '密码只能包含字母和数字'
    return
  }

  if (!form.confirmPassword) {
    errorMessage.value = '请确认新密码'
    return
  }

  if (form.newPassword !== form.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  if (!verificationId.value || !form.verificationCode) {
    errorMessage.value = '请获取并输入验证码'
    return
  }

  try {
    isLoading.value = true

    // 调用修改密码API
    await authApi.changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
      verificationId: verificationId.value,
      verificationCode: form.verificationCode,
    })

    // 修改成功，显示成功消息
    successMessage.value = '密码修改成功！'

    // 清空表单
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    form.verificationCode = ''
    verificationId.value = ''
    isCodeSent.value = false

    // 3秒后跳转到首页
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '修改密码失败'
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
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">修改密码</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          修改您的账户密码，需要验证旧密码和邮箱验证码
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

          <form class="space-y-6" @submit.prevent="changePassword">
            <!-- 旧密码 -->
            <div>
              <label for="oldPassword" class="block text-sm font-medium text-gray-700"> 旧密码 </label>
              <div class="mt-1">
                <input
                  id="oldPassword"
                  v-model="form.oldPassword"
                  name="oldPassword"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- 验证码 -->
            <div>
              <label for="verificationCode" class="block text-sm font-medium text-gray-700">
                验证码
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  id="verificationCode"
                  v-model="form.verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  class="appearance-none flex-1 block w-full px-3 py-2 border border-gray-300 rounded-none rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  @click="sendVerificationCode"
                  :disabled="countdown > 0 || isSendingCode"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </button>
              </div>
            </div>

            <!-- 新密码 -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700"> 新密码 </label>
              <div class="mt-1">
                <input
                  id="newPassword"
                  v-model="form.newPassword"
                  name="newPassword"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500">密码长度必须在6-16个字符之间，只能包含字母和数字</p>
            </div>

            <!-- 确认新密码 -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                确认新密码
              </label>
              <div class="mt-1">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? '提交中...' : '修改密码' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>