// 通知管理服务
import { getAuthHeader } from './api'
import { API_BASE_URL } from '../config/api.config.js'

// 通知类型定义
export type NotificationType = 'SYSTEM_UPDATE' | 'COMPETITION_START' | 'ANNOUNCEMENT' | 'OTHER'

// 通知请求参数类型
export interface NotificationRequest {
  type: NotificationType
  title: string
  content: string
  receiverId: string // 'all' 表示所有用户，或者特定用户的email
}

// 通知响应类型
export interface NotificationResponse {
  id: number
  type: NotificationType
  title: string
  content: string
  createdAt: string
  read: boolean
}

// 通知管理服务
export const notificationService = {
  // 创建并发送通知
  async createNotification(notification: NotificationRequest): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/create`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '发送通知失败')
      }

      const data = await response.json()

      if (data.code === 200 && data.data) {
        return data.data
      } else {
        throw new Error(data.message || '发送通知失败')
      }
    } catch (error) {
      console.error('发送通知出错:', error)
      throw error
    }
  },

  // 获取当前用户的通知列表
  async getNotifications(
    page: number = 0,
    size: number = 10,
  ): Promise<{ notifications: NotificationResponse[]; total: number; unreadCount: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/list?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取通知列表失败')
      }

      const data = await response.json()

      if (data.code === 200 && data.data) {
        return {
          notifications: data.data.notifications || [],
          total: data.data.notifications?.length || 0,
          unreadCount: data.data.unreadCount || 0,
        }
      } else {
        throw new Error(data.message || '获取通知列表失败')
      }
    } catch (error) {
      console.error('获取通知列表出错:', error)
      throw error
    }
  },

  // 标记通知为已读
  async markAsRead(notificationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/read/${notificationId}`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '标记通知已读失败')
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || '标记通知已读失败')
      }
    } catch (error) {
      console.error('标记通知已读出错:', error)
      throw error
    }
  },

  // 删除通知（完全删除通知）
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/delete/${notificationId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '删除通知失败')
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || '删除通知失败')
      }
    } catch (error) {
      console.error('删除通知出错:', error)
      throw error
    }
  },

  // 删除用户通知（仅删除当前用户的通知状态，不删除通知本身）
  async deleteUserNotification(notificationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/delete-user/${notificationId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '删除通知失败')
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || '删除通知失败')
      }
    } catch (error) {
      console.error('删除用户通知出错:', error)
      throw error
    }
  },

  // 获取用户详情
  async getUserDetail(email: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/byEmail?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取用户详情失败')
      }

      const data = await response.json()

      if (data.code === 200 && data.data) {
        return data.data
      } else {
        throw new Error(data.message || '获取用户详情失败')
      }
    } catch (error) {
      console.error('获取用户详情出错:', error)
      throw error
    }
  },

  // 标记所有通知为已读
  async markAllAsRead(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notification/read-all`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '标记所有通知为已读失败')
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || '标记所有通知为已读失败')
      }
    } catch (error) {
      console.error('标记所有通知为已读出错:', error)
      throw error
    }
  },
}
