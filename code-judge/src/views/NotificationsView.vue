<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import NotificationDetailModal from '../components/NotificationDetailModal.vue'
import { useAuthStore } from '../stores/auth'
import { notificationService, NotificationResponse } from '../services/notificationService'

// 定义通知类型
interface Notification {
  id: number
  title: string
  content: string
  type: string
  isRead: boolean
  createTime: string
}

const authStore = useAuthStore()
const notifications = ref<Notification[]>([])
const loading = ref(false)
const errorMessage = ref('')
const unreadCount = ref(0)
const page = ref(0)
const size = ref(10)
const totalNotifications = ref(0)

// 导航栏组件引用
const navBarRef = ref(null)

// 详情弹窗相关
const showDetailModal = ref(false)
const selectedNotification = ref<Notification | null>(null)

// 获取通知数据
async function fetchNotifications() {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await notificationService.getNotifications(page.value, size.value)
    
    // 将API返回的通知数据转换为组件使用的格式
    notifications.value = result.notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      content: notification.content,
      type: getNotificationType(notification.type),
      isRead: notification.read,
      createTime: notification.createdAt
    }))
    
    totalNotifications.value = result.total
    unreadCount.value = result.unreadCount
    loading.value = false
  } catch (error) {
    console.error('获取通知失败:', error)
    errorMessage.value = '获取通知列表失败，请稍后再试'
    loading.value = false
  }
}

// 根据通知类型返回对应的UI类型
function getNotificationType(type: string): string {
  switch (type) {
    case 'SYSTEM_UPDATE':
      return 'info'
    case 'COMPETITION_START':
      return 'success'
    case 'ANNOUNCEMENT':
      return 'warning'
    default:
      return 'info'
  }
}

// 标记通知为已读
async function markAsRead(notification: Notification) {
  if (notification.isRead) return

  try {
    await notificationService.markAsRead(notification.id)
    notification.isRead = true
    unreadCount.value--
    
    // 更新导航栏中的未读通知计数
    if (navBarRef.value) {
      navBarRef.value.updateUnreadCount(unreadCount.value)
    }
  } catch (error) {
    console.error('标记通知已读失败:', error)
  }
}

// 查看通知详情
async function viewNotificationDetail(notification: Notification) {
  selectedNotification.value = notification
  showDetailModal.value = true
  
  // 如果通知未读，则标记为已读
  if (!notification.isRead) {
    await markAsRead(notification)
  }
}

// 标记所有通知为已读
async function markAllAsRead() {
  try {
    await notificationService.markAllAsRead()
    
    // 更新本地通知状态
    notifications.value.forEach((notification) => {
      notification.isRead = true
    })
    unreadCount.value = 0
    
    // 更新导航栏中的未读通知计数
    if (navBarRef.value) {
      navBarRef.value.updateUnreadCount(0)
    }
  } catch (error) {
    console.error('标记所有通知已读失败:', error)
  }
}

// 删除通知（仅删除当前用户的通知状态，不删除通知本身）
async function deleteNotification(id: number) {
  try {
    await notificationService.deleteUserNotification(id)
    
    // 从列表中移除已删除的通知
    const deletedNotification = notifications.value.find(item => item.id === id)
    if (deletedNotification && !deletedNotification.isRead) {
      unreadCount.value--
    }
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

// 计算当前页面上的未读通知数量
const pageUnreadCount = computed(() => {
  return notifications.value.filter((item) => !item.isRead).length
})

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar ref="navBarRef" />

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
          <div v-else class="max-w-7xl mx-auto mt-6">
            <ul class="space-y-3">
              <li v-for="notification in notifications" :key="notification.id" class="relative">
                <div
                  class="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 ease-in-out overflow-hidden cursor-pointer group"
                  :class="{ 
                    'border-l-4 border-l-blue-500 bg-blue-50/50': !notification.isRead,
                    'hover:border-l-blue-300': notification.isRead 
                  }"
                  @click="viewNotificationDetail(notification)"
                >
                  <div class="px-5 py-5 sm:px-6">
                    <div class="flex justify-between items-start">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start">
                          <!-- 通知类型图标 -->
                          <div class="flex-shrink-0 mr-4">
                            <div
                              class="h-12 w-12 rounded-full flex items-center justify-center shadow-sm transform transition-transform group-hover:scale-110"
                              :class="{
                                'bg-blue-100 text-blue-600': notification.type === 'info',
                                'bg-green-100 text-green-600': notification.type === 'success',
                                'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                                'bg-red-100 text-red-600': notification.type === 'error',
                              }"
                            >
                              <i
                                class="text-xl"
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
                          <div class="pt-1">
                            <div class="flex items-center">
                              <h3
                                class="text-base font-medium truncate max-w-md"
                                :class="
                                  notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'
                                "
                              >
                                {{ notification.title }}
                              </h3>
                              <!-- 未读标记 -->
                              <span 
                                v-if="!notification.isRead" 
                                class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                未读
                              </span>
                            </div>
                            <p class="mt-2 text-sm text-gray-600 line-clamp-2 pr-4 leading-relaxed">
                              {{ notification.content }}
                            </p>
                            <div class="mt-3 flex items-center text-xs text-gray-500">
                              <span class="inline-flex items-center">
                                <i class="fas fa-clock mr-1 opacity-75"></i>
                                {{ formatTime(notification.createTime) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 操作按钮 -->
                      <div class="ml-4 flex-shrink-0 flex opacity-70 hover:opacity-100 transition-opacity">
                        <button
                          @click.stop="deleteNotification(notification.id)"
                          class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full focus:outline-none transition-colors duration-200"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
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
  
  <!-- 通知详情弹窗 -->
  <NotificationDetailModal
    v-model:visible="showDetailModal"
    :notification="selectedNotification"
    @close="showDetailModal = false"
  />
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
