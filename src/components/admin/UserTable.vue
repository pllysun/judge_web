<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  users: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  pagination: {
    type: Object,
    required: true
  }
})

// 定义组件发出的事件
const emit = defineEmits([
  'view-user',
  'edit-user',
  'reset-password',
  'update-user-role',
  'toggle-user-status',
  'page-change'
])

// 筛选用户 - 直接使用传入的用户列表
const filteredUsers = computed(() => props.users)

// 处理分页变化
function handlePreviousPage() {
  if (props.pagination.page > 0) {
    emit('page-change', props.pagination.page - 1)
  }
}

function handleNextPage() {
  if ((props.pagination.page + 1) * props.pagination.size < props.totalUsers) {
    emit('page-change', props.pagination.page + 1)
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <svg
        class="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500"
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
      <span class="text-lg font-medium text-gray-700">加载中...</span>
    </div>

    <!-- 无数据提示 -->
    <div v-else-if="users.length === 0" class="flex justify-center items-center py-10">
      <span class="text-lg font-medium text-gray-500">暂无用户数据</span>
    </div>

    <!-- 用户列表 -->
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            用户ID
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            用户名
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            邮箱
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            注册时间
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            状态
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            角色
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            操作
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in filteredUsers" :key="user.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ user.id }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <img class="h-10 w-10 rounded-full" :src="user.avatar" alt="" />
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ user.email }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ user.registerTime }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="{
                'bg-green-100 text-green-800': user.status === 'active',
                'bg-red-100 text-red-800': user.status === 'banned',
              }"
            >
              {{ user.status === 'active' ? '正常' : '已封禁' }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="{
                'bg-blue-100 text-blue-800': user.roleCode === 'ROLE_USER',
                'bg-purple-100 text-purple-800': user.roleCode === 'ROLE_ADMIN',
                'bg-red-100 text-red-800': user.roleCode === 'ROLE_SUPER_ADMIN',
                'bg-green-100 text-green-800': user.roleCode === 'ROLE_VIP',
                'bg-gray-100 text-gray-800': user.roleCode === 'ROLE_GUEST',
              }"
            >
              {{ user.role }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button
                type="button"
                @click="emit('view-user', user.id)"
                class="text-indigo-600 hover:text-indigo-900"
                title="查看详情"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                @click="emit('edit-user', user.id)"
                class="text-blue-600 hover:text-blue-900"
                title="发送系统通知"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"
                  />
                  <path
                    d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"
                  />
                </svg>
              </button>
              <button
                type="button"
                @click="emit('reset-password', user.id)"
                class="text-yellow-600 hover:text-yellow-900"
                title="重置密码"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                @click="emit('update-user-role', user.id)"
                class="text-green-600 hover:text-green-900"
                title="修改权限"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                @click="emit('toggle-user-status', user.id, user.status)"
                :class="{
                  'text-red-600 hover:text-red-900': user.status === 'active',
                  'text-green-600 hover:text-green-900': user.status === 'banned',
                }"
                :title="user.status === 'active' ? '封禁用户' : '解封用户'"
              >
                <!-- 封禁图标 - 当用户状态为active时显示 -->
                <svg
                  v-if="user.status === 'active'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <!-- 解封图标 - 当用户状态为banned时显示 -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页控件 -->
    <div
      v-if="totalUsers > 0"
      class="px-6 py-4 flex items-center justify-between border-t border-gray-200"
    >
      <div class="flex-1 flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-700">
            显示第
            <span class="font-medium">{{ pagination.page * pagination.size + 1 }}</span> 到
            <span class="font-medium">{{
              Math.min((pagination.page + 1) * pagination.size, totalUsers)
            }}</span>
            条， 共 <span class="font-medium">{{ totalUsers }}</span> 条记录
          </p>
        </div>
        <div class="flex space-x-2">
          <button
            @click="handlePreviousPage"
            :disabled="pagination.page === 0"
            :class="{
              'opacity-50 cursor-not-allowed': pagination.page === 0,
              'hover:bg-gray-50': pagination.page > 0,
            }"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white"
          >
            上一页
          </button>
          <button
            @click="handleNextPage"
            :disabled="(pagination.page + 1) * pagination.size >= totalUsers"
            :class="{
              'opacity-50 cursor-not-allowed':
                (pagination.page + 1) * pagination.size >= totalUsers,
              'hover:bg-gray-50': (pagination.page + 1) * pagination.size < totalUsers,
            }"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>