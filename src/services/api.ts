// API服务

// 导入基础URL配置
import { API_BASE_URL } from '../config/api.config.js'

// 获取认证头部
export function getAuthHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 用户相关API
export const userApi = {
  // 获取用户信息
  async getUserInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/userInfo`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取用户信息失败')
      }

      return await response.json()
    } catch (error) {
      console.error('获取用户信息出错:', error)
      throw error
    }
  },

  // 更新用户信息
  async updateUserInfo(formData: FormData) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/updateUserInfo`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          // 不设置Content-Type，因为FormData会自动设置为multipart/form-data
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '更新用户信息失败')
      }

      return await response.json()
    } catch (error) {
      console.error('更新用户信息出错:', error)
      throw error
    }
  },
}

// 认证相关API
export const authApi = {
  // 发送验证码
  async sendVerificationCode(email: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/email/registration-code?email=${encodeURIComponent(email)}`,
        {
          method: 'POST',
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '发送验证码失败')
      }

      return await response.json()
    } catch (error) {
      console.error('发送验证码出错:', error)
      throw error
    }
  },

  // 用户注册
  async register(data: {
    email: string
    password: string
    verificationId: string
    verificationCode: string
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '注册失败')
      }

      return await response.json()
    } catch (error) {
      console.error('注册出错:', error)
      throw error
    }
  },

  // 用户登录
  async login(data: { email: string; password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '登录失败')
      }

      const responseData = await response.json()

      // 确保返回数据符合预期格式
      if (responseData.code === 200 && responseData.data) {
        return {
          token: responseData.data.tokenValue,
          tokenName: responseData.data.tokenName,
          loginId: responseData.data.loginId,
          userData: responseData.data,
        }
      } else {
        throw new Error(responseData.message || '登录失败')
      }
    } catch (error) {
      console.error('登录出错:', error)
      throw error
    }
  },

  // 用户退出登录
  async logout() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return { success: true } // 如果没有token，直接返回成功
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `Authorization=${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.warn('退出登录API返回错误:', errorData)
          // 即使API返回错误，我们也认为前端已成功登出
          return { success: true, warning: errorData.message || '服务器处理登出请求时出错' }
        }

        return { success: true }
      } catch (error) {
        console.warn('退出登录API调用异常:', error)
        // 即使API调用异常（如Redis错误），我们也认为前端已成功登出
        return { success: true, warning: error.message || '服务器处理登出请求时出错' }
      }
    } catch (error) {
      console.error('退出登录出错:', error)
      // 返回成功但带有警告，而不是抛出异常
      return { success: true, warning: '无法连接到服务器，但您已在本地成功登出' }
    }
  },

  // 发送密码修改验证码
  async sendPasswordResetCode(oldPassword: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/email/password-reset-code`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '发送验证码失败')
      }

      return await response.json()
    } catch (error) {
      console.error('发送密码修改验证码出错:', error)
      throw error
    }
  },

  // 修改密码
  async changePassword(data: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
    verificationId: string
    verificationCode: string
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/changePassword`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '修改密码失败')
      }

      return await response.json()
    } catch (error) {
      console.error('修改密码出错:', error)
      throw error
    }
  },
}
