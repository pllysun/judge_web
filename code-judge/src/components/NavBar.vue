<script setup lang="ts">
import { RouterLink } from 'vue-router';
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
            <RouterLink to="/" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="{ 'border-indigo-500 text-gray-900': $route.path === '/' }">
              首页
            </RouterLink>
            <RouterLink to="/problems" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="{ 'border-indigo-500 text-gray-900': $route.path.startsWith('/problems') }">
              题库
            </RouterLink>
            <RouterLink to="/leaderboard" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="{ 'border-indigo-500 text-gray-900': $route.path === '/leaderboard' }">
              排行榜
            </RouterLink>
            <RouterLink to="/contests" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="{ 'border-indigo-500 text-gray-900': $route.path.startsWith('/contests') }">
              竞赛
            </RouterLink>
            <RouterLink to="/discussions" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="{ 'border-indigo-500 text-gray-900': $route.path.startsWith('/discussions') }">
              讨论区
            </RouterLink>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <button class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span class="sr-only">查看通知</span>
            <i class="fas fa-bell text-lg"></i>
          </button>

          <!-- 个人资料下拉菜单 -->
          <div class="ml-3 relative">
            <div>
              <RouterLink to="/profile" class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                <span class="ml-2 text-gray-700">张三</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>