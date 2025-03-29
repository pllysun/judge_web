<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import NavBar from '../components/NavBar.vue';
import { problemApi } from '../services/problemService';

// 题目数据
const problems = ref([]);

// 加载状态
const loading = ref(false);

// 分页参数
const pagination = reactive({
  page: 0,
  size: 10,
  total: 0
});

// 获取题目列表
const fetchProblems = async () => {
  try {
    loading.value = true;
    // 这里假设后端API支持分页参数，如果不支持，需要在后端实现
    const response = await problemApi.getProblemList({
      page: pagination.page,
      size: pagination.size,
      searchQuery: searchQuery.value,
      difficultyFilter: difficultyFilter.value,
      tagFilter: selectedTags.value
    });
    if (response.data) {
      problems.value = response.data.list || [];
      pagination.total = response.data.total || problems.value.length;
    } else {
      problems.value = response.list || [];
      pagination.total = response.total || problems.value.length;
    }
  } catch (error) {
    console.error('获取题目列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (newPage) => {
  pagination.page = newPage;
  fetchProblems();
};

// 计算题号
const getQuestionNumber = (index) => {
  return pagination.page * pagination.size + index + 1;
};

// 获取所有标签
const fetchTags = async () => {
  try {
    const response = await problemApi.getAllTags();
    // 处理API返回的标签数据格式
    // 检查response是否有data字段，如果有则使用data
    // 如果没有data字段，则假设response本身就是标签数组
    if (response.data) {
      tagList.value = response.data || [];
    } else {
      tagList.value = response || [];
    }
  } catch (error) {
    console.error('获取标签列表失败:', error);
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchProblems();
  fetchTags();
});

// 筛选条件
const searchQuery = ref('');
const difficultyFilter = ref('');
// 改为数组，支持多选标签
const selectedTags = ref([]);

// 标签列表
const tagList = ref([]);

// 已选筛选条件列表
const selectedFilters = ref([]);

// 添加难度筛选条件
const addDifficultyFilter = (difficulty) => {
  if (difficultyFilter.value === difficulty) return;

  // 移除旧的难度筛选条件
  selectedFilters.value = selectedFilters.value.filter(filter => filter.type !== 'difficulty');

  // 添加新的难度筛选条件
  if (difficulty) {
    selectedFilters.value.push({
      type: 'difficulty',
      value: difficulty,
      label: difficulty
    });
  }

  difficultyFilter.value = difficulty;
};

// 添加标签筛选条件
const addTagFilter = (tag) => {
  if (selectedTags.value.includes(tag)) return;

  selectedTags.value.push(tag);
  selectedFilters.value.push({
    type: 'tag',
    value: tag,
    label: tag
  });
};

// 移除筛选条件
const removeFilter = (filter) => {
  const index = selectedFilters.value.findIndex(f => f.type === filter.type && f.value === filter.value);
  if (index !== -1) {
    selectedFilters.value.splice(index, 1);

    if (filter.type === 'difficulty') {
      difficultyFilter.value = '';
    } else if (filter.type === 'tag') {
      const tagIndex = selectedTags.value.indexOf(filter.value);
      if (tagIndex !== -1) {
        selectedTags.value.splice(tagIndex, 1);
      }
    }
  }
};

// 监听筛选条件变化，自动触发查询
watch([searchQuery, difficultyFilter, selectedTags], () => {
  // 延迟300ms再查询，避免频繁请求
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    fetchProblems();
  }, 300);
}, { deep: true });

// 用于防抖的定时器
let searchDebounce = null;

// 获取难度级别对应的显示文本
const getDifficultyText = (difficultyObj) => {
  if (!difficultyObj) return '未知';

  // 如果是字符串（兼容旧数据格式）
  if (typeof difficultyObj === 'string') {
    switch (difficultyObj) {
      case 'EASY': return '简单';
      case 'MEDIUM': return '中等';
      case 'HARD': return '困难';
      default: return difficultyObj;
    }
  }

  // 如果是对象，使用displayText
  if (difficultyObj.displayText) {
    return difficultyObj.displayText;
  }

  // 兜底返回
  return difficultyObj.difficulty || '未知';
};

// 格式化通过率
const formatAcceptanceRate = (rate) => {
  if (rate === null || rate === undefined) return '0%';
  return `${(rate * 100).toFixed(1)}%`;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <!-- 主要内容 -->
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">题目列表</h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 筛选器 -->
          <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-t-lg shadow-sm mt-6">
            <div class="flex flex-wrap items-center justify-between sm:flex-nowrap">
              <div class="flex-1 min-w-0">
                <!-- 移除了"筛选"文本 -->
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 items-center">
              <div class="relative w-full sm:w-auto">
                <i class="fas fa-signal text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></i>
                <select
                  @change="addDifficultyFilter($event.target.value)"
                  class="block w-full sm:w-auto pl-10 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm transition duration-150 ease-in-out"
                >
                  <option value="">难度</option>
                  <option value="简单">简单</option>
                  <option value="中等">中等</option>
                  <option value="困难">困难</option>
                </select>
              </div>

              <div class="relative w-full sm:w-auto">
                <i class="fas fa-tag text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></i>
                <select
                  @change="addTagFilter($event.target.value); $event.target.value = '';"
                  class="block w-full sm:w-auto pl-10 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm transition duration-150 ease-in-out"
                >
                  <option value="">标签</option>
                  <option v-for="tag in tagList" :key="tag" :value="tag">{{ tag }}</option>
                </select>
              </div>

              <div class="relative ml-auto w-full sm:w-64 md:w-72">
                <div class="flex items-center">
                  <i class="fas fa-search text-gray-400 absolute left-3"></i>
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="搜索题目"
                    class="pl-10 pr-4 py-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm border-gray-300 rounded-md transition duration-150 ease-in-out"
                  >
                </div>
              </div>
            </div>

            <!-- 已选筛选条件展示区 -->
            <div v-if="selectedFilters.length > 0" class="mt-4 flex flex-wrap gap-2">
              <div
                v-for="(filter, index) in selectedFilters"
                :key="index"
                class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium"
                :class="{
                  'bg-blue-100 text-blue-800': filter.type === 'tag',
                  'bg-green-100 text-green-800': filter.type === 'difficulty' && filter.value === '简单',
                  'bg-yellow-100 text-yellow-800': filter.type === 'difficulty' && filter.value === '中等',
                  'bg-red-100 text-red-800': filter.type === 'difficulty' && filter.value === '困难'
                }"
              >
                {{ filter.label }}
                <button
                  @click="removeFilter(filter)"
                  type="button"
                  class="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                >
                  <span class="sr-only">移除筛选条件</span>
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 题目表格 -->
          <div class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-b-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          题号
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          标题
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          难度
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          提交总数
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          通过率
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(problem, index) in problems" :key="problem.id" class="hover:bg-gray-50 cursor-pointer" @click="$router.push(`/problems/${problem.id}`)">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ problem.problemId }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <router-link :to="`/problems/${problem.id}`" class="text-indigo-600 hover:text-indigo-900">{{ problem.title }}</router-link>
                          <div class="mt-1">
                            <span
                              v-for="(tag, index) in problem.tags ? problem.tags.slice(0, 3) : []"
                              :key="index"
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1"
                            >
                              {{ tag }}
                            </span>
                            <span
                              v-if="problem.tags && problem.tags.length > 3"
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-1"
                            >
                              +{{ problem.tags.length - 3 }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="{
                              'bg-green-100 text-green-800': problem.difficultyLevel?.difficulty === '简单' || problem.difficultyLevel === 'EASY' || (problem.difficultyLevel?.level && problem.difficultyLevel.level === 1),
                              'bg-yellow-100 text-yellow-800': problem.difficultyLevel?.difficulty === '中等' || problem.difficultyLevel === 'MEDIUM' || (problem.difficultyLevel?.level && problem.difficultyLevel.level === 2),
                              'bg-red-100 text-red-800': problem.difficultyLevel?.difficulty === '困难' || problem.difficultyLevel === 'HARD' || (problem.difficultyLevel?.level && problem.difficultyLevel.level === 3)
                            }"
                          >
                            {{ getDifficultyText(problem.difficultyLevel) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ problem.submissionCount || 0 }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ formatAcceptanceRate(problem.acceptanceRate) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页控件 -->
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-b-lg shadow-sm">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="pagination.page > 0 && (pagination.page--)"
                :disabled="pagination.page === 0"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                :class="{'opacity-50 cursor-not-allowed': pagination.page === 0}"
              >
                上一页
              </button>
              <button
                @click="(pagination.page + 1) * pagination.size < pagination.total && pagination.page++"
                :disabled="(pagination.page + 1) * pagination.size >= pagination.total"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                :class="{'opacity-50 cursor-not-allowed': (pagination.page + 1) * pagination.size >= pagination.total}"
              >
                下一页
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  显示第
                  <span class="font-medium">{{ pagination.page * pagination.size + 1 }}</span>
                  到
                  <span class="font-medium">{{ Math.min((pagination.page + 1) * pagination.size, pagination.total) }}</span>
                  条，共
                  <span class="font-medium">{{ pagination.total }}</span>
                  条结果
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    @click="pagination.page > 0 && (pagination.page--)"
                    :disabled="pagination.page === 0"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    :class="{'opacity-50 cursor-not-allowed': pagination.page === 0}"
                  >
                    <span class="sr-only">上一页</span>
                    <i class="fas fa-chevron-left h-5 w-5"></i>
                  </button>
                  <!-- 页码按钮 -->
                  <button
                    v-for="pageNumber in Math.ceil(pagination.total / pagination.size)"
                    :key="pageNumber"
                    @click="pagination.page = pageNumber - 1"
                    :class="{
                      'z-10 bg-indigo-500 border-indigo-500 text-indigo-600': pagination.page === pageNumber - 1,
                      'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': pagination.page !== pageNumber - 1
                    }"
                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    {{ pageNumber }}
                  </button>
                  <button
                    @click="(pagination.page + 1) * pagination.size < pagination.total && pagination.page++"
                    :disabled="(pagination.page + 1) * pagination.size >= pagination.total"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    :class="{'opacity-50 cursor-not-allowed': (pagination.page + 1) * pagination.size >= pagination.total}"
                  >
                    <span class="sr-only">下一页</span>
                    <i class="fas fa-chevron-right h-5 w-5"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 添加Font Awesome图标支持 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
</style>
