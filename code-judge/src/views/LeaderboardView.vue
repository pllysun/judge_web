<script setup lang="ts">
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';

// 模拟提交记录数据
const submissions = ref([
  {
    id: 1,
    problemId: 1,
    problemTitle: '两数之和',
    user: '张三',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'accepted',
    language: 'JavaScript',
    runtime: '76 ms',
    memory: '39.5 MB',
    submitTime: '2023-06-10 14:23'
  },
  {
    id: 2,
    problemId: 2,
    problemTitle: '无重复字符的最长子串',
    user: '李四',
    avatar: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'wrong_answer',
    language: 'Python',
    runtime: '- ms',
    memory: '- MB',
    submitTime: '2023-06-10 13:45'
  },
  {
    id: 3,
    problemId: 3,
    problemTitle: '寻找两个正序数组的中位数',
    user: '王五',
    avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'time_limit_exceeded',
    language: 'Java',
    runtime: '- ms',
    memory: '- MB',
    submitTime: '2023-06-10 12:30'
  },
  {
    id: 4,
    problemId: 1,
    problemTitle: '两数之和',
    user: '赵六',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'accepted',
    language: 'C++',
    runtime: '4 ms',
    memory: '8.9 MB',
    submitTime: '2023-06-10 11:20'
  },
  {
    id: 5,
    problemId: 4,
    problemTitle: '最长回文子串',
    user: '张三',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'compile_error',
    language: 'JavaScript',
    runtime: '- ms',
    memory: '- MB',
    submitTime: '2023-06-10 10:15'
  }
]);

// 筛选条件
const problemFilter = ref('');
const statusFilter = ref('');
const languageFilter = ref('');
const timeFilter = ref('');

// 应用筛选
const applyFilters = () => {
  // 实际应用中，这里会调用API获取筛选后的数据
  console.log('应用筛选:', {
    problemFilter: problemFilter.value,
    statusFilter: statusFilter.value,
    languageFilter: languageFilter.value,
    timeFilter: timeFilter.value
  });
};

// 重置筛选
const resetFilters = () => {
  problemFilter.value = '';
  statusFilter.value = '';
  languageFilter.value = '';
  timeFilter.value = '';
};

// 获取状态样式
const getStatusInfo = (status) => {
  switch (status) {
    case 'accepted':
      return { text: '通过', class: 'bg-green-100 text-green-800' };
    case 'wrong_answer':
      return { text: '答案错误', class: 'bg-red-100 text-red-800' };
    case 'time_limit_exceeded':
      return { text: '超时', class: 'bg-yellow-100 text-yellow-800' };
    case 'compile_error':
      return { text: '编译错误', class: 'bg-gray-100 text-gray-800' };
    default:
      return { text: '未知', class: 'bg-gray-100 text-gray-800' };
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <!-- 主要内容 -->
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">提交记录</h1>
          <p class="mt-1 text-sm text-gray-600">查看所有题目的提交情况和执行结果</p>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 筛选器 -->
          <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-t-lg shadow-sm mt-6">
            <div class="flex flex-wrap gap-2">
              <select
                v-model="problemFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有题目</option>
                <option value="1">两数之和</option>
                <option value="2">无重复字符的最长子串</option>
                <option value="3">寻找两个正序数组的中位数</option>
                <option value="4">最长回文子串</option>
              </select>
              <select
                v-model="statusFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有状态</option>
                <option value="accepted">通过</option>
                <option value="wrong_answer">错误</option>
                <option value="time_limit_exceeded">超时</option>
                <option value="compile_error">编译错误</option>
              </select>
              <select
                v-model="languageFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有语言</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="Go">Go</option>
              </select>
              <select
                v-model="timeFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有时间</option>
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
              </select>
              <button
                type="button"
                @click="applyFilters"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                应用筛选
              </button>
              <button
                type="button"
                @click="resetFilters"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                重置
              </button>
            </div>
          </div>

          <!-- 提交记录列表 -->
          <div class="bg-white shadow overflow-hidden sm:rounded-b-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">题目</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交者</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">语言</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">运行时间</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内存</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="submission in submissions" :key="submission.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusInfo(submission.status).class">
                      {{ getStatusInfo(submission.status).text }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link :to="`/problems/${submission.problemId}`" class="text-indigo-600 hover:text-indigo-900">
                      {{ submission.problemTitle }}
                    </router-link>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <img class="h-8 w-8 rounded-full" :src="submission.avatar" :alt="submission.user">
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ submission.user }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ submission.language }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ submission.runtime }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ submission.memory }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ submission.submitTime }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <router-link :to="`/submissions/${submission.id}`" class="text-indigo-600 hover:text-indigo-900">详情</router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
            <div class="flex-1 flex justify-between sm:hidden">
              <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                上一页
              </a>
              <a href="#" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                下一页
              </a>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  显示第 <span class="font-medium">1</span> 至 <span class="font-medium">5</span> 条，共 <span class="font-medium">12</span> 条结果
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">上一页</span>
                    <i class="fas fa-chevron-left h-5 w-5"></i>
                  </a>
                  <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</a>
                  <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</a>
                  <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
                  <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">下一页</span>
                    <i class="fas fa-chevron-right h-5 w-5"></i>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>