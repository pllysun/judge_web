<script setup lang="ts">
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';

// 模拟竞赛数据
const contests = ref([
  {
    id: 1,
    title: '每周算法竞赛 #123',
    startTime: '2023-06-10 20:00',
    endTime: '2023-06-10 22:00',
    status: 'ongoing',
    participants: 1245,
    type: '周赛'
  },
  {
    id: 2,
    title: '双周算法竞赛 #45',
    startTime: '2023-06-17 20:00',
    endTime: '2023-06-17 22:00',
    status: 'upcoming',
    participants: 0,
    type: '双周赛'
  },
  {
    id: 3,
    title: '春季编程大赛',
    startTime: '2023-05-20 10:00',
    endTime: '2023-05-20 15:00',
    status: 'finished',
    participants: 3567,
    type: '特别竞赛'
  },
  {
    id: 4,
    title: '每周算法竞赛 #122',
    startTime: '2023-06-03 20:00',
    endTime: '2023-06-03 22:00',
    status: 'finished',
    participants: 1198,
    type: '周赛'
  },
  {
    id: 5,
    title: '新手入门赛',
    startTime: '2023-06-15 19:00',
    endTime: '2023-06-15 21:00',
    status: 'upcoming',
    participants: 0,
    type: '特别竞赛'
  }
]);

// 筛选条件
const statusFilter = ref('');
const typeFilter = ref('');

// 应用筛选
const applyFilters = () => {
  // 实际应用中，这里会调用API获取筛选后的数据
  console.log('应用筛选:', {
    statusFilter: statusFilter.value,
    typeFilter: typeFilter.value
  });
};

// 重置筛选
const resetFilters = () => {
  statusFilter.value = '';
  typeFilter.value = '';
};

// 获取竞赛状态文本和样式
const getStatusInfo = (status) => {
  switch (status) {
    case 'ongoing':
      return { text: '进行中', class: 'bg-green-100 text-green-800' };
    case 'upcoming':
      return { text: '即将开始', class: 'bg-blue-100 text-blue-800' };
    case 'finished':
      return { text: '已结束', class: 'bg-gray-100 text-gray-800' };
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
          <h1 class="text-3xl font-bold leading-tight text-gray-900">竞赛列表</h1>
          <p class="mt-1 text-sm text-gray-600">参加编程竞赛，挑战自我，提升技能</p>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 筛选器 -->
          <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-t-lg shadow-sm mt-6">
            <div class="flex flex-wrap gap-2">
              <select
                v-model="statusFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有状态</option>
                <option value="upcoming">即将开始</option>
                <option value="ongoing">进行中</option>
                <option value="finished">已结束</option>
              </select>
              <select
                v-model="typeFilter"
                class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有类型</option>
                <option value="周赛">周赛</option>
                <option value="双周赛">双周赛</option>
                <option value="特别竞赛">特别竞赛</option>
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

          <!-- 竞赛列表 -->
          <div class="bg-white shadow overflow-hidden sm:rounded-b-lg">
            <ul class="divide-y divide-gray-200">
              <li v-for="contest in contests" :key="contest.id" class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col flex-grow">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-indigo-600 truncate">{{ contest.title }}</p>
                      <p class="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full" :class="getStatusInfo(contest.status).class">
                        {{ getStatusInfo(contest.status).text }}
                      </p>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                        <p class="flex items-center text-sm text-gray-500">
                          <i class="fas fa-calendar-alt flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"></i>
                          {{ contest.startTime }} - {{ contest.endTime }}
                        </p>
                        <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <i class="fas fa-users flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"></i>
                          {{ contest.participants }} 人参与
                        </p>
                        <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <i class="fas fa-tag flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"></i>
                          {{ contest.type }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <router-link
                      :to="`/contests/${contest.id}`"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {{ contest.status === 'finished' ? '查看详情' : '参加竞赛' }}
                    </router-link>
                  </div>
                </div>
              </li>
            </ul>
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