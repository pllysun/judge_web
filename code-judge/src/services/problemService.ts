// 题目和测试集相关API服务
import { getAuthHeader } from './api'

// 基础URL配置
const API_BASE_URL = 'http://pllysun.top:7500/api'

// 题目相关API
export const problemApi = {
  // 获取题目列表
  async getProblemList(params = {}) {
    try {
      // 构建查询参数
      const { page = 0, size = 10, searchQuery = '', difficultyFilter = '', tagFilter = [] } = params;
      // 将page从0开始转换为pageNum从1开始
      const pageNum = page + 1;
      
      // 构建请求体，符合ProblemQueryDTO结构
      const requestBody = {
        pageNum: pageNum,
        pageSize: size,
        keyword: searchQuery || undefined,
        difficulty: difficultyFilter || undefined,
        tags: Array.isArray(tagFilter) ? tagFilter : []
      };
      
      const response = await fetch(`${API_BASE_URL}/problem/page`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取题目列表失败')
      }

      return await response.json()
    } catch (error) {
      console.error('获取题目列表出错:', error)
      throw error
    }
  },

  // 创建测试集
  async createTestGroup(data: {
    code: string
    language: string
    testCases: Array<{ input: string }>
  }) {
    try {
      const testGroup = {
        code: data.code,
        language: data.language,
        testCases: data.testCases.map(item => ({ input: item.input }))
      }

      console.log('发送测试集请求到:', `${API_BASE_URL}/test-groups`)
      console.log('请求头:', {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      })
      console.log('请求体:', JSON.stringify(testGroup))

      const response = await fetch(`${API_BASE_URL}/test-groups`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testGroup)
      })

      console.log('API响应状态:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API错误响应:', errorData)
        throw new Error(errorData.message || '创建测试集失败')
      }

      const responseData = await response.json()
      console.log('API成功响应:', responseData)
      return responseData
    } catch (error) {
      console.error('创建测试集出错:', error)
      throw error
    }
  },

  // 创建题目
  async createProblem(data: {
    title: string
    difficulty: number
    tags: string[]
    content: string
    testGroupId: string
  }) {
    try {
      const problem = {
        title: data.title,
        difficulty: data.difficulty,
        tags: data.tags,
        content: data.content,
        testGroupId: data.testGroupId
      }

      console.log('发送创建题目请求到:', `${API_BASE_URL}/problem`)
      console.log('请求头:', {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      })
      console.log('请求体:', JSON.stringify(problem))

      const response = await fetch(`${API_BASE_URL}/problem`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(problem)
      })

      console.log('API响应状态:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API错误响应:', errorData)
        throw new Error(errorData.message || '创建题目失败')
      }

      const responseData = await response.json()
      console.log('API成功响应:', responseData)
      return responseData
    } catch (error) {
      console.error('创建题目出错:', error)
      throw error
    }
  },

  // 获取所有标签
  async getAllTags() {
    try {
      const response = await fetch(`${API_BASE_URL}/problem/tags`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取标签列表失败')
      }

      return await response.json()
    } catch (error) {
      console.error('获取标签列表出错:', error)
      throw error
    }
  }
}
