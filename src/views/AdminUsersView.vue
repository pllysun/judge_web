<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入组件
import UserTable from '../components/admin/UserTable.vue'
import UserSearch from '../components/admin/UserSearch.vue'
import UserRoleModal from '../components/admin/UserRoleModal.vue'
import NotificationModal from '../components/admin/NotificationModal.vue'

// 导入服务
import { userService, type User, type Pagination } from '../services/userService'
import { notificationService, type NotificationRequest } from '../services/notificationService'

// 用户列表数据
const users = ref<User[]>([])
const loading = ref(false)
const totalUsers = ref(0)

// 分页参数
const pagination = reactive<Pagination>({
  page: 0,
  size: 10,
})

// 搜索关键词
const searchKeyword = ref('')

// 权限修改弹窗状态
const showRoleModal = ref(false)
const selectedUserId = ref<number | null>(null)
const selectedRoleLevel = ref<number>(2)
const isSubmitting = ref(false)

// 通知弹窗状态
const showNotificationModal = ref(false)
const isSubmittingNotification = ref(false)

// 点击外部关闭下拉菜单
const roleDropdownRef = ref<HTMLElement | null>(null)
const roleDropdownOpen = ref(false)

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
  fetchUsers()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 获取用户列表
async function fetchUsers() {
  loading.value = true
  try {
    const result = await userService.getUserList(pagination, searchKeyword.value)
    users.value = result.users
    totalUsers.value = result.total
  } catch (error) {
    console.error('获取用户列表出错:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 查看用户详情
async function viewUser(userId: number) {
  try {
    const user = users.value.find((u) => u.id === userId)
    if (!user) return

    const userData = await userService.getUserDetail(user.email)
    
    // 获取角色列表
    const rolesList = userData.roles
      ? typeof userData.roles === 'string'
        ? userData.roles.split(',')
        : userData.roles
      : []

    // 显示用户详情
    ElMessageBox.alert(
      `<div class="p-4 max-h-196 overflow-y-auto">
        <div class="flex items-center mb-6">
          <img class="h-16 w-16 rounded-full mr-4" src="${userData.avatar}" alt="用户头像" />
          <div>
            <h3 class="text-lg font-bold text-gray-900">${userData.nickname || userData.username || userData.email}</h3>
            <p class="text-sm text-gray-500">${userData.email}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="border-b pb-3">
            <h4 class="text-sm font-medium text-gray-500 mb-2">基本信息</h4>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <p class="text-xs text-gray-500">用户ID</p>
                <p class="text-sm font-medium">${userData.userId}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">账号状态</p>
                <p class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${userData.ban ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                  ${userData.ban ? '已封禁' : '正常'}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500">注册时间</p>
                <p class="text-sm font-medium">${userData.createdAt}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">最后登录</p>
                <p class="text-sm font-medium">${userData.lastLoginAt}</p>
              </div>
            </div>
          </div>

          <div class="border-b pb-3">
            <h4 class="text-sm font-medium text-gray-500 mb-2">角色信息</h4>
            <div>
              <p class="text-xs text-gray-500">主要角色</p>
              <p class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                ${userData.roleCode === 'ROLE_SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 
                  userData.roleCode === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                  userData.roleCode === 'ROLE_VIP' ? 'bg-green-100 text-green-800' : 
                  userData.roleCode === 'ROLE_USER' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'}">
                ${userData.role} (${userData.roleCode})
              </p>
            </div>
            <div class="mt-2">
              <p class="text-xs text-gray-500">角色等级</p>
              <p class="text-sm font-medium">${userData.roleLevel || '未设置'}</p>
            </div>
            <div class="mt-2">
              <p class="text-xs text-gray-500">所有角色</p>
              <div class="flex flex-wrap gap-1 mt-1">
                ${rolesList.map(role => `
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${role === 'ROLE_SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 
                      role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                      role === 'ROLE_VIP' ? 'bg-green-100 text-green-800' : 
                      role === 'ROLE_USER' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}">
                    ${role}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-500 mb-2">个人资料</h4>
            <div>
              <p class="text-xs text-gray-500">用户名</p>
              <p class="text-sm font-medium">${userData.username || '未设置'}</p>
            </div>
            <div class="mt-2">
              <p class="text-xs text-gray-500">昵称</p>
              <p class="text-sm font-medium">${userData.nickname || '未设置'}</p>
            </div>
            <div class="mt-2">
              <p class="text-xs text-gray-500">个人简介</p>
              <p class="text-sm font-medium">${userData.bio || '未设置'}</p>
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
  } catch (error) {
    console.error('获取用户详情出错:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 编辑用户 - 发送系统通知
function editUser(userId: number) {
  const user = users.value.find((u) => u.id === userId)
  if (!user) return
  
  // 设置当前选中的用户ID
  selectedUserId.value = userId
  
  // 打开通知弹窗
  showNotificationModal.value = true
}

// 角色选项 - 使用数字作为值，显示中文名称
const roleOptions = [
  { label: '游客', value: 1 },
  { label: '用户', value: 2 },
  { label: '会员', value: 3 },
  { label: '管理员', value: 4 },
  { label: '超级管理员', value: 5 },
]

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

    // 发送请求到后端API
    const data = await userService.updateUserRole(user.email, selectedRoleLevel.value)
    
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
    const data = await userService.resetPassword(user.email)
    
    ElMessage.success(data.message || '密码重置成功，新密码已发送至用户邮箱')
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

    const data = await userService.toggleUserStatus(user.email, ban)
    
    ElMessage.success(`${action}用户成功`)
    
    // 更新用户状态 - 根据操作类型设置状态
    user.status = ban ? 'banned' : 'active'
    
    // 重新获取用户列表以确保数据同步
    fetchUsers()
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

// 搜索用户
function handleSearch() {
  pagination.page = 0 // 重置到第一页
  fetchUsers()
}

// 处理分页变化
function handlePageChange(newPage: number) {
  pagination.page = newPage
  fetchUsers()
}

// 提交系统通知
async function submitNotification(notification: NotificationRequest) {
  try {
    isSubmittingNotification.value = true
    
    // 如果是发送给当前选中用户
    if (notification.receiverId === 'current' && selectedUserId.value) {
      const user = users.value.find((u) => u.id === selectedUserId.value)
      if (user) {
        notification.receiverId = user.email
      } else {
        throw new Error('未找到选中的用户')
      }
    }
    
    // 发送通知请求
    const result = await notificationService.createNotification(notification)
    
    ElMessage.success('通知发送成功')
    
    // 关闭弹窗
    showNotificationModal.value = false
  } catch (error) {
    console.error('发送通知出错:', error)
    ElMessage.error(error instanceof Error ? error.message : '发送通知失败')
  } finally {
    isSubmittingNotification.value = false
  }
}
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <!-- 搜索和标题区域 -->
    <UserSearch
      v-model:searchKeyword="searchKeyword"
      @search="handleSearch"
      @add-user="addUser"
    />
    
    <div class="border-t border-gray-200">
      <!-- 用户表格 -->
      <UserTable
        :users="users"
        :loading="loading"
        :totalUsers="totalUsers"
        :pagination="pagination"
        @view-user="viewUser"
        @edit-user="editUser"
        @reset-password="resetPassword"
        @update-user-role="updateUserRole"
        @toggle-user-status="toggleUserStatus"
        @page-change="handlePageChange"
      />
    </div>
  </div>

  <!-- 角色修改弹窗 -->
  <UserRoleModal
    v-model:visible="showRoleModal"
    v-model:selectedRoleLevel="selectedRoleLevel"
    :isSubmitting="isSubmitting"
    @submit="submitRoleChange"
    @cancel="showRoleModal = false"
  />
  
  <!-- 系统通知弹窗 -->
  <NotificationModal
    v-model:visible="showNotificationModal"
    :isSubmitting="isSubmittingNotification"
    @submit="submitNotification"
    @cancel="showNotificationModal = false"
  />
</template>