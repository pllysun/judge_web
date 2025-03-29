<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ref, onMounted, onUnmounted, defineExpose } from 'vue'
import { authApi } from '../services/api'
import { notificationService } from '../services/notificationService'

const router = useRouter()

const authStore = useAuthStore()
const showDropdown = ref(false)
const dropdownRef = ref(null)
const buttonRef = ref(null)
const unreadNotificationsCount = ref(0)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

// 点击外部区域关闭下拉菜单
function handleClickOutside(event) {
  if (dropdownRef.value && buttonRef.value) {
    if (!dropdownRef.value.contains(event.target) && !buttonRef.value.contains(event.target)) {
      showDropdown.value = false
    }
  }
}

// 获取未读通知数量
async function fetchUnreadNotificationsCount() {
  if (authStore.isLoggedIn) {
    try {
      const result = await notificationService.getNotifications(0, 1)
      unreadNotificationsCount.value = result.unreadCount
    } catch (error) {
      console.error('获取未读通知数量失败:', error)
    }
  }
}

// 更新未读通知数量 - 供外部组件调用
async function updateUnreadCount(count?: number) {
  if (count !== undefined) {
    // 如果提供了具体数量，直接更新
    unreadNotificationsCount.value = count
  } else {
    // 否则重新获取
    await fetchUnreadNotificationsCount()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  fetchUnreadNotificationsCount()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

// 暴露方法给父组件
defineExpose({
  updateUnreadCount
})

async function handleLogout() {
  try {
    await authApi.logout() // 先调用API的logout方法
    authStore.logout() // 然后清除本地存储的认证信息
    showDropdown.value = false
    // 退出登录后跳转到首页
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
    // 即使API调用失败，也清除本地存储的认证信息
    authStore.logout()
    showDropdown.value = false
    // 退出登录后跳转到首页
    router.push('/')
    // 显示友好的错误提示
    alert('退出登录时遇到问题，但您已成功登出系统')
  }
}
</script>

<template>
  <!-- 导航栏 -->
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <RouterLink to="/" class="text-2xl font-bold text-blue-600">CodeJudge</RouterLink>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <RouterLink
              to="/"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500 text-gray-900': $route.path === '/' }"
            >
              首页
            </RouterLink>
            <RouterLink
              to="/problems"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500 text-gray-900': $route.path.startsWith('/problems') }"
            >
              题库
            </RouterLink>
            <RouterLink
              to="/leaderboard"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500 text-gray-900': $route.path === '/leaderboard' }"
            >
              排行榜
            </RouterLink>
            <RouterLink
              to="/contests"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500 text-gray-900': $route.path.startsWith('/contests') }"
            >
              竞赛
            </RouterLink>
            <RouterLink
              to="/discussions"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500 text-gray-900': $route.path.startsWith('/discussions') }"
            >
              讨论区
            </RouterLink>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- 已登录状态 -->
          <template v-if="authStore.isLoggedIn">
            <RouterLink
              to="/notifications"
              class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
            >
              <span class="sr-only">查看通知</span>
              <i class="fas fa-bell text-lg"></i>
              <!-- 未读通知标记 -->
              <span
                v-if="unreadNotificationsCount > 0"
                class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
              ></span>
            </RouterLink>

            <!-- 个人资料下拉菜单 -->
            <div class="ml-3 relative">
              <div>
                <button
                  ref="buttonRef"
                  @click="toggleDropdown"
                  class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none"
                >
                  <div v-if="authStore.user?.avatar" class="h-8 w-8 rounded-full overflow-hidden">
                    <img
                      :src="authStore.user.avatar"
                      alt="用户头像"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium"
                  >
                    {{ authStore.user?.email.charAt(0).toUpperCase() }}
                  </div>
                  <span class="ml-2 text-gray-700">{{
                    authStore.user?.nickname || authStore.user?.loginId || authStore.user?.email
                  }}</span>
                  <svg
                    class="ml-1 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <!-- 下拉菜单 -->
              <div
                v-if="showDropdown"
                ref="dropdownRef"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <RouterLink
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  个人信息
                </RouterLink>
                <RouterLink
                  to="/change-password"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  修改密码
                </RouterLink>
                <!-- 管理员入口 -->
                <RouterLink
                  v-if="
                    authStore.user?.roles &&
                    (Array.isArray(authStore.user.roles)
                      ? authStore.user.roles.includes('ROLE_ADMIN') ||
                        authStore.user.roles.includes('ROLE_SUPER_ADMIN')
                      : typeof authStore.user.roles === 'string' &&
                        (authStore.user.roles === 'ROLE_ADMIN' ||
                          authStore.user.roles === 'ROLE_SUPER_ADMIN' ||
                          authStore.user.roles.split(',').includes('ROLE_ADMIN') ||
                          authStore.user.roles.split(',').includes('ROLE_SUPER_ADMIN')))
                  "
                  to="/admin"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  管理员面板
                </RouterLink>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            </div>
          </template>

          <!-- 未登录状态 -->
          <template v-else>
            <RouterLink
              to="/login"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
            >
              登录
            </RouterLink>
            <RouterLink
              to="/register"
              class="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              注册
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
