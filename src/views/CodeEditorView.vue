<template>
  <div class="code-editor-container">
    <!-- 题目描述区域 -->
    <div class="problem-section">
      <ProblemDescription :problem="problem" :loading="loading" />
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-section">
      <!-- 编辑器工具栏 -->
      <EditorToolbar
        :languages="languages"
        :selectedLanguage="selectedLanguage"
        @update:selectedLanguage="handleLanguageChange"
        @run="runCode"
        @submit="debouncedSubmitCode"
        @submit-success="handleSubmitSuccess"
        class="editor-toolbar"
        :isSubmitting="isSubmitting"
      />

      <!-- 代码编辑器 -->
      <div class="editor-container">
        <CodeEditor :code="code" @update:code="code = $event" :language="selectedLanguage" />
      </div>

      <!-- 测试用例面板 -->
      <div class="test-case-section">
        <TestCasePanel
          :testCases="testCases"
          :isLoadingTestCases="isLoadingTestCases"
          :testCaseError="testCaseError"
          :testCase="testCase"
          :expectedOutput="expectedOutput"
          :selectedTestCaseIndex="selectedTestCaseIndex"
          :executionResult="executionResult"
          :showExecutionResult="
            (operationMode === 'run' && (!!executionResult.status || testCaseResults.length > 0)) ||
            (operationMode === 'submit' && submissionResult)
          "
          :testCaseResults="testCaseResults"
          :isRunning="isRunning || isSubmitting"
          :overallResult="
            operationMode === 'submit' && submissionResult
              ? getSubmissionOverallResult()
              : overallResult
          "
          :code="code"
          :language="selectedLanguage"
          :operationMode="operationMode"
          :submissionResult="submissionResult"
          @update:testCase="testCase = $event"
          @update:expectedOutput="expectedOutput = $event"
          @update:selectedTestCaseIndex="selectedTestCaseIndex = $event"
          @run="runCode"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CodeEditor from '../components/CodeEditor.vue'
import ProblemDescription from '../components/problem/ProblemDescription.vue'
import TestCasePanel from '../components/problem/TestCasePanel.vue'
import EditorToolbar from '../components/problem/EditorToolbar.vue'
import { API_BASE_URL } from '../config/api.config.js'
import { getAuthHeader } from '../services/api'

// 导入拆分出的composables
import { useEditor } from '../composables/useEditor'
import { useProblem } from '../composables/useProblem'
import { useTestCase } from '../composables/useTestCase'
import { useExecution } from '../composables/useExecution'

// 获取路由参数和路由器
const route = useRoute()
const router = useRouter()

// 使用拆分出的composables
const { code, selectedLanguage, languages, resetCode, handleLanguageChange } = useEditor()
const { problem, loading, fetchProblemDetail } = useProblem()
const {
  testCase,
  expectedOutput,
  testCases,
  isLoadingTestCases,
  testCaseError,
  selectedTestCaseIndex,
  fetchTestCases,
  setupTestCaseWatch,
} = useTestCase()
const {
  executionResult,
  testCaseResults,
  isRunning,
  overallResult,
  runCode: executeCode,
  runAllTestCases,
  submitCode: submitCodeToServer,
} = useExecution()

// 设置测试用例选择变化的监听
setupTestCaseWatch()

// 当前操作模式：'run' 或 'submit'
const operationMode = ref('run')

// 重置操作模式为运行模式
const resetOperationMode = () => {
  operationMode.value = 'run'
}

// 运行代码
const runCode = () => {
  // 设置为运行模式
  operationMode.value = 'run'

  // 确保使用当前编辑器中的代码内容
  console.log('运行代码:', code.value)
  // 运行所有测试用例
  runAllTestCases(code.value, selectedLanguage.value, testCases.value)
}

// 防抖函数 - 避免频繁提交
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null
  return function (...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

// 是否正在提交代码
const isSubmitting = ref(false)

// 提交结果
const submissionResult = ref<any>(null)

// 提交代码
const submitCode = async () => {
  // 如果正在提交，则不重复提交
  if (isSubmitting.value) return

  // 设置为提交模式
  operationMode.value = 'submit'
  isSubmitting.value = true
  submissionResult.value = null

  // 获取编辑器代码的值和题目ID
  const codeValue = code.value
  const problemId = route.params.id

  console.log('开始提交代码，题目ID:', problemId)

  try {
    // 提交代码并等待结果
    const response = await submitCodeToServer(codeValue, selectedLanguage.value)

    console.log('提交代码，获取到结果:', response)

    // 检查是否有submissionId，无论响应状态码是什么
    if (response && response.data && response.data.submissionId) {
      console.log('获取到submissionId:', response.data.submissionId)

      // 保存提交结果到本地状态，以便在跳转后的页面可以使用
      const submissionData = {
        ...response.data,
        code: codeValue,
        language: selectedLanguage.value,
        submitTime: new Date().toISOString(),
        problemId: problemId,
        problemTitle: problem.value?.title || '未知题目',
        message: response.message || (response.code === 200 ? '提交成功' : '提交出现问题'),
      }

      // 将提交结果和代码信息一起存储到 localStorage
      localStorage.setItem('lastSubmissionResult', JSON.stringify(submissionData))

      // 先跳转到题目列表页面
      await router.push('/problems')

      // 然后再跳转到提交详情页面
      setTimeout(() => {
        router.push(`/submissions/${response.data.submissionId}`)
      }, 0)

      return
    }

    // 如果没有submissionId，保存提交结果到本地状态
    submissionResult.value = {
      ...response.data,
      code: codeValue,
      language: selectedLanguage.value,
      submitTime: new Date().toISOString(),
      problemId: problemId,
      problemTitle: problem.value?.title || '未知题目', // 使用实际的题目标题
    }

    // 将提交结果和代码信息一起存储到 localStorage
    localStorage.setItem('lastSubmissionResult', JSON.stringify(submissionResult.value))

    // 只有当响应不成功时才设置错误信息
    if (response?.code !== 200) {
      console.error('提交失败:', response?.message || '未知错误')
      submissionResult.value = {
        error: true,
        message: response?.message || '提交失败，请稍后重试',
      }
    }
  } catch (error) {
    console.error('提交代码时发生错误:', error)
    submissionResult.value = {
      error: true,
      message: error instanceof Error ? error.message : '提交代码时发生错误',
    }
  } finally {
    isSubmitting.value = false
  }
}

// 使用防抖包装提交函数
const debouncedSubmitCode = debounce(submitCode, 300)

// 处理提交成功事件
const handleSubmitSuccess = (callback: (submissionId: string) => void) => {
  // 不再重复调用submitCodeToServer，因为submitCode函数已经调用过了
  // 只处理回调函数的情况
  console.log('提交成功回调函数已接收')
}

// 将提交结果转换为TestCasePanel组件可以显示的格式
const getSubmissionOverallResult = () => {
  if (!submissionResult.value) return overallResult.value

  if (submissionResult.value.error) {
    return {
      status: 'error',
      allPassed: false,
      message: submissionResult.value.message,
    }
  }

  // 从提交结果中获取测试集结果
  const testCaseSetResult = submissionResult.value.submissionId
    ? submissionResult.value.testCaseSetResult
    : submissionResult.value

  return {
    status: 'done',
    allPassed: testCaseSetResult?.allPassed || false,
    message: testCaseSetResult?.allPassed
      ? `恭喜！所有测试用例通过 ${testCaseSetResult.passRatio || '0/0'}`
      : `部分测试用例未通过 ${testCaseSetResult.passRatio || '0/0'}`,
  }
}

// 组件挂载时获取测试用例和题目详情
onMounted(() => {
  // 重置操作模式为运行模式
  resetOperationMode()

  // 从路由参数中获取题目ID
  const problemId = route.params.id
  if (problemId) {
    fetchTestCases(problemId)
    fetchProblemDetail(problemId)

    // 获取之前保存的代码草稿
    fetchCodeDraft(problemId as string)
  }

  // 检查是否有保存的代码
  const savedCode = localStorage.getItem('codeToEdit')
  if (savedCode) {
    try {
      const { code: savedCodeValue, language: savedLanguage } = JSON.parse(savedCode)
      // 更新编辑器的代码和语言
      code.value = savedCodeValue
      selectedLanguage.value = savedLanguage
      // 清除保存的代码
      localStorage.removeItem('codeToEdit')
    } catch (error) {
      console.error('解析保存的代码失败:', error)
      localStorage.removeItem('codeToEdit')
    }
  }

  // 设置代码草稿自动保存定时器
  startDraftAutoSave()
})

// 代码草稿自动保存相关
let draftSaveTimer: number | null = null
const isDraftSaving = ref(false)
const lastSavedCode = ref('')
const lastSavedLanguage = ref('')

// 开始自动保存代码草稿
const startDraftAutoSave = () => {
  // 清除可能存在的旧定时器
  if (draftSaveTimer) {
    clearInterval(draftSaveTimer)
  }

  // 设置新的定时器，每秒保存一次
  draftSaveTimer = window.setInterval(() => {
    saveCodeDraft()
  }, 1000)
}

// 保存代码草稿
const saveCodeDraft = async () => {
  // 如果正在保存，则跳过
  if (isDraftSaving.value) return

  // 获取当前代码和语言
  const currentCode = code.value
  const currentLanguage = selectedLanguage.value
  const problemId = route.params.id as string

  // 如果代码或语言没有变化，则跳过
  if (currentCode === lastSavedCode.value && currentLanguage === lastSavedLanguage.value) {
    return
  }

  // 设置保存状态
  isDraftSaving.value = true

  try {
    // 准备请求数据
    const requestData = {
      problemId,
      code: currentCode,
      language: currentLanguage,
    }

    // 调用保存草稿API
    const response = await fetch(`${API_BASE_URL}/code/draft/save`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    const data = await response.json()

    if (data.code === 200) {
      // 保存成功，更新最后保存的代码和语言
      lastSavedCode.value = currentCode
      lastSavedLanguage.value = currentLanguage
      console.log('代码草稿保存成功')
    } else {
      console.error('保存代码草稿失败:', data.message)
    }
  } catch (error) {
    console.error('保存代码草稿时发生错误:', error)
  } finally {
    // 重置保存状态
    isDraftSaving.value = false
  }
}

// 获取代码草稿
const fetchCodeDraft = async (problemId: string) => {
  try {
    // 调用获取草稿API
    const response = await fetch(`${API_BASE_URL}/code/draft/${problemId}`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (data.code === 200 && data.data) {
      // 获取成功，更新编辑器的代码和语言
      const draft = data.data
      code.value = draft.code
      selectedLanguage.value = draft.language

      // 更新最后保存的代码和语言
      lastSavedCode.value = draft.code
      lastSavedLanguage.value = draft.language

      console.log('获取代码草稿成功')
    } else if (data.code === 200 && !data.data) {
      console.log('未找到代码草稿')
    } else {
      console.error('获取代码草稿失败:', data.message)
    }
  } catch (error) {
    console.error('获取代码草稿时发生错误:', error)
  }
}

// 监听路由变化，当进入编辑页面时重新获取数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      // 重置状态
      resetOperationMode()
      // 获取测试用例和题目详情
      fetchTestCases(newId)
      fetchProblemDetail(newId)
      // 获取之前保存的代码草稿
      fetchCodeDraft(newId as string)
    }
  }
)

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  resetOperationMode()

  // 清除代码草稿自动保存定时器
  if (draftSaveTimer) {
    clearInterval(draftSaveTimer)
    draftSaveTimer = null
  }

  // 最后保存一次当前代码
  saveCodeDraft()
})
</script>

<style scoped>
/* 基础布局 */
.code-editor-container {
  display: flex;
  height: calc(100vh - 64px);
  overflow: hidden;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.problem-section {
  width: 40%;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  padding: clamp(8px, 1vw, 16px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);
  background-color: white;
  transition: all 0.3s ease;
}

.editor-section {
  width: 60%;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.editor-container {
  height: 70%;
  flex: 1 1 auto;
  overflow: hidden;
  min-height: 0;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.test-case-section {
  height: 20%;
  overflow-y: auto;
  background-color: white;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.02);
  transition: height 0.3s ease;
}

/* 大屏幕设备 (1200px以上) */
@media (min-width: 1200px) {
  .problem-section {
    width: 40%;
  }

  .editor-section {
    width: 60%;
  }
}

/* 中等屏幕设备 (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .problem-section {
    width: 45%;
  }

  .editor-section {
    width: 55%;
  }
}

/* 平板设备 (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .problem-section {
    width: 45%;
  }

  .editor-section {
    width: 55%;
  }

  .editor-container {
    height: 65%;
  }

  .test-case-section {
    height: 25%;
  }
}

/* 手机设备 (767px以下) */
@media (max-width: 767px) {
  .code-editor-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 64px);
  }

  .problem-section {
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px;
  }

  .editor-section {
    width: 100%;
    height: 60vh;
  }

  .editor-container {
    height: 60%;
  }

  .test-case-section {
    height: 30%;
  }
}

/* 小型手机设备 (480px以下) */
@media (max-width: 480px) {
  .code-editor-container {
    height: auto;
    min-height: calc(100vh - 64px);
  }

  .problem-section {
    max-height: 35vh;
    padding: 10px;
  }

  .editor-section {
    height: 65vh;
  }

  .editor-toolbar {
    padding: 8px;
  }

  .editor-container {
    height: 55%;
  }

  .test-case-section {
    height: 35%;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  /* 增大按钮点击区域 */
  .editor-toolbar button {
    padding: 10px 16px;
    margin: 4px;
  }

  /* 增大下拉菜单项的高度 */
  .custom-select .options .option {
    padding: 12px 16px;
  }

  /* 增大测试用例项的点击区域 */
  .test-case-item {
    padding: 12px;
    margin-bottom: 8px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .code-editor-container {
    background-color: #1e1e1e;
  }

  .problem-section,
  .editor-section,
  .test-case-section {
    background-color: #1e1e1e;
    border-color: #333;
  }
}
</style>
