import { ref, watch } from 'vue'
import { getAuthHeader } from '../services/api'
import { API_BASE_URL } from '../config/api.config.js'

/**
 * 测试用例相关逻辑
 */
export function useTestCase() {
  // 测试用例
  const testCase = ref('')
  const expectedOutput = ref('')
  const testCases = ref([])
  const isLoadingTestCases = ref(false)
  const testCaseError = ref('')
  const selectedTestCaseIndex = ref(0) // 当前选中的测试用例索引

  // 获取题目测试用例
  const fetchTestCases = async (problemId) => {
    if (!problemId) return

    isLoadingTestCases.value = true
    testCaseError.value = ''

    try {
      const response = await fetch(`${API_BASE_URL}/problem/${problemId}/test-cases`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取测试用例失败')
      }

      const data = await response.json()

      if (data.code === 200 && data.data) {
        testCases.value = data.data

        // 如果有测试用例，设置第一个为当前测试用例
        if (testCases.value.length > 0) {
          testCase.value = testCases.value[0].input || ''
          expectedOutput.value = testCases.value[0].expectedOutput || ''
        }
      } else {
        testCaseError.value = data.message || '获取测试用例失败'
      }
    } catch (error) {
      console.error('获取测试用例出错:', error)
      testCaseError.value = error.message || '获取测试用例失败'
    } finally {
      isLoadingTestCases.value = false
    }
  }

  // 设置测试用例选择变化的监听
  const setupTestCaseWatch = () => {
    watch(
      () => selectedTestCaseIndex.value,
      (newIndex) => {
        if (testCases.value.length > 0 && newIndex >= 0 && newIndex < testCases.value.length) {
          testCase.value = testCases.value[newIndex].input || ''
          expectedOutput.value = testCases.value[newIndex].expectedOutput || ''
        }
      },
    )
  }

  return {
    testCase,
    expectedOutput,
    testCases,
    isLoadingTestCases,
    testCaseError,
    selectedTestCaseIndex,
    fetchTestCases,
    setupTestCaseWatch,
  }
}
