<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userApi } from '../services/api'
import NavBar from '../components/NavBar.vue'

const authStore = useAuthStore()

// 用户信息
interface UserInfo {
  userId: number
  email: string
  username: string | null
  nickname: string
  bio: string
  avatar: string
  createdAt: string
  lastLoginAt: string
  company?: string
  website?: string
  socialLinks?: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

// 状态变量
const userInfo = ref<UserInfo | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const isEditing = ref(false)

// 用户统计数据（模拟数据，实际项目中应从API获取）
const userStats = reactive({
  rank: 256,
  solvedProblems: 128,
  totalProblems: 1024,
  points: 3560,
  submissions: 256,
  acceptanceRate: 78.1,
  difficultyDistribution: {
    easy: 65,
    medium: 30,
    hard: 5,
  },
})

// 计算属性
const solvedPercentage = computed(() => {
  return ((userStats.solvedProblems / userStats.totalProblems) * 100).toFixed(1)
})

// 编辑表单数据
const form = reactive({
  username: '',
  nickname: '',
  bio: '',
  avatar: '',
  avatarFile: null as File | null,
  company: '',
  website: '',
  socialLinks: {
    github: '',
    twitter: '',
    linkedin: '',
  },
})

// 获取用户信息
async function fetchUserInfo() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await userApi.getUserInfo()
    userInfo.value = response.data

    // 初始化表单数据
    form.username = userInfo.value.username || ''
    form.nickname = userInfo.value.nickname
    form.bio = userInfo.value.bio
    form.avatar = userInfo.value.avatar
    form.company = userInfo.value.company || ''
    form.website = userInfo.value.website || ''

    // 初始化社交链接
    if (userInfo.value.socialLinks) {
      form.socialLinks.github = userInfo.value.socialLinks.github || ''
      form.socialLinks.twitter = userInfo.value.socialLinks.twitter || ''
      form.socialLinks.linkedin = userInfo.value.socialLinks.linkedin || ''
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取用户信息失败'
  } finally {
    isLoading.value = false
  }
}

// 开始编辑
function startEditing() {
  isEditing.value = true
}

// 取消编辑
function cancelEditing() {
  isEditing.value = false
  // 重置表单数据
  if (userInfo.value) {
    form.username = userInfo.value.username || ''
    form.nickname = userInfo.value.nickname
    form.bio = userInfo.value.bio
    form.avatar = userInfo.value.avatar
    form.company = userInfo.value.company || ''
    form.website = userInfo.value.website || ''

    // 重置社交链接
    if (userInfo.value.socialLinks) {
      form.socialLinks.github = userInfo.value.socialLinks.github || ''
      form.socialLinks.twitter = userInfo.value.socialLinks.twitter || ''
      form.socialLinks.linkedin = userInfo.value.socialLinks.linkedin || ''
    } else {
      form.socialLinks.github = ''
      form.socialLinks.twitter = ''
      form.socialLinks.linkedin = ''
    }
  }
  form.avatarFile = null
}

// 处理头像文件选择
function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    form.avatarFile = input.files[0]
    // 创建本地预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      form.avatar = e.target?.result as string
    }
    reader.readAsDataURL(form.avatarFile)
  }
}

// 提交更新
async function updateUserInfo() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const formData = new FormData()

    // 只添加有值的字段
    if (form.username) formData.append('username', form.username)
    if (form.nickname) formData.append('nickname', form.nickname)
    if (form.bio) formData.append('bio', form.bio)
    if (form.company) formData.append('company', form.company)
    if (form.website) formData.append('website', form.website)

    // 添加社交链接
    if (form.socialLinks.github) formData.append('socialLinks.github', form.socialLinks.github)
    if (form.socialLinks.twitter) formData.append('socialLinks.twitter', form.socialLinks.twitter)
    if (form.socialLinks.linkedin)
      formData.append('socialLinks.linkedin', form.socialLinks.linkedin)

    // 如果有新上传的头像文件
    if (form.avatarFile) {
      formData.append('avatarFile', form.avatarFile)
    } else if (form.avatar && form.avatar !== userInfo.value?.avatar) {
      // 如果是URL设置的头像
      formData.append('avatar', form.avatar)
    }

    await userApi.updateUserInfo(formData)

    // 更新成功
    successMessage.value = '个人信息更新成功'
    isEditing.value = false

    // 重新获取用户信息
    await fetchUserInfo()

    // 更新全局存储的用户信息
    if (authStore.user && userInfo.value) {
      authStore.updateUserInfo({
        ...authStore.user,
        avatar: userInfo.value.avatar,
      })
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '更新用户信息失败'
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- 用户信息卡片 -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div class="px-4 py-5 sm:px-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-20 w-20">
                <img
                  v-if="userInfo && userInfo.avatar"
                  :src="userInfo.avatar"
                  class="h-20 w-20 rounded-full object-cover"
                  alt="用户头像"
                />
                <div
                  v-else
                  class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <svg class="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
              <div class="ml-6">
                <h3 class="text-2xl font-bold leading-6 text-gray-900">
                  {{ userInfo ? userInfo.nickname : '加载中...' }}
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  @{{ userInfo ? userInfo.username || userInfo.email.split('@')[0] : '加载中...' }}
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    注册于
                    {{ userInfo ? new Date(userInfo.createdAt).toLocaleDateString() : '加载中...' }}
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    ID: {{ userInfo ? userInfo.userId : '加载中...' }}
                  </span>
                </div>
              </div>
              <!-- 移除右上角的编辑资料按钮 -->
            </div>
          </div>

          <!-- 成就统计 -->
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">成就统计</h3>
              <div>
                <button
                  v-if="!isEditing && userInfo && !isLoading"
                  @click="startEditing"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    class="-ml-1 mr-2 h-4 w-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                    />
                  </svg>
                  编辑资料
                </button>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="flex items-center">
                <span
                  class="inline-flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </span>
                <div class="ml-3">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">排名</h3>
                  <p class="text-xl font-semibold text-gray-700">{{ userStats.rank }}</p>
                </div>
              </div>

              <div class="flex items-center">
                <span
                  class="inline-flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </span>
                <div class="ml-3">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">解题数</h3>
                  <p class="text-xl font-semibold text-gray-700">{{ userStats.solvedProblems }}</p>
                </div>
              </div>

              <div class="flex items-center">
                <span
                  class="inline-flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </span>
                <div class="ml-3">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">积分</h3>
                  <p class="text-xl font-semibold text-gray-700">
                    {{ userStats.points.toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 解题统计 -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">解题统计</h3>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div class="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">已解决题目</dt>
                    <dd class="mt-1 text-3xl font-semibold text-gray-900">
                      {{ userStats.solvedProblems }} / {{ userStats.totalProblems }}
                    </dd>
                    <dd class="mt-2">
                      <div class="relative">
                        <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            :style="{ width: solvedPercentage + '%' }"
                            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                          ></div>
                        </div>
                      </div>
                      <p class="mt-1 text-xs text-gray-500">已完成 {{ solvedPercentage }}%</p>
                    </dd>
                  </dl>
                </div>
              </div>

              <div class="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">提交次数</dt>
                    <dd class="mt-1 text-3xl font-semibold text-gray-900">
                      {{ userStats.submissions }}
                    </dd>
                    <dd class="mt-3 text-sm text-gray-500">
                      <div class="flex items-center">
                        <span>通过率: </span>
                        <span class="ml-1 text-green-500 font-medium"
                          >{{ userStats.acceptanceRate }}%</span
                        >
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>

              <div class="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">难度分布</dt>
                    <dd class="mt-1">
                      <div class="flex items-center mt-2">
                        <span class="text-xs font-medium text-green-800 mr-2">简单</span>
                        <div class="relative w-full">
                          <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              :style="{ width: userStats.difficultyDistribution.easy + '%' }"
                              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            ></div>
                          </div>
                        </div>
                        <span class="ml-2 text-xs text-gray-500"
                          >{{ userStats.difficultyDistribution.easy }}%</span
                        >
                      </div>
                      <div class="flex items-center mt-2">
                        <span class="text-xs font-medium text-yellow-800 mr-2">中等</span>
                        <div class="relative w-full">
                          <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              :style="{ width: userStats.difficultyDistribution.medium + '%' }"
                              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                            ></div>
                          </div>
                        </div>
                        <span class="ml-2 text-xs text-gray-500"
                          >{{ userStats.difficultyDistribution.medium }}%</span
                        >
                      </div>
                      <div class="flex items-center mt-2">
                        <span class="text-xs font-medium text-red-800 mr-2">困难</span>
                        <div class="relative w-full">
                          <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              :style="{ width: userStats.difficultyDistribution.hard + '%' }"
                              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                            ></div>
                          </div>
                        </div>
                        <span class="ml-2 text-xs text-gray-500"
                          >{{ userStats.difficultyDistribution.hard }}%</span
                        >
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户详细信息卡片 -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <!-- 头部信息 -->
          <div class="px-4 py-5 sm:px-6">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">个人信息</h3>
              <p class="mt-1 text-sm text-gray-500 w-full">您的个人资料和账户信息</p>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-if="isLoading" class="px-4 py-5 sm:p-6 flex justify-center">
            <svg
              class="animate-spin h-8 w-8 text-indigo-600"
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
          </div>

          <!-- 错误提示 -->
          <div
            v-if="errorMessage"
            class="mx-4 my-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ errorMessage }}</span>
          </div>

          <!-- 成功提示 -->
          <div
            v-if="successMessage"
            class="mx-4 my-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ successMessage }}</span>
          </div>

          <!-- 查看模式 -->
          <div v-if="!isEditing && userInfo && !isLoading" class="border-t border-gray-200">
            <dl>
              <!-- 个人简介 -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">个人简介</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ userInfo.bio || '暂无简介' }}
                </dd>
              </div>

              <!-- 所在公司 -->
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">所在公司</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ userInfo.company || '未设置' }}
                </dd>
              </div>

              <!-- 网站 -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">网站</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a
                    v-if="userInfo.website"
                    :href="userInfo.website"
                    target="_blank"
                    class="text-indigo-600 hover:text-indigo-900"
                    >{{ userInfo.website }}</a
                  >
                  <span v-else>未设置</span>
                </dd>
              </div>

              <!-- 社交账号 -->
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">社交账号</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div class="flex space-x-4">
                    <a
                      v-if="userInfo.socialLinks?.github"
                      :href="userInfo.socialLinks.github"
                      target="_blank"
                      class="text-gray-400 hover:text-gray-500"
                    >
                      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fill-rule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      v-if="userInfo.socialLinks?.twitter"
                      :href="userInfo.socialLinks.twitter"
                      target="_blank"
                      class="text-gray-400 hover:text-gray-500"
                    >
                      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012.92 17.77a11.616 11.616 0 006.29 1.84"
                        />
                      </svg>
                    </a>
                    <a
                      v-if="userInfo.socialLinks?.linkedin"
                      :href="userInfo.socialLinks.linkedin"
                      target="_blank"
                      class="text-gray-400 hover:text-gray-500"
                    >
                      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        />
                      </svg>
                    </a>
                    <span
                      v-if="
                        !userInfo.socialLinks?.github &&
                        !userInfo.socialLinks?.twitter &&
                        !userInfo.socialLinks?.linkedin
                      "
                      class="text-gray-400"
                      >未设置社交账号</span
                    >
                  </div>
                </dd>
              </div>

              <!-- 邮箱 -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">邮箱</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ userInfo.email }}
                </dd>
              </div>

              <!-- 注册时间 -->
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">注册时间</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ new Date(userInfo.createdAt).toLocaleString() }}
                </dd>
              </div>

              <!-- 最后登录时间 -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">最后登录时间</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ new Date(userInfo.lastLoginAt).toLocaleString() }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- 编辑模式 -->
          <div
            v-if="isEditing && userInfo && !isLoading"
            class="border-t border-gray-200 px-4 py-5 sm:p-6"
          >
            <form @submit.prevent="updateUserInfo" class="space-y-6">
              <!-- 头像 -->
              <div>
                <label class="block text-sm font-medium text-gray-700">头像</label>
                <div class="mt-1 flex items-center space-x-5">
                  <img
                    :src="form.avatar"
                    alt="用户头像"
                    class="h-20 w-20 rounded-full object-cover"
                  />
                  <div class="flex flex-col space-y-2">
                    <label
                      for="avatar-upload"
                      class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span>上传新头像</span>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        class="sr-only"
                        @change="handleAvatarChange"
                      />
                    </label>
                    <div class="text-xs text-gray-500">支持JPG、PNG格式，大小不超过2MB</div>
                  </div>
                </div>
              </div>

              <!-- 用户名 (不可编辑) -->
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700">用户名</label>
                <div class="mt-1">
                  <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    disabled
                    class="shadow-sm bg-gray-100 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500">用户名不可更改</p>
              </div>

              <!-- 昵称 -->
              <div>
                <label for="nickname" class="block text-sm font-medium text-gray-700">昵称</label>
                <div class="mt-1">
                  <input
                    id="nickname"
                    v-model="form.nickname"
                    type="text"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="设置昵称（最多30个字符）"
                  />
                </div>
              </div>

              <!-- 个人简介 -->
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700">个人简介</label>
                <div class="mt-1">
                  <textarea
                    id="bio"
                    v-model="form.bio"
                    rows="3"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="介绍一下自己吧"
                  ></textarea>
                </div>
              </div>

              <!-- 公司 -->
              <div>
                <label for="company" class="block text-sm font-medium text-gray-700"
                  >所在公司</label
                >
                <div class="mt-1">
                  <input
                    id="company"
                    v-model="form.company"
                    type="text"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="您的公司或组织"
                  />
                </div>
              </div>

              <!-- 网站 -->
              <div>
                <label for="website" class="block text-sm font-medium text-gray-700"
                  >个人网站</label
                >
                <div class="mt-1">
                  <input
                    id="website"
                    v-model="form.website"
                    type="url"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <!-- 社交链接 -->
              <div>
                <label class="block text-sm font-medium text-gray-700">社交账号</label>
                <div class="mt-2 space-y-3">
                  <!-- GitHub -->
                  <div class="flex items-center">
                    <span class="w-8 h-8 flex items-center justify-center text-gray-400">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fill-rule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                    <input
                      v-model="form.socialLinks.github"
                      type="url"
                      class="ml-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <!-- Twitter -->
                  <div class="flex items-center">
                    <span class="w-8 h-8 flex items-center justify-center text-gray-400">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012.92 17.77a11.616 11.616 0 006.29 1.84"
                        />
                      </svg>
                    </span>
                    <input
                      v-model="form.socialLinks.twitter"
                      type="url"
                      class="ml-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <!-- LinkedIn -->
                  <div class="flex items-center">
                    <span class="w-8 h-8 flex items-center justify-center text-gray-400">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        />
                      </svg>
                    </span>
                    <input
                      v-model="form.socialLinks.linkedin"
                      type="url"
                      class="ml-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>

              <!-- 按钮组 -->
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="cancelEditing"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
