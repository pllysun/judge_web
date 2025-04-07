<template>
  <div class="submission-detail-container p-4">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="text-center p-8 text-red-500">
      <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <!-- 返回编辑按钮 -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <router-link
          :to="`/problems/${submission.problemId}/solve`"
          @click="handleReturnToEdit"
          class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <i class="fas fa-arrow-left mr-1"></i>
          返回编辑
        </router-link>
      </div>

      <!-- 提交信息头部 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold text-gray-800">提交详情</h1>
          <div class="flex items-center space-x-4">
            <span :class="getStatusClass">
              {{ getStatusLabel(submission.status) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="flex flex-col">
            <span class="text-gray-500">题目</span>
            <router-link
              :to="`/problems/${submission.problemId}`"
              class="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {{
                submission.problemNumber
                  ? `${submission.problemNumber}. ${submission.problemTitle}`
                  : submission.problemTitle || '未知题目'
              }}
            </router-link>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-500">语言</span>
            <div class="flex items-center">
              <i :class="[getLanguageIcon(submission.language), 'mr-2 text-indigo-500']"></i>
              <span>{{ getLanguageLabel(submission.language) }}</span>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-500">提交时间</span>
            <div class="flex items-center">
              <span>{{ formatDate(submission.submissionTime || submission.submitTime) }}</span>
              <span v-if="submission.passRatio" class="text-sm text-gray-600 ml-3">通过率: {{ submission.passRatio }}</span>
            </div>
          </div>
        </div>
      </div>



      <!-- 错误信息 -->
      <div v-if="submission.compileError" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
          编译错误
        </h2>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <pre class="whitespace-pre-wrap text-red-800 overflow-x-auto">{{
            submission.compileError
          }}</pre>
        </div>
      </div>

      <!-- 首个失败测试用例 -->
      <div
        v-if="
          !submission.compileError &&
          !submission.allPassed &&
          (submission.firstFailedTestCase || submission.firstInput)
        "
        class="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h2 class="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
          错误信息
        </h2>
        <div class="space-y-4">
          <!-- 输入 -->
          <div>
            <div class="text-sm font-medium text-gray-700 mb-1">输入</div>
            <div class="bg-gray-50 rounded-md p-3 whitespace-pre-wrap text-sm text-gray-900">
              {{
                submission.firstInput ||
                (submission.firstFailedTestCase
                  ? submission.firstFailedTestCase.input
                  : '无输入数据')
              }}
            </div>
          </div>

          <!-- 预期输出 -->
          <div>
            <div class="text-sm font-medium text-gray-700 mb-1">预期输出</div>
            <div class="bg-gray-50 rounded-md p-3 whitespace-pre-wrap text-sm text-gray-900">
              {{
                submission.firstExpectedOutput ||
                (submission.firstFailedTestCase
                  ? submission.firstFailedTestCase.expectedOutput
                  : '无预期输出')
              }}
            </div>
          </div>

          <!-- 实际输出 -->
          <div>
            <div class="text-sm font-medium text-gray-700 mb-1">实际输出</div>
            <div class="bg-gray-50 rounded-md p-3 whitespace-pre-wrap text-sm text-gray-900">
              {{
                submission.firstOutput ||
                (submission.firstFailedTestCase
                  ? submission.firstFailedTestCase.stdout
                  : '无输出数据')
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- 执行结果统计 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">执行结果统计</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="text-gray-500 text-sm">测试用例</div>
            <div class="font-bold text-xl">
              {{ submission.passedCount }}/{{ submission.totalCount }}
            </div>
            <div class="text-sm">
              通过率: {{ Math.round((submission.passedCount / (submission.totalCount || 1)) * 100) }}%
            </div>
          </div>

          <div class="stat-card">
            <div class="text-gray-500 text-sm">平均执行时间</div>
            <div class="font-bold text-xl">
              {{ formatExecutionTime(submission.executionTime, submission.totalCount) }}
            </div>
            <div class="text-sm">
              总时间: {{ formatExecutionTime(submission.executionTime) }}
            </div>
          </div>

          <div class="stat-card">
            <div class="text-gray-500 text-sm">平均内存使用</div>
            <div class="font-bold text-xl">
              {{ formatMemoryUsage(submission.memoryUsed, submission.totalCount) }}
            </div>
            <div class="text-sm">
              总内存: {{ formatMemoryUsage(submission.memoryUsed) }}
            </div>
          </div>

          <div class="stat-card">
            <div class="text-gray-500 text-sm">平均运行时间</div>
            <div class="font-bold text-xl">0.00 ms</div>
            <div class="text-sm">总运行时间: 0.00 ms</div>
          </div>
        </div>
      </div>
      <!-- 提交的代码 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">提交的代码</h2>
        <div class="code-container bg-gray-50 p-4 rounded-md overflow-x-auto">
          <pre><code v-html="highlightCode(submission.code || '', submission.language || 'plaintext')"></code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuthHeader } from '../services/api'
import { API_BASE_URL } from '../config/api.config.js'
import PerformanceChart from '../components/submission/PerformanceChart.vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 定义类型
interface TestCaseResult {
  id: string | null
  status: string
  time: number
  timeInMs: number
  memory: number
  memoryInMB: number
  runTime: number
  input: string
  expectedOutput?: string
  stdout: string
  errorMessage?: string
  timeInMsWithUnit: string
  memoryInMBWithUnit: string
}

interface SubmissionData {
  id: string
  userId?: string
  problemId: string
  problemNumber?: string
  problemTitle: string
  code: string
  language: string
  submitTime: string
  submissionTime?: string // API返回的字段名
  status: string
  allPassed: boolean
  passedCount: number
  totalCount: number
  totalTime: number | null
  avgTime: number | null
  totalMemory: number | null
  avgMemory: number | null
  totalRunTime: number | null
  avgRunTime: number | null
  totalTimeInMs: number | null
  avgTimeInMs: number | null
  totalMemoryInMB: number | null
  avgMemoryInMB: number | null
  executionTime?: number | null // API返回的字段名
  memoryUsed?: number | null // API返回的字段名
  compileError: string | null
  testCaseResults: TestCaseResult[]
  firstFailedTestCase: TestCaseResult | null
  passRatio: string
  message: string
  totalTimeInMsWithUnit: string
  avgTimeInMsWithUnit: string
  totalMemoryInMBWithUnit: string
  avgMemoryInMBWithUnit: string
  // API返回的首个失败测试用例字段
  firstInput?: string
  firstExpectedOutput?: string
  firstOutput?: string
}

// 路由参数
const route = useRoute()
const router = useRouter()

// 获取提交ID或题目ID（根据路由路径判断）
const isSubmitRoute = route.path.includes('/problems/') && route.path.includes('/submit')
const submissionId = ref(isSubmitRoute ? '' : (route.params.id as string))
const problemId = isSubmitRoute ? (route.params.id as string) : ''

// 状态
const loading = ref(true)
const error = ref('')
const submission = reactive<SubmissionData>({
  id: '',
  problemId: '',
  problemTitle: '',
  code: '',
  language: '',
  submitTime: '',
  status: '',
  allPassed: false,
  passedCount: 0,
  totalCount: 0,
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
  testCaseResults: [],
  firstFailedTestCase: null,
  passRatio: '',
  message: '',
  totalTimeInMsWithUnit: '',
  avgTimeInMsWithUnit: '',
  totalMemoryInMBWithUnit: '',
  avgMemoryInMBWithUnit: '',
})

// 测试用例展开状态
const expandedTestCases = ref<Record<number, boolean>>({})

// 切换测试用例展开/折叠
const toggleTestCase = (index: number) => {
  expandedTestCases.value[index] = !expandedTestCases.value[index]
}

// 获取语言对应的图标
const getLanguageIcon = (language: string): string => {
  const iconMap: Record<string, string> = {
    javascript: 'fab fa-js-square',
    python: 'fab fa-python',
    java: 'fab fa-java',
    cpp: 'fas fa-file-code',
    c: 'fas fa-code',
  }

  return iconMap[language] || 'fas fa-code'
}

// 获取语言对应的标签名称
const getLanguageLabel = (language: string): string => {
  const labelMap: Record<string, string> = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
  }

  return labelMap[language] || language
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 代码高亮函数
const highlightCode = (code: string, language: string) => {
  try {
    return hljs.highlight(code, { language }).value
  } catch (e) {
    return code
  }
}

// Mock数据生成函数
const generateMockData = () => {
  const mockTestCases = Array.from({ length: 10 }, (_, index) => ({
    id: null,
    status: index < 8 ? 'Accepted' : 'Wrong Answer',
    time: Math.random() * 100,
    timeInMs: Math.random() * 2,
    memory: Math.random() * 1024 * 1024,
    memoryInMB: Math.random() * 2,
    runTime: Math.random() * 1000000,
    input: `测试用例输入 ${index + 1}`,
    expectedOutput: `期望输出 ${index + 1}`,
    stdout: index < 8 ? `期望输出 ${index + 1}` : `错误输出 ${index + 1}`,
    errorMessage: index < 8 ? undefined : '输出结果与预期不符',
    timeInMsWithUnit: `${(Math.random() * 2).toFixed(2)} ms`,
    memoryInMBWithUnit: `${(Math.random() * 2).toFixed(2)} MB`,
  }))

  const mockCode = `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`

  return {
    id: '67deee15c468d804750c73b9',
    name: '题目测试集',
    description: '题目 两数之和Ⅰ 的测试集',
    code: mockCode,
    language: 'cpp',
    submitTime: new Date().toISOString(),
    problemId: route.params.id as string,
    problemTitle: '两数之和Ⅰ',
    testCaseResults: mockTestCases,
    totalCount: 10,
    passedCount: 8,
    totalTime: 1000000,
    avgTime: 100000,
    totalMemory: 1024 * 1024 * 10,
    avgMemory: 1024 * 1024,
    totalRunTime: 10000000,
    avgRunTime: 1000000,
    totalTimeInMs: 15.781,
    avgTimeInMs: 1.5781,
    totalMemoryInMB: 3.99609375,
    avgMemoryInMB: 0.3996086120605469,
    compileError: null,
    allPassed: false,
    firstFailedTestCase: mockTestCases[8],
    passRatio: '8/10',
    avgMemoryInMBWithUnit: '0.40 MB',
    avgTimeInMsWithUnit: '1.58 ms',
    totalMemoryInMBWithUnit: '4.00 MB',
    totalTimeInMsWithUnit: '15.78 ms',
    status: 'Wrong Answer',
  }
}

// 组件挂载时获取提交详情
onMounted(async () => {
  console.log('SubmissionDetailView 挂载，路由路径:', route.path)
  console.log('提交ID:', submissionId.value)

  // 如果有提交ID就直接获取提交详情
  if (submissionId.value) {
    await fetchSubmissionDetail()
  }

  // 检查是否有本地存储的提交结果
  const lastSubmissionResult = localStorage.getItem('lastSubmissionResult')
  if (lastSubmissionResult) {
    try {
      const result = JSON.parse(lastSubmissionResult)
      // 更新提交详情数据
      Object.assign(submission, result)

      // 处理本地存储的数据
      if (!submission.allPassed && submission.status === 'Accepted') {
        submission.allPassed = true
      }

      // 添加mock数据用于图表显示
      if (!submission.testCaseResults || submission.testCaseResults.length === 0) {
        const mockData = generateMockData()
        submission.testCaseResults = mockData.testCaseResults
        submission.totalTimeInMs = mockData.totalTimeInMs
        submission.avgTimeInMs = mockData.avgTimeInMs
        submission.totalMemoryInMB = mockData.totalMemoryInMB
        submission.avgMemoryInMB = mockData.avgMemoryInMB
        submission.avgMemoryInMBWithUnit = mockData.avgMemoryInMBWithUnit
        submission.avgTimeInMsWithUnit = mockData.avgTimeInMsWithUnit
      }
      // 清除本地存储的结果
      localStorage.removeItem('lastSubmissionResult')
      loading.value = false
      return
    } catch (error) {
      console.error('解析本地存储的提交结果失败:', error)
      localStorage.removeItem('lastSubmissionResult')
    }
  }
})

// 获取提交详情的函数
const fetchSubmissionDetail = async () => {
  if (!submissionId.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/code/submission/${submissionId.value}`, {
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error('获取提交详情失败')
    }

    const data = await response.json()
    if (data.code === 200) {
      // 更新提交详情数据
      Object.assign(submission, data.data)
      console.log('获取到提交详情:', data.data)
    } else {
      throw new Error(data.message || '获取提交详情失败')
    }
  } catch (err) {
    console.error('获取提交详情失败:', err)
    error.value = err instanceof Error ? err.message : '获取提交详情失败'
  } finally {
    loading.value = false
  }
}

// 处理返回编辑的点击事件
const handleReturnToEdit = () => {
  // 保存当前代码到 localStorage
  const codeToEdit = {
    code: submission.code,
    language: submission.language,
    problemId: submission.problemId,
  }
  localStorage.setItem('codeToEdit', JSON.stringify(codeToEdit))
}

// 获取状态对应的中文标签
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    Accepted: '通过',
    'Wrong Answer': '答案错误',
    'Time Limit Exceeded': '超时',
    'Memory Limit Exceeded': '内存超限',
    'Runtime Error': '运行时错误',
    'Compile Error': '编译错误',
    'System Error': '系统错误',
    Pending: '等待中',
    Running: '运行中',
  }
  return statusMap[status] || status
}

// 获取状态对应的样式类
const getStatusClass = computed(() => {
  return {
    'bg-green-100 text-green-800': submission.status === 'Accepted',
    'bg-red-100 text-red-800': submission.status !== 'Accepted',
    'px-3 py-1 rounded-full text-sm font-medium': true
  }
})

// 判断是否是错误状态
const isErrorState = computed(() => {
  const errorStates = [
    'Wrong Answer',
    'Time Limit Exceeded',
    'Memory Limit Exceeded',
    'Runtime Error',
    'System Error',
  ]
  return errorStates.includes(submission.status)
})

// 格式化执行时间
const formatExecutionTime = (time: number | null | undefined, count?: number) => {
  if (!time) return '0.00 ms'
  const value = count ? time / count : time
  return `${(value / 1000000).toFixed(2)} ms`
}

// 格式化内存使用
const formatMemoryUsage = (memory: number | null | undefined, count?: number) => {
  if (!memory) return '0.00 MB'
  const value = count ? memory / count : memory
  return `${(value / 1024 / 1024).toFixed(2)} MB`
}
</script>

<style scoped>
.submission-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1.5rem;
  padding-bottom: 3rem;
}

.stat-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4f46e5;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.test-case-result {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.test-case-result:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.test-case-header {
  transition: background-color 0.3s ease;
}

.test-case-header:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.code-container {
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.code-container pre {
  margin: 0;
  padding: 1rem;
}

.code-container code {
  font-family: 'Fira Code', monospace;
  tab-size: 4;
}

/* 添加滚动条样式 */
.code-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.code-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.code-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
