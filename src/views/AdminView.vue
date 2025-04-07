<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AdminUsersView from './AdminUsersView.vue'
import AdminProblemsView from './AdminProblemsView.vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('users') // 默认显示用户管理标签

// 切换标签
function switchTab(tab: string) {
  activeTab.value = tab
}
// 检查是否为管理员
// 使用roles判断用户是否为管理员或超级管理员，兼容字符串和数组两种格式
const userRoles = authStore.user?.roles || []
const isAdmin = Array.isArray(userRoles)
  ? userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_SUPER_ADMIN')
  : typeof userRoles === 'string' &&
    (userRoles === 'ROLE_ADMIN' ||
      userRoles === 'ROLE_SUPER_ADMIN' ||
      userRoles.split(',').includes('ROLE_ADMIN') ||
      userRoles.split(',').includes('ROLE_SUPER_ADMIN'))

if (authStore.user && !isAdmin) {
  // 如果不是管理员，重定向到首页
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <!-- 主要内容 -->
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">管理员面板</h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 管理员导航 -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div class="border-b border-gray-200">
              <nav class="flex -mb-px">
                <a
                  href="#"
                  @click.prevent="switchTab('users')"
                  class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
                  :class="{
                    'border-indigo-500 text-indigo-600': activeTab === 'users',
                    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                      activeTab !== 'users',
                  }"
                >
                  用户管理
                </a>
                <a
                  href="#"
                  @click.prevent="switchTab('problems')"
                  class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
                  :class="{
                    'border-indigo-500 text-indigo-600': activeTab === 'problems',
                    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                      activeTab !== 'problems',
                  }"
                >
                  题目管理
                </a>
              </nav>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="mt-6">
            <component :is="activeTab === 'users' ? AdminUsersView : AdminProblemsView" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
