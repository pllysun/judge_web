// 代码运行服务
import { getAuthHeader } from './api'
import { API_BASE_URL } from '../config/api.config.js'

// 测试用例结果接口
export interface TestCaseResult {
  id: number
  status?: string
  time: number
  timeInMs: number
  memory: number
  memoryInMB: number
  runTime: number
  stdout: string
  timeInMsWithUnit: string
  memoryInMBWithUnit: string
}

// 代码运行结果接口
export interface CodeRunResult {
  id: number
  name: string
  description: string
  testCaseResults: TestCaseResult[]
  totalCount: number
  passedCount: number
  totalTime: number
  avgTime: number
  totalMemory: number
  avgMemory: number
  totalRunTime: number
  avgRunTime: number
  totalTimeInMs: number
  avgTimeInMs: number
  totalMemoryInMB: number
  avgMemoryInMB: number
  compileError: string | null
  allPassed: boolean
  totalTimeInMsWithUnit: string
  avgTimeInMsWithUnit: string
  totalMemoryInMBWithUnit: string
  avgMemoryInMBWithUnit: string
  apiMessage?: string // 添加API返回的message字段
}

// 代码运行服务
export const codeRunService = {
  /**
   * 运行代码
   * @param code 代码内容
   * @param language 编程语言
   * @param input 测试用例输入
   * @returns 运行结果
   */
  async runCode(code: any, language: string, input: string): Promise<CodeRunResult> {
    try {
      // 处理响应式对象，提取实际代码值
      const codeValue =
        typeof code === 'object' && code !== null && '_value' in code ? code._value : code

      // 准备请求数据
      const requestData = {
        code: codeValue,
        language,
        input,
      }

      // 调用运行代码API
      const response = await fetch(`${API_BASE_URL}/code/run`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
          Accept: '*/*',
          Connection: 'keep-alive',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.code === 200 && data.data) {
        return data.data as CodeRunResult
      } else {
        // 处理非200状态码的情况，如编译错误、时间超限、内存超限等
        if (data.data) {
          // 如果有data字段，返回data作为结果，但保留message信息
          const result = data.data as CodeRunResult
          // 添加API返回的message到结果中，方便前端显示
          if (data.message) {
            result.apiMessage = data.message
          }
          return result
        } else {
          throw new Error(data.message || '运行失败')
        }
      }
    } catch (error) {
      console.error('运行代码出错:', error)
      throw error
    }
  },

  /**
   * 运行多个测试用例
   * @param code 代码内容
   * @param language 编程语言
   * @param testCases 测试用例数组，每个元素包含input和expectedOutput
   * @returns 所有测试用例的运行结果
   */
  async runMultipleTestCases(
    code: string,
    language: string,
    testCases: Array<{ input: string; expectedOutput: string }>,
  ): Promise<Array<{ result: CodeRunResult; expectedOutput: string; passed: boolean }>> {
    const results = []

    // 依次运行每个测试用例
    for (const testCase of testCases) {
      try {
        const result = await this.runCode(code, language, testCase.input)

        // 判断是否通过（输出与预期输出匹配）
        let passed = false

        // 检查是否有编译错误
        if (result.compileError) {
          passed = false
        }
        // 检查是否有测试用例结果
        else if (result.testCaseResults && result.testCaseResults.length > 0) {
          const testResult = result.testCaseResults[0]

          // 检查状态
          if (testResult.status && testResult.status !== 'Accepted') {
            passed = false
          }
          // 检查输出是否与预期匹配
          else {
            const actualOutput = testResult.stdout?.trim() || ''
            const expectedOutput = testCase.expectedOutput?.trim() || ''
            passed = actualOutput === expectedOutput
          }
        }

        results.push({
          result,
          expectedOutput: testCase.expectedOutput,
          passed,
        })
      } catch (error) {
        // 处理运行错误
        console.error('运行测试用例出错:', error)
        results.push({
          result: {
            id: 0,
            name: '代码运行',
            description: '单次代码运行',
            testCaseResults: [
              {
                id: 0,
                status: 'Error',
                time: 0,
                timeInMs: 0,
                memory: 0,
                memoryInMB: 0,
                runTime: 0,
                stdout: `运行错误: ${error.message}`,
                timeInMsWithUnit: '0.00 ms',
                memoryInMBWithUnit: '0.00 MB',
              },
            ],
            totalCount: 1,
            passedCount: 0,
            totalTime: 0,
            avgTime: 0,
            totalMemory: 0,
            avgMemory: 0,
            totalRunTime: 0,
            avgRunTime: 0,
            totalTimeInMs: 0,
            avgTimeInMs: 0,
            totalMemoryInMB: 0,
            avgMemoryInMB: 0,
            compileError: null,
            allPassed: false,
            totalTimeInMsWithUnit: '0.00 ms',
            avgTimeInMsWithUnit: '0.00 ms',
            totalMemoryInMBWithUnit: '0.00 MB',
            avgMemoryInMBWithUnit: '0.00 MB',
          },
          expectedOutput: testCase.expectedOutput,
          passed: false,
        })
      }
    }

    return results
  },
}
