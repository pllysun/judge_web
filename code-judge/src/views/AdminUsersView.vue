<script setup lang="ts">
import { ref, onMounted, computed, reactive, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入API服务
import { userApi } from '../services/api'

// 导入认证方法
import { getAuthHeader } from '../services/api'

// 定义API基础URL
const API_BASE_URL = 'http://127.0.0.1:8080/api'

// 用户列表数据
const users = ref([])
const loading = ref(false)
const totalUsers = ref(0)

// 分页参数
const pagination = reactive({
  page: 0,
  size: 10,
})

// 搜索关键词
const searchKeyword = ref('')

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (
    roleDropdownOpen.value &&
    roleDropdownRef.value &&
    !roleDropdownRef.value.contains(event.target as Node)
  ) {
    roleDropdownOpen.value = false
  }
}

// 添加和移除事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 获取用户列表
async function fetchUsers() {
  loading.value = true
  try {
    let url = `${API_BASE_URL}/user/list?page=${pagination.page}&size=${pagination.size}`

    if (searchKeyword.value) {
      url += `&email=${encodeURIComponent(searchKeyword.value)}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('获取用户列表失败')
    }

    const data = await response.json()

    if (data.code === 200 && data.data) {
      // 转换API返回的数据格式为组件需要的格式
      users.value = data.data.records.map((user) => ({
        id: user.userId,
        username: user.nickname || user.username || user.email,
        email: user.email,
        registerTime: user.createdAt,
        status: user.ban ? 'banned' : 'active',
        role: user.role,
        roleCode: user.roleCode,
        avatar: user.avatar,
      }))
      totalUsers.value = data.data.total
    } else {
      ElMessage.error(data.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表出错:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选用户 - 现在直接通过API筛选
const filteredUsers = computed(() => users.value)

// 查看用户详情
async function viewUser(userId: number) {
  try {
    const user = users.value.find((u) => u.id === userId)
    if (!user) return

    const response = await fetch(`${API_BASE_URL}/user/byEmail`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
      }),
    })

    if (!response.ok) {
      throw new Error('获取用户详情失败')
    }

    const data = await response.json()

    if (data.code === 200 && data.data) {
      // 获取角色列表
      const rolesList = data.data.roles
        ? typeof data.data.roles === 'string'
          ? data.data.roles.split(',')
          : data.data.roles
        : []

      // 显示用户详情
      ElMessageBox.alert(
        `<div class="p-4 max-h-196 overflow-y-auto">
          <div class="flex items-center mb-6">
            <img class="h-16 w-16 rounded-full mr-4" src="${data.data.avatar}" alt="用户头像" />
            <div>
              <h3 class="text-lg font-bold text-gray-900">${data.data.nickname || data.data.username || data.data.email}</h3>
              <p class="text-sm text-gray-500">${data.data.email}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div class="border-b pb-3">
              <h4 class="text-sm font-medium text-gray-500 mb-2">基本信息</h4>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-xs text-gray-500">用户ID</p>
                  <p class="text-sm font-medium">${data.data.userId}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">账号状态</p>
                  <p class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${data.data.ban ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${data.data.ban ? '已封禁' : '正常'}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">注册时间</p>
                  <p class="text-sm font-medium">${data.data.createdAt}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">最后登录</p>
                  <p class="text-sm font-medium">${data.data.lastLoginAt}</p>
                </div>
              </div>
            </div>

            <div class="border-b pb-3">
              <h4 class="text-sm font-medium text-gray-500 mb-2">角色信息</h4>
              <div>
                <p class="text-xs text-gray-500">主要角色</p>
                <p class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                  ${
                    data.data.roleCode === 'ROLE_SUPER_ADMIN'
                      ? 'bg-red-100 text-red-800'
                      : data.data.roleCode === 'ROLE_ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : data.data.roleCode === 'ROLE_VIP'
                          ? 'bg-green-100 text-green-800'
                          : data.data.roleCode === 'ROLE_USER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                  }">
                  ${data.data.role} (${data.data.roleCode})
                </p>
              </div>
              <div class="mt-2">
                <p class="text-xs text-gray-500">角色等级</p>
                <p class="text-sm font-medium">${data.data.roleLevel || '未设置'}</p>
              </div>
              <div class="mt-2">
                <p class="text-xs text-gray-500">所有角色</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${rolesList
                    .map(
                      (role) => `
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${
                        role === 'ROLE_SUPER_ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : role === 'ROLE_ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : role === 'ROLE_VIP'
                              ? 'bg-green-100 text-green-800'
                              : role === 'ROLE_USER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                      }">
                      ${role}
                    </span>
                  `,
                    )
                    .join('')}
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-2">个人资料</h4>
              <div>
                <p class="text-xs text-gray-500">用户名</p>
                <p class="text-sm font-medium">${data.data.username || '未设置'}</p>
              </div>
              <div class="mt-2">
                <p class="text-xs text-gray-500">昵称</p>
                <p class="text-sm font-medium">${data.data.nickname || '未设置'}</p>
              </div>
              <div class="mt-2">
                <p class="text-xs text-gray-500">个人简介</p>
                <p class="text-sm font-medium">${data.data.bio || '未设置'}</p>
              </div>
            </div>
          </div>
        </div>`,
        '用户详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '关闭',
        },
      )
    } else {
      ElMessage.error(data.message || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情出错:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 编辑用户
function editUser(userId: number) {
  const user = users.value.find((u) => u.id === userId)
  if (!user) return

  ElMessage.info('编辑用户功能暂未实现')
}

// 角色选项 - 使用数字作为值，显示中文名称
const roleOptions = [
  { label: '游客', value: 1 },
  { label: '用户', value: 2 },
  { label: '会员', value: 3 },
  { label: '管理员', value: 4 },
  { label: '超级管理员', value: 5 },
]

// 权限修改弹窗状态
const showRoleModal = ref(false)
const selectedUserId = ref<number | null>(null)
const selectedRoleLevel = ref<number>(2)
const isSubmitting = ref(false)
const roleDropdownOpen = ref(false)
const roleDropdownRef = ref<HTMLElement | null>(null)

// 修改用户权限
async function updateUserRole(userId: number) {
  try {
    const user = users.value.find((u) => u.id === userId)
    if (!user) return

    // 获取当前用户角色对应的数字值
    let currentRoleValue = 2 // 默认为普通用户
    if (user.roleCode === 'ROLE_SUPER_ADMIN') currentRoleValue = 5
    else if (user.roleCode === 'ROLE_ADMIN') currentRoleValue = 4
    else if (user.roleCode === 'ROLE_VIP') currentRoleValue = 3
    else if (user.roleCode === 'ROLE_USER') currentRoleValue = 2
    else if (user.roleCode === 'ROLE_GUEST') currentRoleValue = 1

    // 打开弹窗并设置初始值
    selectedUserId.value = userId
    selectedRoleLevel.value = currentRoleValue
    showRoleModal.value = true
  } catch (error) {
    console.error('修改用户权限出错:', error)
    ElMessage.error('操作失败')
  }
}

// 提交权限修改
async function submitRoleChange() {
  if (!selectedUserId.value) return

  const user = users.value.find((u) => u.id === selectedUserId.value)
  if (!user) return

  try {
    isSubmitting.value = true

    // 发送请求到后端API - 将email放在请求体中而不是URL中
    const response = await fetch(`${API_BASE_URL}/user/updateRole`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        roleLevel: selectedRoleLevel.value,
      }),
    })

    if (!response.ok) {
      throw new Error('修改用户权限失败')
    }

    const data = await response.json()

    if (data.code === 200) {
      ElMessage.success('修改用户权限成功')
      // 更新用户角色 - 根据选择的数字值更新显示
      const selectedOption = roleOptions.find((option) => option.value === selectedRoleLevel.value)
      if (selectedOption) {
        // 更新角色显示名称
        user.role = selectedOption.label

        // 更新角色代码
        if (selectedRoleLevel.value === 5) user.roleCode = 'ROLE_SUPER_ADMIN'
        else if (selectedRoleLevel.value === 4) user.roleCode = 'ROLE_ADMIN'
        else if (selectedRoleLevel.value === 3) user.roleCode = 'ROLE_VIP'
        else if (selectedRoleLevel.value === 2) user.roleCode = 'ROLE_USER'
        else if (selectedRoleLevel.value === 1) user.roleCode = 'ROLE_GUEST'
      }

      // 关闭弹窗
      showRoleModal.value = false

      // 重新获取用户列表以确保数据同步
      fetchUsers()
    } else {
      ElMessage.error(data.message || '修改用户权限失败')
    }
  } catch (error) {
    console.error('修改用户权限出错:', error)
    ElMessage.error('操作失败')
  } finally {
    isSubmitting.value = false
  }
}

// 重置密码
async function resetPassword(userId: number) {
  try {
    const user = users.value.find((u) => u.id === userId)
    if (!user) return

    // 确认操作
    await ElMessageBox.confirm(
      `确定要重置用户 ${user.username} (${user.email}) 的密码吗？\n重置后的密码将通过邮件发送给用户。`,
      '重置用户密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 发送重置密码请求
    const response = await fetch(`${API_BASE_URL}/user/resetPassword`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
      }),
    })

    if (!response.ok) {
      throw new Error('重置密码失败')
    }

    const data = await response.json()

    if (data.code === 200) {
      ElMessage.success(data.message || '密码重置成功，新密码已发送至用户邮箱')
    } else {
      ElMessage.error(data.message || '重置密码失败')
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'cancel') {
      return // 用户取消操作
    }
    console.error('重置密码出错:', error)
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  }
}

// 封禁/解封用户
async function toggleUserStatus(userId: number, currentStatus: string) {
  try {
    const user = users.value.find((u) => u.id === userId)
    if (!user) return

    const ban = currentStatus === 'active'
    const action = ban ? '封禁' : '解封'

    // 确认操作
    await ElMessageBox.confirm(
      `确定要${action}用户 ${user.username} (${user.email}) 吗？`,
      `${action}用户`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const response = await fetch(`${API_BASE_URL}/user/ban`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        ban: ban,
      }),
    })

    if (!response.ok) {
      throw new Error(`${action}用户失败`)
    }

    const data = await response.json()

    if (data.code === 200) {
      ElMessage.success(`${action}用户成功`)
      // 更新用户状态 - 根据操作类型设置状态
      user.status = ban ? 'banned' : 'active'
      // 重新获取用户列表以确保数据同步
      fetchUsers()
    } else {
      ElMessage.error(data.message || `${action}用户失败`)
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'cancel') {
      return // 用户取消操作
    }
    console.error('操作用户状态出错:', error)
    ElMessage.error('操作失败')
  }
}

// 添加用户
function addUser() {
  ElMessage.info('添加用户功能暂未实现')
}

// 页面加载时获取用户列表
onMounted(() => {
  fetchUsers()
})

// 搜索用户
function handleSearch() {
  pagination.page = 0 // 重置到第一页
  fetchUsers()
}
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h2 class="text-lg leading-6 font-medium text-gray-900">用户管理</h2>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">管理系统用户、权限和账户状态</p>
      </div>
      <div class="flex space-x-3">
        <div class="relative">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="搜索用户邮箱"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
          @click="addUser"
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
    <div class="border-t border-gray-200">
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
                    @click="viewUser(user.id)"
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
                    @click="editUser(user.id)"
                    class="text-blue-600 hover:text-blue-900"
                    title="发送系统消息"
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
                    @click="resetPassword(user.id)"
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
                    @click="updateUserRole(user.id)"
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
                    @click="toggleUserStatus(user.id, user.status)"
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
                @click="pagination.page > 0 ? (pagination.page--, fetchUsers()) : null"
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
                @click="
                  (pagination.page + 1) * pagination.size < totalUsers
                    ? (pagination.page++, fetchUsers())
                    : null
                "
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
    </div>
  </div>

  <!-- 自定义权限修改弹窗 -->
  <div v-if="showRoleModal" class="fixed inset-0 z-50">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="showRoleModal = false"></div>
      </div>

      <!-- 弹窗内容 -->
      <div
        class="inline-block align-middle bg-white rounded-lg text-left shadow-xl transform translate-y-0 sm:my-8 sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">修改用户权限</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">请选择新的用户权限级别</p>
              </div>
            </div>
          </div>

          <!-- 下拉选择框 -->
          <div class="mt-4 relative">
            <div>
              <button
                type="button"
                ref="roleDropdownRef"
                @click="roleDropdownOpen = !roleDropdownOpen"
                class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <span class="block truncate">
                  {{
                    roleOptions.find((option) => option.value === selectedRoleLevel)?.label ||
                    '请选择权限级别'
                  }}
                </span>
                <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    class="h-5 w-5 text-gray-400"
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
                </span>
              </button>
            </div>

            <!-- 下拉选项列表 -->
            <div
              v-if="roleDropdownOpen"
              class="dropdown-menu-fix absolute bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              style="width: 100%; top: 100%; left: 0; margin-top: 4px; z-index: 2100"
            >
              <div
                v-for="option in roleOptions"
                :key="option.value"
                @click="((selectedRoleLevel = option.value), (roleDropdownOpen = false))"
                class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-100"
                :class="{ 'bg-indigo-50': option.value === selectedRoleLevel }"
              >
                <span
                  class="block truncate"
                  :class="{
                    'font-medium': option.value === selectedRoleLevel,
                    'font-normal': option.value !== selectedRoleLevel,
                  }"
                >
                  {{ option.label }}
                </span>

                <!-- 选中标记 -->
                <span
                  v-if="option.value === selectedRoleLevel"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600"
                >
                  <svg
                    class="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 按钮区域 -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="submitRoleChange"
            :disabled="isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            :class="{ 'opacity-75 cursor-not-allowed': isSubmitting }"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            {{ isSubmitting ? '处理中...' : '确定' }}
          </button>
          <button
            type="button"
            @click="showRoleModal = false"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
