import { ref } from 'vue'
import { getAuthHeader } from '../services/api'
import { API_BASE_URL } from '../config/api.config.js'

/**
 * 题目数据获取和处理逻辑
 */
export function useProblem() {
  // 题目数据
  const problem = ref({
    id: '',
    problemId: '',
    title: '',
    difficulty: '',
    difficultyLevel: null,
    difficultyLabel: '',
    acceptRate: '',
    submissionCount: '',
    tags: [],
    content: '',
    examples: [],
    hints: [],
    constraints: [],
  })

  // 加载状态
  const loading = ref(true)

  // 获取题目详情
  const fetchProblemDetail = async (problemId) => {
    try {
      loading.value = true

      if (!problemId) {
        throw new Error('未找到题目ID')
      }

      // 调用API获取题目详情
      const response = await fetch(`${API_BASE_URL}/problem/${problemId}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('获取题目详情失败')
      }

      const data = await response.json()

      // 处理API返回的数据
      if (data.data) {
        const problemData = data.data
        console.log('API返回的题目数据:', problemData)

        // 处理难度信息，确保difficultyLevel正确设置
        let difficultyLevelObj = null
        if (problemData.difficultyLevel) {
          // 如果API直接返回了difficultyLevel对象，使用它
          difficultyLevelObj = problemData.difficultyLevel
        } else if (problemData.difficulty) {
          // 如果只有difficulty值，根据值构建difficultyLevel对象
          const level = Number(problemData.difficulty)
          if (!isNaN(level) && level >= 1 && level <= 3) {
            difficultyLevelObj = {
              level: level,
              difficulty: ['', '简单', '中等', '困难'][level]
            }
          } else if (typeof problemData.difficulty === 'string') {
            // 处理字符串形式的难度
            const difficultyMap: Record<string, { level: number, difficulty: string }> = {
              '简单': { level: 1, difficulty: '简单' },
              '中等': { level: 2, difficulty: '中等' },
              '困难': { level: 3, difficulty: '困难' },
              'EASY': { level: 1, difficulty: '简单' },
              'MEDIUM': { level: 2, difficulty: '中等' },
              'HARD': { level: 3, difficulty: '困难' }
            }
            difficultyLevelObj = difficultyMap[problemData.difficulty as string] || {
              level: 0,
              difficulty: problemData.difficulty as string
            }
          }
        }

        problem.value = {
          id: problemData.id || '',
          problemId: problemData.problemId || '',
          title: problemData.title || '',
          difficulty: problemData.difficulty || '',
          difficultyLevel: difficultyLevelObj,
          difficultyLabel: getDifficultyLabel(problemData.difficulty),
          acceptRate: problemData.acceptRate || '0%',
          submissionCount: problemData.submissionCount || '0',
          tags: problemData.tags || [],
          content: problemData.content || '',
          examples: problemData.examples || [],
          hints: problemData.hints || [],
          constraints: problemData.constraints || [],
        }
      } else {
        // 如果没有data字段，则假设response本身就是数据
        problem.value = {
          id: data.id || '',
          problemId: data.problemId || '',
          title: data.title || '',
          difficulty: data.difficulty || '',
          difficultyLevel: {
            level: data.difficulty,
            difficulty: getDifficultyLabel(data.difficulty).label,
          },
          difficultyLabel: getDifficultyLabel(data.difficulty),
          acceptRate: data.acceptRate || '0%',
          submissionCount: data.submissionCount || '0',
          tags: data.tags || [],
          content: data.content || '',
          examples: data.examples || [],
          hints: data.hints || [],
          constraints: data.constraints || [],
        }
      }
    } catch (error) {
      console.error('获取题目详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 根据难度值获取难度标签
  const getDifficultyLabel = (difficulty) => {
    const difficultyMap = {
      1: { label: '简单', class: 'bg-green-100 text-green-800' },
      2: { label: '中等', class: 'bg-yellow-100 text-yellow-800' },
      3: { label: '困难', class: 'bg-red-100 text-red-800' },
    }

    return difficultyMap[difficulty] || { label: '未知', class: 'bg-gray-100 text-gray-800' }
  }

  return {
    problem,
    loading,
    fetchProblemDetail,
  }
}
