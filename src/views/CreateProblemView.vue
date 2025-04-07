<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { problemApi } from '../services/problemService' // 确保使用正确的大写文件名

const router = useRouter()

// 第二部分数据（题目信息）
const problemInfo = reactive({
  title: '',
  difficulty: 5, // 默认中等难度
  tags: [] as string[],
  content: ''
})

// 标签输入
const tagInput = ref('')
const addTag = () => {
  if (tagInput.value.trim() && !problemInfo.tags.includes(tagInput.value.trim())) {
    problemInfo.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}
const removeTag = (index: number) => {
  problemInfo.tags.splice(index, 1)
}

// 第一部分数据（测试数据）
const testData = reactive({
  language: 'java', // 默认语言
  code: '',
  inputs: ['', '', ''] // 默认三个输入框
})

// 添加输入框
const addInputField = () => {
  testData.inputs.push('')
}

// 移除输入框
const removeInputField = (index: number) => {
  if (testData.inputs.length > 1) {
    testData.inputs.splice(index, 1)
  }
}

// 返回题目管理页面
const goBack = () => {
  router.push('/admin')
}

// 提交处理
const isSubmitting = ref(false)
const testSetId = ref('')

// 第一阶段提交 - 提交测试数据获取测试集ID
const submitTestData = async () => {
  console.log('submitTestData函数被调用')
  try {
    console.log('设置isSubmitting为true')
    isSubmitting.value = true
    
    // 过滤空的输入数据
    const validInputs = testData.inputs.filter(input => input.trim() !== '')
    console.log('有效的输入数据数量:', validInputs.length)
    
    // 构建测试用例数据
    const testCases = validInputs.map(input => ({
      input: input.trim()
    }))
    
    console.log('准备发送测试集数据:', {
      code: testData.code,
      language: testData.language,
      testCases: testCases
    })
    
    console.log('检查problemApi对象:', problemApi)
    console.log('检查createTestGroup方法:', typeof problemApi.createTestGroup)
    
    // 调用API创建测试集
    console.log('开始调用createTestGroup API')
    const response = await problemApi.createTestGroup({
      code: testData.code,
      language: testData.language,
      testCases: testCases
    })
    
    console.log('API响应:', response)
    
    // 从响应中获取测试集ID
    // 检查响应结构并正确获取ID
    console.log('完整响应结构:', JSON.stringify(response))
    if (response.data && response.data.id) {
      testSetId.value = response.data.id
    } else if (response.id) {
      testSetId.value = response.id
    } else {
      console.error('无法从响应中获取测试集ID:', response)
      throw new Error('无法获取测试集ID')
    }
    console.log('测试集ID:', testSetId.value)
    
    // 提交第二部分
    console.log('准备调用submitProblemInfo')
    await submitProblemInfo()
  } catch (error: any) {
    console.error('提交测试数据失败:', error)
    console.error('错误详情:', error.stack)
    alert('提交测试数据失败: ' + (error.message || '请重试'))
    // 只有在出错时才设置isSubmitting为false
    console.log('设置isSubmitting为false (错误情况)')
    isSubmitting.value = false
  }
}

// 第二阶段提交 - 提交题目信息
const submitProblemInfo = async () => {
  try {
    console.log('提交题目信息:', {
      title: problemInfo.title,
      difficulty: problemInfo.difficulty,
      tags: problemInfo.tags,
      content: problemInfo.content,
      testSetId: testSetId.value
    })
    
    // 调用API创建题目
    const response = await problemApi.createProblem({
      title: problemInfo.title,
      difficulty: problemInfo.difficulty,
      tags: problemInfo.tags,
      content: problemInfo.content,
      testGroupId: testSetId.value
    })
    
    console.log('题目创建成功:', response.data)
    
    // 显示成功消息并跳转
    alert('题目创建成功！')
    router.push('/admin')
  } catch (error: any) {
    console.error('提交题目信息失败:', error)
    alert('提交题目信息失败: ' + (error.message || '请重试'))
  } finally {
    // 确保在提交题目信息完成后重置isSubmitting状态
    console.log('提交题目信息完成，设置isSubmitting为false')
    isSubmitting.value = false
  }
}

// 完成创建 - 触发两阶段提交
const createProblem = () => {
  console.log('创建题目按钮被点击')
  
  // 表单验证
  if (!problemInfo.title.trim()) {
    console.log('验证失败: 题目名称为空')
    alert('请输入题目名称')
    return
  }
  
  if (!problemInfo.content.trim()) {
    console.log('验证失败: 题目内容为空')
    alert('请输入题目内容')
    return
  }
  
  if (!testData.code.trim()) {
    console.log('验证失败: 代码为空')
    alert('请输入代码')
    return
  }
  
  // 过滤空的输入数据
  const validInputs = testData.inputs.filter(input => input.trim() !== '')
  if (validInputs.length === 0) {
    console.log('验证失败: 没有有效的输入数据')
    alert('请至少提供一个有效的输入数据')
    return
  }
  
  console.log('表单验证通过，准备调用submitTestData()')
  // 开始两阶段提交
  submitTestData()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    
    <!-- 主要内容 -->
    <div class="py-10">
      <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <button
          @click="goBack"
          class="mr-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          返回
        </button>
        <h1 class="text-3xl font-bold leading-tight text-gray-900">创建新题目</h1>
      </header>
      
      <main class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg mt-6 p-6">
          <!-- 第二部分：题目信息 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">题目信息</h2>
            
            <!-- 题目名称 -->
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700">题目名称</label>
              <input
                type="text"
                id="title"
                v-model="problemInfo.title"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="请输入题目名称"
              />
            </div>
            
            <!-- 难度 -->
            <div class="mb-4">
              <label for="difficulty" class="block text-sm font-medium text-gray-700">难度 (1-10)</label>
              <div class="flex items-center">
                <input
                  type="range"
                  id="difficulty"
                  v-model="problemInfo.difficulty"
                  min="1"
                  max="10"
                  class="mt-1 block w-full"
                />
                <span class="ml-2 text-sm text-gray-500">{{ problemInfo.difficulty }}</span>
              </div>
              <div class="mt-1 flex justify-between text-xs text-gray-500">
                <span>简单</span>
                <span>中等</span>
                <span>困难</span>
              </div>
            </div>
            
            <!-- 标签 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">标签</label>
              <div class="flex mt-1">
                <input
                  type="text"
                  v-model="tagInput"
                  @keyup.enter="addTag"
                  class="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="输入标签后按回车添加"
                />
                <button
                  type="button"
                  @click="addTag"
                  class="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  添加
                </button>
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="(tag, index) in problemInfo.tags"
                  :key="index"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                  >
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
            
            <!-- 题目内容 -->
            <div class="mb-4">
              <label for="content" class="block text-sm font-medium text-gray-700">题目内容</label>
              <textarea
                id="content"
                v-model="problemInfo.content"
                rows="6"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="请输入题目内容、要求和示例"
              ></textarea>
            </div>
          </div>
          
          <!-- 第一部分：测试数据 -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">测试数据</h2>
            
            <!-- 编程语言 -->
            <div class="mb-4">
              <label for="language" class="block text-sm font-medium text-gray-700">编程语言</label>
              <select
                id="language"
                v-model="testData.language"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            
            <!-- 代码 -->
            <div class="mb-4">
              <label for="code" class="block text-sm font-medium text-gray-700">代码</label>
              <textarea
                id="code"
                v-model="testData.code"
                rows="8"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono"
                placeholder="请输入测试代码"
              ></textarea>
            </div>
            
            <!-- 输入数据 -->
            <div class="mb-4">
              <div class="flex justify-between items-center">
                <label class="block text-sm font-medium text-gray-700">输入数据</label>
                <button
                  type="button"
                  @click="addInputField"
                  class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  添加输入
                </button>
              </div>
              
              <div class="space-y-2 mt-2">
                <div
                  v-for="(input, index) in testData.inputs"
                  :key="index"
                  class="flex items-center"
                >
                  <input
                    type="text"
                    v-model="testData.inputs[index]"
                    class="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    :placeholder="`输入数据 ${index + 1}`"
                  />
                  <button
                    type="button"
                    @click="removeInputField(index)"
                    class="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    :disabled="testData.inputs.length <= 1"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 提交按钮 -->
          <div class="mt-8 flex justify-end">
            <button
              type="button"
              @click="createProblem"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            >
              <svg
                v-if="isSubmitting"
                class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ isSubmitting ? '提交中...' : '完成创建' }}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>