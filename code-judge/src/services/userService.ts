// 用户管理服务
import { getAuthHeader } from './api'

// 定义API基础URL
const API_BASE_URL = 'http://pllysun.top:7500/api'

// 用户类型定义
export interface User {
  id: number
  username: string
  email: string
  registerTime: string
  status: 'active' | 'banned'
  role: string
  roleCode: string
  avatar: string
}

// 分页参数类型
export interface Pagination {
  page: number
  size: number
}

// 用户管理服务
export const userService = {
  // 获取用户列表
  async getUserList(pagination: Pagination, searchKeyword?: string): Promise<{ users: User[], total: number }> {
    try {
      let url = `${API_BASE_URL}/user/list?page=${pagination.page}&size=${pagination.size}`

      if (searchKeyword) {
        url += `&email=${encodeURIComponent(searchKeyword)}`
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
        const users = data.data.records.map((user) => ({
          id: user.userId,
          username: user.nickname || user.username || user.email,
          email: user.email,
          registerTime: user.createdAt,
          status: user.ban ? 'banned' : 'active',
          role: user.role,
          roleCode: user.roleCode,
          avatar: user.avatar,
        }))
        return { users, total: data.data.total }
      } else {
        throw new Error(data.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表出错:', error)
      throw error
    }
  },

  // 获取用户详情
  async getUserDetail(email: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/byEmail?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('获取用户详情失败')
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

  // 更新用户角色
  async updateUserRole(email: string, roleLevel: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/updateRole`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          roleLevel: roleLevel,
        }),
      })

      if (!response.ok) {
        throw new Error('修改用户权限失败')
      }

      const data = await response.json()

      if (data.code === 200) {
        return data
      } else {
        throw new Error(data.message || '修改用户权限失败')
      }
    } catch (error) {
      console.error('修改用户权限出错:', error)
      throw error
    }
  },

  // 重置用户密码
  async resetPassword(email: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/resetPassword/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('重置密码失败')
      }

      const data = await response.json()

      if (data.code === 200) {
        return data
      } else {
        throw new Error(data.message || '重置密码失败')
      }
    } catch (error) {
      console.error('重置密码出错:', error)
      throw error
    }
  },

  // 封禁/解封用户
  async toggleUserStatus(email: string, ban: boolean): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/ban`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          ban: ban,
        }),
      })

      if (!response.ok) {
        throw new Error(`${ban ? '封禁' : '解封'}用户失败`)
      }

      const data = await response.json()

      if (data.code === 200) {
        return data
      } else {
        throw new Error(data.message || `${ban ? '封禁' : '解封'}用户失败`)
      }
    } catch (error) {
      console.error('操作用户状态出错:', error)
      throw error
    }
  }
}
