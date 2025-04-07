import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义用户信息类型
interface UserInfo {
  email: string
  loginId?: string
  avatar?: string
  username?: string
  nickname?: string
  role?: string
  roles?: string[]
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserInfo | null>(null)

  // 如果本地存储有用户信息，则恢复
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('解析用户信息失败', e)
      // 清除无效的用户信息
      localStorage.removeItem('user')
    }
  }

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 方法
  function login(userData: { email: string }, userToken: string) {
    user.value = userData
    token.value = userToken

    // 保存到本地存储
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    token.value = null

    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 更新用户信息
  function updateUserInfo(userData: UserInfo) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      // 更新本地存储
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    updateUserInfo,
  }
})
