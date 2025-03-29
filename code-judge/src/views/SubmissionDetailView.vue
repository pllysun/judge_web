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
      <!-- 提交信息头部 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold text-gray-800">提交详情 #{{ submissionId }}</h1>
          <div class="flex items-center">
            <span 
              :class="{
                'bg-green-100 text-green-800': submission.allPassed,
                'bg-red-100 text-red-800': !submission.allPassed
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ submission.allPassed ? '通过' : '未通过' }}
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
              {{ submission.problemTitle || '未知题目' }}
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
            <span>{{ formatDate(submission.submitTime) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 执行结果统计 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">执行结果统计</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="text-gray-500 text-sm">测试用例</div>
            <div class="font-bold text-xl">
              {{ submission.passedCount }}/{{ submission.totalCount }}
            </div>
            <div class="text-sm">
              通过率: {{ Math.round((submission.passedCount / submission.totalCount) * 100) || 0 }}%
            </div>
          </div>
          
          <div class="stat-card">
            <div class="text-gray-500 text-sm">平均执行时间</div>
            <div class="font-bold text-xl">{{ submission.avgTimeInMs }} ms</div>
            <div class="text-sm">总时间: {{ submission.totalTimeInMs }} ms</div>
          </div>
          
          <div class="stat-card">
            <div class="text-gray-500 text-sm">平均内存使用</div>
            <div class="font-bold text-xl">{{ submission.avgMemoryInMB }} MB</div>
            <div class="text-sm">总内存: {{ submission.totalMemoryInMB }} MB</div>
          </div>
          
          <div class="stat-card">
            <div class="text-gray-500 text-sm">平均运行时间</div>
            <div class="font-bold text-xl">{{ (submission.avgRunTime / 1000000).toFixed(2) }} ms</div>
            <div class="text-sm">总运行时间: {{ (submission.totalRunTime / 1000000).toFixed(2) }} ms</div>
          </div>
        </div>
      </div>
      
      <!-- 代码展示 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">提交的代码</h2>
        <div class="code-container bg-gray-50 p-4 rounded-md overflow-x-auto">
          <pre><code>{{ submission.code }}</code></pre>
        </div>
      </div>
      
      <!-- 测试用例结果 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">测试用例结果</h2>
        
        <div v-if="submission.compileError" class="mb-4">
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-red-500"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-red-800 font-medium">编译错误</h3>
                <div class="mt-2 text-red-700 whitespace-pre-wrap">
                  {{ submission.compileError }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!submission.testCaseResults || submission.testCaseResults.length === 0" class="text-center py-8 text-gray-500">
          没有测试用例结果
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="(result, index) in submission.testCaseResults" :key="index" class="test-case-result">
            <div 
              class="test-case-header flex items-center justify-between p-3 rounded-t-md cursor-pointer"
              :class="{
                'bg-green-50 text-green-800': result.status === 'Accepted',
                'bg-red-50 text-red-800': result.status !== 'Accepted'
              }"
              @click="toggleTestCase(index)"
            >
              <div class="flex items-center">
                <i 
                  class="mr-2 fas" 
                  :class="{
                    'fa-check-circle text-green-500': result.status === 'Accepted',
                    'fa-times-circle text-red-500': result.status !== 'Accepted'
                  }"
                ></i>
                <span class="font-medium">测试用例 #{{ index + 1 }}</span>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm">{{ result.timeInMsWithUnit }}</span>
                <span class="text-sm">{{ result.memoryInMBWithUnit }}</span>
                <i class="fas" :class="expandedTestCases[index] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </div>
            
            <div v-if="expandedTestCases[index]" class="test-case-details p-4 border border-t-0 rounded-b-md">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-medium mb-2 text-gray-700">输入</h4>
                  <pre class="bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto">{{ result.input || '无输入数据' }}</pre>
                </div>
                <div>
                  <h4 class="font-medium mb-2 text-gray-700">输出</h4>
                  <pre class="bg-gray-50 p-3 rounded whitespace-pre-wrap overflow-x-auto">{{ result.stdout || '无输出数据' }}</pre>
                </div>
              </div>
              
              <div v-if="result.status !== 'Accepted'" class="mt-4">
                <h4 class="font-medium mb-2 text-red-700">错误信息</h4>
                <pre class="bg-red-50 p-3 rounded text-red-800 whitespace-pre-wrap overflow-x-auto">{{ result.errorMessage || result.status }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAuthHeader } from '../services/api';

// 路由参数
const route = useRoute();
const router = useRouter();
const submissionId = ref(route.params.id);

// 状态
const loading = ref(true);
const error = ref('');
const submission = reactive({
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
  testCaseResults: []
});

// 测试用例展开状态
const expandedTestCases = ref({});

// 切换测试用例展开/折叠
const toggleTestCase = (index) => {
  expandedTestCases.value[index] = !expandedTestCases.value[index];
};

// 获取语言对应的图标
const getLanguageIcon = (language: string): string => {
  const iconMap: Record<string, string> = {
    'javascript': 'fab fa-js-square',
    'python': 'fab fa-python',
    'java': 'fab fa-java',
    'cpp': 'fas fa-file-code',
    'c': 'fas fa-code'
  };

  return iconMap[language] || 'fas fa-code';
};

// 获取语言对应的标签名称
const getLanguageLabel = (language: string): string => {
  const labelMap: Record<string, string> = {
    'javascript': 'JavaScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C'
  };

  return labelMap[language] || language;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 获取提交详情
const fetchSubmissionDetail = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const API_BASE_URL = 'http://pllysun.top:7500/api';
    const response = await fetch(`${API_BASE_URL}/submission/${submissionId.value}`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '获取提交详情失败');
    }
    
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      // 更新提交详情数据
      Object.assign(submission, data.data);
      
      // 默认展开第一个测试用例
      if (submission.testCaseResults && submission.testCaseResults.length > 0) {
        expandedTestCases.value[0] = true;
      }
    } else {
      throw new Error(data.message || '获取提交详情失败');
    }
  } catch (error) {
    console.error('获取提交详情出错:', error);
    error.value = error.message || '获取提交详情失败';
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取提交详情
onMounted(() => {
  if (submissionId.value) {
    fetchSubmissionDetail();
  } else {
    error.value = '未找到提交ID';
    loading.value = false;
  }
});
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
}

.code-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>