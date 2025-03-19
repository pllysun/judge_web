<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import { useAuthStore } from '../stores/auth'
import { getAuthHeader } from '../services/api'

// 定义通知类型
interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createTime: string
}

const authStore = useAuthStore()
const notifications = ref<Notification[]>([])
const loading = ref(false)
const errorMessage = ref('')

// 模拟获取通知数据
async function fetchNotifications() {
  loading.value = true
  errorMessage.value = ''

  try {
    // 这里应该是实际的API调用，目前使用模拟数据
    // const response = await fetch('API_URL/notifications', {
    //   headers: getAuthHeader()
    // })
    // const data = await response.json()
    // notifications.value = data

    // 模拟数据
    setTimeout(() => {
      notifications.value = [
        {
          id: 1,
          title: '系统更新通知',
          content: '系统将于2023年12月15日进行维护升级，届时平台将暂停服务2小时。',
          type: 'info',
          isRead: false,
          createTime: '2023-12-10 10:00:00',
        },
        {
          id: 2,
          title: '新比赛开始',
          content: '"算法挑战赛2023"已经开始，欢迎参加！',
          type: 'success',
          isRead: false,
          createTime: '2023-12-08 14:30:00',
        },
        {
          id: 3,
          title: '账号安全提醒',
          content: '我们检测到您的账号在新设备上登录，如非本人操作，请立即修改密码。',
          type: 'warning',
          isRead: true,
          createTime: '2023-12-05 18:45:00',
        },
        {
          id: 4,
          title: '提交结果通知',
          content: '您提交的题目"动态规划基础"已通过所有测试用例！',
          type: 'success',
          isRead: true,
          createTime: '2023-12-01 09:15:00',
        },
        {
          id: 5,
          title: '评论回复',
          content: '用户"CodeMaster"回复了您在"贪心算法"讨论中的评论。',
          type: 'info',
          isRead: true,
          createTime: '2023-11-28 16:20:00',
        },
      ]
      loading.value = false
    }, 800)
  } catch (error) {
    console.error('获取通知失败:', error)
    errorMessage.value = '获取通知列表失败，请稍后再试'
    loading.value = false
  }
}

// 标记通知为已读
async function markAsRead(notification: Notification) {
  if (notification.isRead) return

  try {
    // 这里应该是实际的API调用
    // await fetch(`API_URL/notifications/${notification.id}/read`, {
    //   method: 'POST',
    //   headers: getAuthHeader()
    // })

    // 模拟API调用成功
    notification.isRead = true
  } catch (error) {
    console.error('标记通知已读失败:', error)
  }
}

// 标记所有通知为已读
async function markAllAsRead() {
  try {
    // 这里应该是实际的API调用
    // await fetch('API_URL/notifications/read-all', {
    //   method: 'POST',
    //   headers: getAuthHeader()
    // })

    // 模拟API调用成功
    notifications.value.forEach((notification) => {
      notification.isRead = true
    })
  } catch (error) {
    console.error('标记所有通知已读失败:', error)
  }
}

// 删除通知
async function deleteNotification(id: number) {
  try {
    // 这里应该是实际的API调用
    // await fetch(`API_URL/notifications/${id}`, {
    //   method: 'DELETE',
    //   headers: getAuthHeader()
    // })

    // 模拟API调用成功
    notifications.value = notifications.value.filter((item) => item.id !== id)
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

// 格式化时间
function formatTime(timeString: string): string {
  const date = new Date(timeString)
  const now = new Date()

  // 计算时间差（毫秒）
  const diff = now.getTime() - date.getTime()

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // 大于7天，显示具体日期
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取未读通知数量
const unreadCount = computed(() => {
  return notifications.value.filter((item) => !item.isRead).length
})

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold leading-tight text-gray-900">我的通知</h1>
            <button
              v-if="notifications.length > 0"
              @click="markAllAsRead"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <i class="fas fa-check-double mr-2"></i>
              全部标为已读
            </button>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 加载中 -->
          <div v-if="loading" class="flex justify-center py-12">
            <div
              class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"
            ></div>
          </div>

          <!-- 错误信息 -->
          <div v-else-if="errorMessage" class="rounded-md bg-red-50 p-4 my-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-red-400"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
              </div>
            </div>
          </div>

          <!-- 无通知 -->
          <div v-else-if="notifications.length === 0" class="text-center py-12">
            <i class="fas fa-bell-slash text-gray-400 text-5xl mb-4"></i>
            <p class="text-gray-500 text-xl">暂无通知</p>
          </div>

          <!-- 通知列表 -->
          <div v-else class="bg-white shadow overflow-hidden sm:rounded-md mt-4">
            <ul class="divide-y divide-gray-200">
              <li v-for="notification in notifications" :key="notification.id" class="relative">
                <div
                  class="px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                  :class="{ 'bg-blue-50 hover:bg-blue-50': !notification.isRead }"
                  @click="markAsRead(notification)"
                >
                  <!-- 未读标记 -->
                  <div
                    v-if="!notification.isRead"
                    class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                  ></div>

                  <div class="flex justify-between items-start">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center">
                        <!-- 通知类型图标 -->
                        <div class="flex-shrink-0 mr-3">
                          <div
                            class="h-10 w-10 rounded-full flex items-center justify-center"
                            :class="{
                              'bg-blue-100 text-blue-600': notification.type === 'info',
                              'bg-green-100 text-green-600': notification.type === 'success',
                              'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                              'bg-red-100 text-red-600': notification.type === 'error',
                            }"
                          >
                            <i
                              class="text-lg"
                              :class="{
                                'fas fa-info': notification.type === 'info',
                                'fas fa-check-circle': notification.type === 'success',
                                'fas fa-exclamation-triangle': notification.type === 'warning',
                                'fas fa-times-circle': notification.type === 'error',
                              }"
                            ></i>
                          </div>
                        </div>

                        <!-- 通知内容 -->
                        <div>
                          <h3
                            class="text-sm font-medium"
                            :class="
                              notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'
                            "
                          >
                            {{ notification.title }}
                          </h3>
                          <p class="mt-1 text-sm text-gray-600 line-clamp-2">
                            {{ notification.content }}
                          </p>
                          <p class="mt-1 text-xs text-gray-400">
                            {{ formatTime(notification.createTime) }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="ml-4 flex-shrink-0 flex">
                      <button
                        @click.stop="deleteNotification(notification.id)"
                        class="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
