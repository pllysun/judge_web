<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { problemApi } from '../services/problemService';
import MarkdownIt from 'markdown-it';

// 获取路由参数
const route = useRoute();
const id = route.params.id;

// 初始化markdown-it实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// 题目数据
const problem = ref({
  id: '',
  problemId: '',
  title: '',
  difficulty: '',
  difficultyLabel: '',
  acceptRate: '',
  submissionCount: '',
  tags: [],
  content: '',
  examples: [],
  hints: [],
  constraints: []
});

// 渲染Markdown内容
const renderedContent = computed(() => {
  return md.render(problem.value.content || '');
});

// 加载状态
const loading = ref(true);

// 获取题目详情
const fetchProblemDetail = async () => {
  try {
    loading.value = true;

    // 调用API获取题目详情
    // 注意：这里假设problemApi中已经有getProblemById方法
    // 如果没有，需要在problemService.ts中添加该方法
    const response = await fetch(`http://pllysun.top:7500/api/problem/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('获取题目详情失败');
    }

    const data = await response.json();

    // 处理API返回的数据
    if (data.data) {
      const problemData = data.data;
      problem.value = {
        id: problemData.id || '',
        problemId: problemData.problemId || '',
        title: problemData.title || '',
        difficulty: problemData.difficultyLevel?.level || '',
        difficultyLabel: getDifficultyLabel(problemData.difficultyLevel),
        acceptRate: problemData.acceptRate || '0%',
        submissionCount: problemData.submissionCount || '0',
        tags: problemData.tags || [],
        content: problemData.content || '',
        examples: problemData.examples || [],
        hints: problemData.hints || [],
        constraints: problemData.constraints || []
      };
    } else {
      // 如果没有data字段，则假设response本身就是数据
      problem.value = {
        id: data.id || '',
        problemId: data.problemId || '',
        title: data.title || '',
        difficulty: data.difficultyLevel?.level || '',
        difficultyLabel: getDifficultyLabel(data.difficultyLevel),
        acceptRate: data.acceptRate || '0%',
        submissionCount: data.submissionCount || '0',
        tags: data.tags || [],
        content: data.content || '',
        examples: data.examples || [],
        hints: data.hints || [],
        constraints: data.constraints || []
      };
    }
  } catch (error) {
    console.error('获取题目详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 根据难度对象获取难度标签
const getDifficultyLabel = (difficultyLevel) => {
  if (!difficultyLevel) {
    return { difficulty: '未知', class: 'bg-gray-100 text-gray-800' };
  }
  
  const difficultyMap = {
    1: { difficulty: difficultyLevel.difficulty || '简单', class: 'bg-green-100 text-green-800' },
    2: { difficulty: difficultyLevel.difficulty || '中等', class: 'bg-yellow-100 text-yellow-800' },
    3: { difficulty: difficultyLevel.difficulty || '困难', class: 'bg-red-100 text-red-800' }
  };

  return difficultyMap[difficultyLevel.level] || { difficulty: difficultyLevel.difficulty || '未知', class: 'bg-gray-100 text-gray-800' };
};

// 页面加载时获取数据
onMounted(() => {
  fetchProblemDetail();
});
</script>

<template>
  <div>
    <NavBar />

    <!-- 主要内容 -->
    <div class="py-10">
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 题目导航 -->
          <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-t-lg shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <router-link to="/problems" class="text-indigo-600 hover:text-indigo-900">
                  <i class="fas fa-arrow-left mr-2"></i>返回题目列表
                </router-link>
              </div>
              <div class="flex space-x-2">
                <button type="button" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <i class="fas fa-thumbs-up mr-2"></i>
                  收藏
                </button>
                <button type="button" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <i class="fas fa-share-alt mr-2"></i>
                  分享
                </button>
              </div>
            </div>
          </div>

          <div v-if="loading" class="bg-white p-10 text-center">
            <div class="el-loading-spinner">
              <i class="el-icon-loading"></i>
              <p class="mt-2">加载中...</p>
            </div>
          </div>

          <div v-else class="bg-white shadow overflow-hidden sm:rounded-b-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-2xl font-bold leading-6 text-gray-900">{{ problem.problemId }}.{{ problem.title }}</h3>
                  <div class="mt-2 flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="problem.difficultyLabel.class">
                      {{ problem.difficultyLabel.difficulty }}
                    </span>
                    <span class="text-sm text-gray-500 ml-2">
                      <i class="fas fa-check-circle text-green-500 mr-1"></i>
                      通过率: {{ problem.acceptRate }}
                    </span>
                    <span class="mx-2 text-gray-300">|</span>
                    <span class="text-sm text-gray-500">
                      <i class="fas fa-users text-gray-400 mr-1"></i>
                      提交次数: {{ problem.submissionCount }}
                    </span>
                  </div>
                  <div class="mt-2">
                    <span v-for="(tag, index) in problem.tags" :key="index" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div>
                  <router-link :to="`/problems/${problem.id}/solve`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    开始解题
                  </router-link>
                </div>
              </div>
            </div>

            <!-- 题目内容 -->
            <div class="px-4 py-5 sm:p-6">
              <div class="prose max-w-none">
                <div class="mt-2 text-gray-600 markdown-content" v-html="renderedContent"></div>

                <h4 v-if="problem.examples && problem.examples.length > 0" class="mt-6 text-lg font-medium text-gray-900">示例</h4>
                <pre v-for="(example, index) in problem.examples" :key="index"><code>{{ example }}</code></pre>

                <h4 v-if="problem.constraints && problem.constraints.length > 0" class="mt-6 text-lg font-medium text-gray-900">提示</h4>
                <ul v-if="problem.constraints && problem.constraints.length > 0" class="list-disc pl-5 mt-2 text-gray-600">
                  <li v-for="(constraint, index) in problem.constraints" :key="index">{{ constraint }}</li>
                </ul>

                <h4 v-if="problem.hints && problem.hints.length > 0" class="mt-6 text-lg font-medium text-gray-900">进阶</h4>
                <p v-for="(hint, index) in problem.hints" :key="index" class="mt-2 text-gray-600">
                  {{ hint }}
                </p>
              </div>
            </div>

            <!-- 题解和讨论标签 -->
            <div class="border-t border-gray-200">
              <div class="px-4 py-5 sm:p-6">
                <div class="border-b border-gray-200">
                  <nav class="-mb-px flex space-x-8">
                    <a href="#" class="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                      题目描述
                    </a>
                    <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                      题解 <span class="ml-1 text-gray-400">(124)</span>
                    </a>
                    <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                      讨论 <span class="ml-1 text-gray-400">(56)</span>
                    </a>
                    <a href="#" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                      提交记录
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          <!-- 相似题目 -->
          <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">相似题目</h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <ul class="divide-y divide-gray-200">
                <li class="py-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <router-link to="/problems/15" class="text-indigo-600 hover:text-indigo-900">15. 三数之和</router-link>
                      <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        中等
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">
                      <i class="fas fa-check-circle text-green-500 mr-1"></i>
                      已解决
                    </div>
                  </div>
                </li>
                <li class="py-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <router-link to="/problems/18" class="text-indigo-600 hover:text-indigo-900">18. 四数之和</router-link>
                      <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        中等
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">
                      <i class="fas fa-times-circle text-red-500 mr-1"></i>
                      未解决
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 添加必要的样式 */
pre {
  background-color: #f7fafc;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
}

code {
  font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* 确保v-html渲染的内容样式正确 */
:deep(.prose) {
  max-width: none;
}

/* Markdown内容样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content :deep(p) {
  margin-top: 0;
  margin-bottom: 1em;
}

/* 减少markdown内容与上方的距离 */
.markdown-content {
  margin-top: -2rem; /* 设置为负值，进一步减小与上方元素的间距 */
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 1em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-content :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 1em 0;
}
</style>
