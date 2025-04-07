<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import '@/assets/css/TestCasePanel.css'

// 添加activeTab状态控制当前显示的标签页
const activeTab = ref('testcase') // 'testcase' 或 'result'

const props = defineProps({
  testCases: {
    type: Array,
    default: () => [],
  },
  isLoadingTestCases: {
    type: Boolean,
    default: false,
  },
  testCaseError: {
    type: String,
    default: '',
  },
  testCase: {
    type: String,
    default: '',
  },
  expectedOutput: {
    type: String,
    default: '',
  },
  selectedTestCaseIndex: {
    type: Number,
    default: 0,
  },
  executionResult: {
    type: Object,
    default: () => ({
      status: '',
      message: '',
      output: '',
      time: '0ms',
      memory: '0MB',
    }),
  },
  showExecutionResult: {
    type: Boolean,
    default: false,
  },
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'javascript',
  },
  // 添加测试用例结果数组
  testCaseResults: {
    type: Array,
    default: () => [],
  },
  // 添加操作模式
  operationMode: {
    type: String,
    default: 'run', // 'run' 或 'submit'
  },
  // 添加提交结果
  submissionResult: {
    type: Object,
    default: null,
  },
  // 是否正在运行
  isRunning: {
    type: Boolean,
    default: false,
  },
  // 整体结果
  overallResult: {
    type: Object,
    default: () => ({
      status: '',
      allPassed: false,
      message: '',
    }),
  },
})

const emit = defineEmits([
  'update:testCase',
  'update:expectedOutput',
  'update:selectedTestCaseIndex',
  'update:testCaseResults',
  'update:isRunning',
  'update:overallResult',
  'run',
])

const authToken = ref('')
const showExecutionResult = ref(false)

// 提供一个方法来设置活动标签页
const setActiveTab = (tab) => {
  activeTab.value = tab
}

// 运行所有测试用例 - 通过emit触发父组件的run方法
const runCode = () => {
  // 触发父组件的run事件，让父组件来处理代码运行
  emit('run')

  // 切换到结果标签页
  activeTab.value = 'result'
  showExecutionResult.value = true
}

// 切换到测试用例标签页
const showTestCaseTab = () => {
  activeTab.value = 'testcase'
}

// 切换到结果标签页
const showResultTab = () => {
  // 只在有测试结果时才能切换
  if (
    (props.testCaseResults && props.testCaseResults.length > 0) ||
    (props.showExecutionResult && props.executionResult.status !== '')
  ) {
    activeTab.value = 'result'
  }
}

// 更新测试用例输入
const updateTestCase = (value) => {
  emit('update:testCase', value)
}

// 更新预期输出
const updateExpectedOutput = (value) => {
  emit('update:expectedOutput', value)
}

// 更新选中的测试用例索引
const updateSelectedTestCaseIndex = (index) => {
  emit('update:selectedTestCaseIndex', index)

  // 如果在运行模式下有测试结果，自动切换到结果标签页
  if (
    props.operationMode === 'run' &&
    props.testCaseResults &&
    props.testCaseResults.length > 0 &&
    props.testCaseResults[index]
  ) {
    activeTab.value = 'result'
  }
}

// 计算当前测试用例的状态
const testCaseStatus = computed(() => {
  if (props.testCaseError) return 'error'
  if (props.isLoadingTestCases) return 'loading'
  return 'ready'
})

// 计算测试用例是否通过
const isTestCasePassed = (index) => {
  if (!props.testCaseResults || props.testCaseResults.length <= index) {
    return null // 没有结果
  }

  const result = props.testCaseResults[index]

  // 检查是否有编译错误
  if (result.result && result.result.compileError) {
    return false
  }

  return result.passed
}

// 计算整体测试结果
const overallTestResult = computed(() => {
  if (!props.testCaseResults || props.testCaseResults.length === 0) {
    return null
  }

  // 所有测试用例都通过才算整体通过
  return props.testCaseResults.every((result) => result.passed)
})

// 获取当前选中测试用例的结果
const currentTestCaseResult = computed(() => {
  if (!props.testCaseResults || props.testCaseResults.length <= props.selectedTestCaseIndex) {
    return null
  }

  return props.testCaseResults[props.selectedTestCaseIndex]
})

// 计算是否应该显示执行结果
const shouldShowResults = computed(() => {
  return props.operationMode === 'run' && props.showExecutionResult
})
</script>

<template>
  <div class="test-case-panel">
    <!-- 新的布局：左侧表格 + 右侧内容 -->
    <div class="test-case-layout">
      <!-- 左侧测试用例表格 -->
      <div class="test-case-sidebar" v-if="testCases.length > 0">
        <div class="test-case-list">
          <div
            v-for="(tc, index) in testCases"
            :key="tc.id"
            @click="updateSelectedTestCaseIndex(index)"
            class="test-case-item"
            :class="{ active: selectedTestCaseIndex === index }"
          >
            <div class="flex items-center">
              <i class="fas fa-vial mr-2 text-indigo-500"></i>
              <span>测试用例 {{ index + 1 }}</span>
            </div>
            <!-- 测试用例的状态指示器 -->
            <div class="test-case-status">
              <!-- 显示测试用例结果状态 -->
              <template v-if="testCaseResults && testCaseResults.length > index">
                <i
                  v-if="isTestCasePassed(index) === true"
                  class="fas fa-check-circle text-green-500"
                  title="测试通过"
                ></i>
                <i
                  v-else-if="isTestCasePassed(index) === false"
                  class="fas fa-times-circle text-red-500"
                  title="测试失败"
                ></i>
              </template>
              <!-- 兼容旧的状态显示逻辑 -->
              <template
                v-else-if="
                  showExecutionResult &&
                  index === selectedTestCaseIndex &&
                  executionResult.status === 'success'
                "
              >
                <i class="fas fa-check-circle text-green-500" title="测试通过"></i>
              </template>
              <template
                v-else-if="
                  showExecutionResult &&
                  index === selectedTestCaseIndex &&
                  executionResult.status === 'error'
                "
              >
                <i class="fas fa-times-circle text-red-500" title="测试失败"></i>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="test-case-main-content">
        <!-- 内容区域 -->
        <div class="test-case-content">
          <!-- Tab 导航 -->
          <div class="tab-navigation flex border-b border-gray-200 mb-2">
            <button
              @click="activeTab = 'testcase'"
              class="tab-button py-1 px-3 font-medium text-sm mr-2"
              :class="
                activeTab === 'testcase'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              <i class="fas fa-vial mr-1"></i> 测试用例
            </button>
            <button
              @click="activeTab = 'result'"
              class="tab-button py-1 px-3 font-medium text-sm"
              :class="
                activeTab === 'result'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700'
              "
              :disabled="!shouldShowResults && (!testCaseResults || testCaseResults.length === 0)"
            >
              <i class="fas fa-terminal mr-1"></i> 执行结果
              <!-- 新的测试结果状态显示，只在运行模式下显示 -->
              <template
                v-if="operationMode === 'run' && testCaseResults && testCaseResults.length > 0"
              >
                <span v-if="overallTestResult" class="ml-1 text-green-500"
                  ><i class="fas fa-check-circle"></i
                ></span>
                <span v-else class="ml-1 text-red-500"><i class="fas fa-times-circle"></i></span>
              </template>
              <!-- 兼容旧的状态显示逻辑，只在运行模式下显示 -->
              <template v-else-if="operationMode === 'run'">
                <span v-if="executionResult.status === 'success'" class="ml-1 text-green-500"
                  ><i class="fas fa-check-circle"></i
                ></span>
                <span v-if="executionResult.status === 'error'" class="ml-1 text-red-500"
                  ><i class="fas fa-times-circle"></i
                ></span>
                <span v-if="executionResult.status === 'running'" class="ml-1 text-blue-500"
                  ><i class="fas fa-spinner fa-spin"></i
                ></span>
              </template>
            </button>
          </div>

          <!-- 加载状态 -->
          <div
            v-if="isLoadingTestCases"
            class="flex justify-center items-center py-6 animate-pulse"
          >
            <i class="fas fa-spinner fa-spin text-indigo-500 mr-2 text-xl"></i>
            <span class="text-indigo-700 font-medium">加载测试用例中...</span>
          </div>

          <!-- 错误状态 -->
          <div
            v-else-if="testCaseError"
            class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4"
          >
            <div class="flex items-center">
              <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
              <p class="font-medium">{{ testCaseError }}</p>
            </div>
          </div>

          <!-- 正常状态 - 测试用例标签页 -->
          <div v-else-if="activeTab === 'testcase'">
            <!-- 输入和预期输出区域 - 左右布局 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 输入区域 -->
              <div class="test-case-input">
                <label
                  for="test-case"
                  class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <i class="fas fa-keyboard text-indigo-500 mr-2"></i>
                  输入
                </label>
                <textarea
                  :value="testCase"
                  @input="updateTestCase($event.target.value)"
                  id="test-case"
                  rows="3"
                  placeholder="输入测试用例"
                ></textarea>
              </div>

              <!-- 预期输出区域 -->
              <div class="test-case-output">
                <label
                  for="expected-output"
                  class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <i class="fas fa-check-circle text-green-500 mr-2"></i>
                  预期输出
                </label>
                <textarea
                  :value="expectedOutput"
                  id="expected-output"
                  rows="3"
                  readonly
                  placeholder="预期输出（只读）"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- 执行结果标签页 - 运行模式 -->
          <div
            v-else-if="activeTab === 'result' && operationMode === 'run'"
            class="execution-result"
          >
            <!-- 新的测试用例结果显示 -->
            <template v-if="currentTestCaseResult">
              <div
                class="execution-result-header mb-3"
                :class="{
                  'execution-success': currentTestCaseResult.passed,
                  'execution-error': !currentTestCaseResult.passed,
                }"
              >
                <div class="flex items-center">
                  <template v-if="currentTestCaseResult.passed">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span class="font-medium">测试通过</span>
                  </template>
                  <template v-else>
                    <i class="fas fa-times-circle mr-2"></i>
                    <span class="font-medium">测试失败</span>
                  </template>
                </div>
                <!-- 显示运行时间和内存使用情况 -->
                <span
                  v-if="
                    currentTestCaseResult.result &&
                    currentTestCaseResult.result.testCaseResults &&
                    currentTestCaseResult.result.testCaseResults.length > 0
                  "
                >
                  耗时: {{ currentTestCaseResult.result.testCaseResults[0].timeInMsWithUnit }} |
                  内存: {{ currentTestCaseResult.result.testCaseResults[0].memoryInMBWithUnit }}
                </span>
              </div>

              <!-- 编译错误显示 -->
              <div
                v-if="currentTestCaseResult.result && currentTestCaseResult.result.compileError"
                class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 selectable"
              >
                <div class="flex items-start">
                  <i class="fas fa-exclamation-circle text-red-500 mr-2 mt-1"></i>
                  <div>
                    <p class="font-medium mb-2">编译错误</p>
                    <pre class="whitespace-pre-wrap text-sm">{{
                      currentTestCaseResult.result.compileError
                    }}</pre>
                  </div>
                </div>
              </div>

              <!-- 输出与预期输出对比 -->
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <!-- 实际输出 -->
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <i class="fas fa-terminal text-indigo-500 mr-2"></i>
                    实际输出
                  </div>
                  <div
                    class="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm overflow-auto max-h-40 selectable"
                  >
                    {{
                      currentTestCaseResult.result &&
                      currentTestCaseResult.result.testCaseResults &&
                      currentTestCaseResult.result.testCaseResults.length > 0
                        ? currentTestCaseResult.result.testCaseResults[0].stdout
                        : ''
                    }}
                  </div>
                </div>

                <!-- 预期输出 -->
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    预期输出
                  </div>
                  <div
                    class="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm overflow-auto max-h-40 selectable"
                  >
                    {{ currentTestCaseResult.expectedOutput }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 旧的执行结果显示 -->
            <template v-else>
              <!-- 执行结果头部 -->
              <div
                class="execution-result-header mb-3"
                :class="{
                  'execution-success': executionResult.status === 'success',
                  'execution-error': executionResult.status === 'error',
                  'execution-running': executionResult.status === 'running',
                }"
              >
                <div class="flex items-center">
                  <template v-if="executionResult.status === 'success'">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span class="font-medium">{{ executionResult.message || '执行成功' }}</span>
                  </template>
                  <template v-else-if="executionResult.status === 'error'">
                    <i class="fas fa-times-circle mr-2"></i>
                    <span class="font-medium">{{ executionResult.message || '执行失败' }}</span>
                  </template>
                  <template v-else-if="executionResult.status === 'running'">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    <span class="font-medium">{{ executionResult.message || '正在执行...' }}</span>
                  </template>
                  <template v-else>
                    <i class="fas fa-info-circle mr-2"></i>
                    <span class="font-medium">等待执行</span>
                  </template>
                </div>
                <span v-if="executionResult.status && executionResult.status !== 'running'">
                  耗时: {{ executionResult.time }} | 内存: {{ executionResult.memory }}
                </span>
              </div>

              <!-- 执行结果输出 -->
              <div class="execution-result-output">
                <div class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <i class="fas fa-terminal text-indigo-500 mr-2"></i>
                  输出
                </div>
                <div
                  class="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm overflow-auto max-h-40 selectable"
                >
                  {{ executionResult.output || '无输出' }}
                </div>
              </div>
            </template>
          </div>

          <!-- 执行结果标签页 - 提交模式 -->
          <div
            v-else-if="activeTab === 'result' && operationMode === 'submit'"
            class="execution-result"
          >
            <!-- 提交结果显示 -->
            <template v-if="submissionResult">
              <!-- 提交结果头部 -->
              <div
                class="execution-result-header mb-3"
                :class="{
                  'execution-success':
                    !submissionResult.error && submissionResult.testCaseSetResult?.allPassed,
                  'execution-error':
                    submissionResult.error || !submissionResult.testCaseSetResult?.allPassed,
                }"
              >
                <div class="flex items-center">
                  <template v-if="submissionResult.error">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span class="font-medium">{{ submissionResult.message || '提交失败' }}</span>
                  </template>
                  <template v-else-if="submissionResult.testCaseSetResult?.allPassed">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span class="font-medium"
                      >恭喜！所有测试用例通过
                      {{ submissionResult.testCaseSetResult?.passRatio || '0/0' }}</span
                    >
                  </template>
                  <template v-else>
                    <i class="fas fa-times-circle mr-2"></i>
                    <span class="font-medium"
                      >部分测试用例未通过
                      {{ submissionResult.testCaseSetResult?.passRatio || '0/0' }}</span
                    >
                  </template>
                </div>
                <span v-if="!submissionResult.error && submissionResult.testCaseSetResult">
                  耗时: {{ submissionResult.testCaseSetResult.avgTimeInMsWithUnit || '0ms' }} |
                  内存: {{ submissionResult.testCaseSetResult.avgMemoryInMBWithUnit || '0MB' }}
                </span>
              </div>

              <!-- 编译错误显示 -->
              <div
                v-if="!submissionResult.error && submissionResult.testCaseSetResult?.compileError"
                class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 selectable"
              >
                <div class="flex items-start">
                  <i class="fas fa-exclamation-circle text-red-500 mr-2 mt-1"></i>
                  <div>
                    <p class="font-medium mb-2">编译错误</p>
                    <pre class="whitespace-pre-wrap text-sm">{{
                      submissionResult.testCaseSetResult.compileError
                    }}</pre>
                  </div>
                </div>
              </div>

              <!-- 提交ID显示 -->
              <div v-if="!submissionResult.error && submissionResult.submissionId" class="mb-4">
                <div class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <i class="fas fa-hashtag text-indigo-500 mr-2"></i>
                  提交ID
                </div>
                <div
                  class="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm overflow-auto selectable"
                >
                  {{ submissionResult.submissionId }}
                </div>
              </div>

              <!-- 提交成功提示 -->
              <div
                v-if="!submissionResult.error"
                class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div class="flex items-start">
                  <i class="fas fa-info-circle text-green-500 mr-2 mt-1"></i>
                  <div>
                    <p class="font-medium">提交成功</p>
                    <p class="text-sm mt-1">
                      您的代码已成功提交并评测完成。您可以继续修改代码并重新提交。
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- 提交中状态 -->
            <template v-else-if="isRunning || isSubmitting">
              <div class="flex justify-center items-center py-6 animate-pulse">
                <i class="fas fa-spinner fa-spin text-indigo-500 mr-2 text-xl"></i>
                <span class="text-indigo-700 font-medium">正在提交代码，请稍候...</span>
              </div>
            </template>

            <!-- 等待提交状态 -->
            <template v-else>
              <div class="flex justify-center items-center py-6 text-gray-500">
                <i class="fas fa-code mr-2"></i>
                <span>请点击提交按钮提交您的代码</span>
              </div>
            </template>
          </div>
        </div>

        <!-- 底部状态指示器 -->
        <div class="border-t bg-gray-50 flex justify-between items-center px-3 py-1 min-h-[30px]">
          <div class="flex items-center">
            <span
              class="status-indicator"
              :class="{
                'status-ready': testCaseStatus === 'ready',
                'status-loading': testCaseStatus === 'loading',
                'status-error': testCaseStatus === 'error',
              }"
            ></span>
            <span class="text-sm ml-2">
              <template v-if="testCaseStatus === 'ready'">就绪</template>
              <template v-else-if="testCaseStatus === 'loading'">加载中...</template>
              <template v-else-if="testCaseStatus === 'error'">错误</template>
            </span>
          </div>
          <div class="text-sm text-gray-500">
            <template v-if="testCases.length > 0">
              {{ selectedTestCaseIndex + 1 }} / {{ testCases.length }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 样式已移至TestCasePanel.css文件 */
</style>
