<script setup lang="ts">
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';

// 模拟题目数据
const problems = ref([
  {
    id: 1,
    title: '两数之和',
    difficulty: '简单',
    tags: ['数组', '哈希表'],
    status: 'solved',
    passRate: '48%'
  },
  {
    id: 2,
    title: '无重复字符的最长子串',
    difficulty: '中等',
    tags: ['字符串', '滑动窗口'],
    status: 'solved',
    passRate: '36%'
  },
  {
    id: 3,
    title: '寻找两个正序数组的中位数',
    difficulty: '困难',
    tags: ['数组', '二分查找', '分治'],
    status: 'unsolved',
    passRate: '28%'
  },
  {
    id: 4,
    title: '最长回文子串',
    difficulty: '中等',
    tags: ['字符串', '动态规划'],
    status: 'attempted',
    passRate: '32%'
  },
  {
    id: 5,
    title: '正则表达式匹配',
    difficulty: '困难',
    tags: ['字符串', '动态规划', '回溯'],
    status: 'unsolved',
    passRate: '25%'
  }
]);

// 筛选条件
const searchQuery = ref('');
const difficultyFilter = ref('');
const tagFilter = ref('');
const statusFilter = ref('');

// 应用筛选
const applyFilters = () => {
  // 实际应用中，这里会调用API获取筛选后的数据
  console.log('应用筛选:', {
    searchQuery: searchQuery.value,
    difficultyFilter: difficultyFilter.value,
    tagFilter: tagFilter.value,
    statusFilter: statusFilter.value
  });
};

// 重置筛选
const resetFilters = () => {
  searchQuery.value = '';
  difficultyFilter.value = '';
  tagFilter.value = '';
  statusFilter.value = '';
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
                <h3 class="text-lg leading-6 font-medium text-gray-900">筛选</h3>
              </div>
              <div class="flex-shrink-0">
                <div class="relative">
                  <input 
                    type="text" 
                    v-model="searchQuery"
                    placeholder="搜索题目" 
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                </div>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <select 
                v-model="difficultyFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">难度</option>
                <option value="简单">简单</option>
                <option value="中等">中等</option>
                <option value="困难">困难</option>
              </select>
              <select 
                v-model="tagFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">标签</option>
                <option value="数组">数组</option>
                <option value="字符串">字符串</option>
                <option value="链表">链表</option>
                <option value="树">树</option>
                <option value="动态规划">动态规划</option>
              </select>
              <select 
                v-model="statusFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">状态</option>
                <option value="solved">已解决</option>
                <option value="unsolved">未尝试</option>
                <option value="attempted">尝试过</option>
              </select>
              <button 
                @click="applyFilters"
                type="button" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                应用筛选
              </button>
              <button 
                @click="resetFilters"
                type="button" 
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                重置
              </button>
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
                          状态
                        </th>
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
                          通过率
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="problem in problems" :key="problem.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span v-if="problem.status === 'solved'" class="text-green-500"><i class="fas fa-check-circle"></i></span>
                          <span v-else-if="problem.status === 'attempted'" class="text-yellow-500"><i class="fas fa-exclamation-circle"></i></span>
                          <span v-else class="text-gray-400"><i class="far fa-circle"></i></span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ problem.id }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <router-link :to="`/problems/${problem.id}`" class="text-indigo-600 hover:text-indigo-900">{{ problem.title }}</router-link>
                          <div class="mt-1">
                            <span 
                              v-for="(tag, index) in problem.tags" 
                              :key="index"
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1"
                            >
                              {{ tag }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span 
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                            :class="{
                              'bg-green-100 text-green-800': problem.difficulty === '简单',
                              'bg-yellow-100 text-yellow-800': problem.difficulty === '中等',
                              'bg-red-100 text-red-800': problem.difficulty === '困难'
                            }"
                          >
                            {{ problem.difficulty }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ problem.passRate }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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