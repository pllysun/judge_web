<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  }
})

// 定义组件发出的事件
const emit = defineEmits(['update:searchKeyword', 'search', 'add-user'])

// 本地搜索关键词
const localSearchKeyword = ref(props.searchKeyword)

// 监听输入变化
function handleInput(event) {
  localSearchKeyword.value = event.target.value
  emit('update:searchKeyword', localSearchKeyword.value)
}

// 搜索用户
function handleSearch() {
  emit('search')
}

// 添加用户
function handleAddUser() {
  emit('add-user')
}
</script>

<template>
  <div class="flex justify-between items-center px-4 py-5 sm:px-6">
    <div>
      <h2 class="text-lg leading-6 font-medium text-gray-900">用户管理</h2>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">管理系统用户、权限和账户状态</p>
    </div>
    <div class="flex space-x-3">
      <div class="relative">
        <input
          type="text"
          v-model="localSearchKeyword"
          placeholder="搜索用户邮箱"
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          @input="handleInput"
          @keyup.enter="handleSearch"
        />
      </div>
      <button
        type="button"
        @click="handleSearch"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg
          class="-ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          />
        </svg>
        搜索
      </button>
      <button
        type="button"
        @click="handleAddUser"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg
          class="-ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        添加用户
      </button>
    </div>
  </div>
</template>