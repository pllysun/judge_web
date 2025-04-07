import { reactive, ref } from 'vue'
import { getAuthHeader } from '../services/api'
import { codeRunService } from '../services/codeRunService'
import { API_BASE_URL } from '../config/api.config.js'

// 定义类型以解决TypeScript错误
interface TestCase {
  input: string;
  expectedOutput: string;
}

interface TestCaseResult {
  id: string | null;
  status: string;
  time: number;
  timeInMs: number;
  memory: number;
  memoryInMB: number;
  runTime: number;
  input: string;
  expectedOutput: string;
  stdout: string;
  errorMessage?: string;
  timeInMsWithUnit: string;
  memoryInMBWithUnit: string;
}

interface CodeRunResult {
  id?: string;
  name?: string;
  description?: string;
  testCaseResults?: TestCaseResult[];
  totalCount?: number;
  passedCount?: number;
  totalTime?: number;
  avgTime?: number;
  totalMemory?: number;
  avgMemory?: number;
  totalRunTime?: number;
  avgRunTime?: number;
  totalTimeInMs?: number;
  avgTimeInMs?: number;
  totalMemoryInMB?: number;
  avgMemoryInMB?: number;
  compileError?: string | null;
  allPassed?: boolean;
  firstFailedTestCase?: TestCaseResult | null;
  apiMessage?: string;
  passRatio?: string;
  totalTimeInMsWithUnit?: string;
  avgTimeInMsWithUnit?: string;
  totalMemoryInMBWithUnit?: string;
  avgMemoryInMBWithUnit?: string;
}

interface TestCaseResultWithExpected {
  result: CodeRunResult;
  expectedOutput: string;
  passed: boolean;
}

/**
 * 代码执行和提交逻辑
 */
export function useExecution() {
  // 执行结果
  const executionResult = reactive({
    status: '', // success, error, running
    message: '',
    output: '',
    time: '0ms',
    memory: '0MB',
  })

  // 测试用例结果数组
  const testCaseResults = ref<TestCaseResultWithExpected[]>([])

  // 是否正在运行代码
  const isRunning = ref(false)

  // 整体运行结果
  const overallResult = ref({
    status: '',
    allPassed: false,
    message: '',
  })

  // 运行单个测试用例
  const runSingleTestCase = async (
    code: string,
    language: string,
    testCase: string,
    expectedOutput: string
  ) => {
    executionResult.status = 'running'
    executionResult.message = '正在执行...'

    try {
      const result = await codeRunService.runCode(code, language, testCase)

      // 更新执行结果
      if (result.testCaseResults && result.testCaseResults.length > 0) {
        const testResult = result.testCaseResults[0]

        // 检查是否有编译错误
        if (result.compileError) {
          executionResult.status = 'error'
          executionResult.message = '编译错误'
          executionResult.output = result.compileError
          executionResult.time = '0ms'
          executionResult.memory = '0MB'
        }
        // 检查状态
        else if (testResult.status && testResult.status !== 'Accepted') {
          executionResult.status = 'error'

          // 根据API返回的message和状态码设置错误信息
          if (result.apiMessage) {
            // 使用API返回的message
            executionResult.message = result.apiMessage
          } else {
            // 使用默认错误信息
            executionResult.message =
              testResult.status === 'Time Limit Exceeded'
                ? '执行超时'
                : testResult.status === 'Memory Limit Exceeded'
                  ? '内存超限'
                  : testResult.status === 'Compile Error'
                    ? '编译错误'
                    : testResult.status === 'Wrong Answer'
                      ? '答案错误'
                      : `执行错误: ${testResult.status}`
          }

          executionResult.output = testResult.stdout || ''
          executionResult.time = testResult.timeInMsWithUnit || '0ms'
          executionResult.memory = testResult.memoryInMBWithUnit || '0MB'
        }
        // 检查输出是否与预期匹配
        else {
          const actualOutput = testResult.stdout?.trim() || ''
          const expectedOutputTrimmed = expectedOutput?.trim() || ''

          if (actualOutput === expectedOutputTrimmed) {
            executionResult.status = 'success'
            executionResult.message = '执行成功'
          } else {
            executionResult.status = 'error'
            executionResult.message = '输出与预期不符'
          }

          executionResult.output = testResult.stdout || ''
          executionResult.time = testResult.timeInMsWithUnit || '0ms'
          executionResult.memory = testResult.memoryInMBWithUnit || '0MB'
        }
      } else {
        executionResult.status = 'error'
        executionResult.message = '未获取到执行结果'
        executionResult.output = ''
        executionResult.time = '0ms'
        executionResult.memory = '0MB'
      }
    } catch (error: unknown) {
      console.error('运行代码出错:', error)
      const errorMessage = error instanceof Error ? error.message : '运行代码失败'
      executionResult.status = 'error'
      executionResult.message = errorMessage
      executionResult.output = errorMessage
      executionResult.time = '0ms'
      executionResult.memory = '0MB'
    }
  }

  // 运行所有测试用例
  const runAllTestCases = async (
    code: string,
    language: string,
    testCasesData: TestCase[]
  ) => {
    if (!testCasesData || testCasesData.length === 0) {
      console.error('没有测试用例可运行')
      return
    }

    // 重置状态
    isRunning.value = true
    testCaseResults.value = []
    overallResult.value = {
      status: 'running',
      allPassed: false,
      message: '正在运行测试用例...',
    }

    try {
      // 准备测试用例数据
      const testCases = testCasesData.map((tc: TestCase) => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
      }))

      // 运行所有测试用例
      const results = await codeRunService.runMultipleTestCases(code, language, testCases)

      // 更新测试用例结果
      testCaseResults.value = results

      // 检查是否全部通过
      const allPassed = results.every((r) => r.passed)

      // 检查是否有编译错误
      const hasCompileError = results.some(
        (r) => r.result.compileError || (r.result.testCaseResults &&
              r.result.testCaseResults.some(tc => tc.status === 'Compile Error'))
      )

      // 更新整体结果
      overallResult.value = {
        status: 'done',
        allPassed,
        message: hasCompileError
          ? '编译错误'
          : allPassed
            ? '所有测试用例通过'
            : '部分测试用例未通过',
      }

      // 如果有选中的测试用例，更新单个执行结果
      if (results.length > 0) {
        const firstResult = results[0]
        if (firstResult.result.testCaseResults && firstResult.result.testCaseResults.length > 0) {
          const testResult = firstResult.result.testCaseResults[0]

          // 如果有编译错误，优先显示编译错误
          if (firstResult.result.compileError) {
            executionResult.status = 'error'
            executionResult.message = '编译错误'
            executionResult.output = firstResult.result.compileError || ''
            executionResult.time = '0ms'
            executionResult.memory = '0MB'
          } else {
            executionResult.status = firstResult.passed ? 'success' : 'error'
            executionResult.message = firstResult.passed ? '执行成功' : '执行失败'
            executionResult.output = testResult.stdout || ''
            executionResult.time = testResult.timeInMsWithUnit || '0ms'
            executionResult.memory = testResult.memoryInMBWithUnit || '0MB'
          }
        }
      }
    } catch (error: unknown) {
      console.error('运行测试用例出错:', error)
      const errorMessage = error instanceof Error ? error.message : '运行测试用例失败'
      overallResult.value = {
        status: 'error',
        allPassed: false,
        message: errorMessage,
      }
    } finally {
      isRunning.value = false
    }
  }

  // 运行代码（兼容旧接口）
  const runCode = async (
    code: string,
    language: string,
    testCase?: string,
    expectedOutput?: string
  ) => {
    // 如果只有一个测试用例，直接运行
    if (testCase && expectedOutput) {
      await runSingleTestCase(code, language, testCase, expectedOutput)
    }
  }

  // 提交代码
  const submitCode = async (
    code: string | { value: string },
    language: string | { value: string }
  ) => {
    try {
      // 从URL中获取题目ID
      const pathParts = window.location.pathname.split('/')
      // 路径格式为 /problems/:id/solve，所以题目ID是倒数第二个部分
      const problemId = pathParts[pathParts.length - 2]

      if (!problemId) {
        throw new Error('未找到题目ID')
      }

      console.log("准备提交代码，题目ID:", problemId)
      console.log("当前URL路径:", window.location.pathname)
      console.log("URL路径拆分:", pathParts)

      // 准备请求数据
      const requestData = {
        problemId: problemId,
        code: typeof code === 'object' && 'value' in code ? code.value : code,
        language: typeof language === 'object' && 'value' in language ? language.value : language,
      }

      console.log("提交数据准备完毕:", requestData)

      // 使用JSON.parse(JSON.stringify())处理可能的循环引用
      const safeRequestData = JSON.parse(JSON.stringify(requestData))

      // 调用提交代码API
      console.log("开始调用提交API")
      const response = await fetch(`${API_BASE_URL}/code/submit`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: JSON.stringify(safeRequestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '提交代码失败')
      }

      const data = await response.json()
      console.log("API返回数据:", data)

      return data;
    } catch (error: unknown) {
      console.error('提交代码出错:', error);
      throw error;
    }
  }

  return {
    executionResult,
    testCaseResults,
    isRunning,
    overallResult,
    runCode,
    runAllTestCases,
    submitCode,
  }
}
