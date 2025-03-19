<script setup lang="ts">
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';

// 模拟讨论数据
const discussions = ref([
  {
    id: 1,
    title: '如何优化动态规划解法？',
    author: '张三',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: '题解讨论',
    createTime: '2023-06-10 14:23',
    replies: 15,
    views: 342,
    likes: 28
  },
  {
    id: 2,
    title: '【官方公告】平台新功能上线通知',
    author: '管理员',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: '站务公告',
    createTime: '2023-06-08 10:00',
    replies: 8,
    views: 1024,
    likes: 56
  },
  {
    id: 3,
    title: '求助：JavaScript中如何处理大数问题？',
    author: '李四',
    avatar: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: '求助问答',
    createTime: '2023-06-07 16:45',
    replies: 12,
    views: 256,
    likes: 18
  },
  {
    id: 4,
    title: '分享：我的刷题心得与技巧总结',
    author: '王五',
    avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: '技术交流',
    createTime: '2023-06-05 09:30',
    replies: 32,
    views: 876,
    likes: 124
  },
  {
    id: 5,
    title: '「两数之和」题解与多种实现方式分析',
    author: '赵六',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: '题解讨论',
    createTime: '2023-06-03 20:15',
    replies: 24,
    views: 567,
    likes: 89
  }
]);

// 筛选条件
const categoryFilter = ref('');
const sortBy = ref('latest');

// 应用筛选
const applyFilters = () => {
  // 实际应用中，这里会调用API获取筛选后的数据
  console.log('应用筛选:', {
    categoryFilter: categoryFilter.value,
    sortBy: sortBy.value
  });
};

// 获取分类样式
const getCategoryClass = (category) => {
  switch (category) {
    case '题解讨论':
      return 'bg-blue-100 text-blue-800';
    case '技术交流':
      return 'bg-green-100 text-green-800';
    case '求助问答':
      return 'bg-yellow-100 text-yellow-800';
    case '站务公告':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
          <h1 class="text-3xl font-bold leading-tight text-gray-900">讨论区</h1>
          <p class="mt-1 text-sm text-gray-600">与其他开发者交流编程技巧和解题思路</p>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 筛选器和发布按钮 -->
          <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-t-lg shadow-sm mt-6">
            <div class="flex flex-wrap items-center justify-between sm:flex-nowrap">
              <div>
                <div class="flex flex-wrap gap-2">
                  <select
                    v-model="categoryFilter"
                    class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">所有分类</option>
                    <option value="题解讨论">题解讨论</option>
                    <option value="技术交流">技术交流</option>
                    <option value="求助问答">求助问答</option>
                    <option value="站务公告">站务公告</option>
                  </select>
                  <select
                    v-model="sortBy"
                    class="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="latest">最新发布</option>
                    <option value="most_replies">最多回复</option>
                    <option value="most_likes">最多点赞</option>
                    <option value="most_views">最多浏览</option>
                  </select>
                </div>
              </div>
              <div class="flex-shrink-0">
                <router-link
                  to="/discussions/create"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <i class="fas fa-plus mr-2"></i> 发布讨论
                </router-link>
              </div>
            </div>
          </div>

          <!-- 讨论列表 -->
          <div class="bg-white shadow overflow-hidden sm:rounded-b-lg">
            <ul class="divide-y divide-gray-200">
              <li v-for="discussion in discussions" :key="discussion.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col flex-grow">
                    <div class="flex items-center">
                      <router-link :to="`/discussions/${discussion.id}`" class="text-lg font-medium text-indigo-600 truncate hover:underline">
                        {{ discussion.title }}
                      </router-link>
                      <span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getCategoryClass(discussion.category)">
                        {{ discussion.category }}
                      </span>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                        <div class="flex items-center text-sm text-gray-500">
                          <img class="h-6 w-6 rounded-full mr-2" :src="discussion.avatar" :alt="discussion.author">
                          {{ discussion.author }}
                        </div>
                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <i class="far fa-clock flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"></i>
                          {{ discussion.createTime }}
                        </div>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div class="mr-4">
                          <i class="far fa-comment flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"></i>
                          {{ discussion.replies }}
                        </div>
                        <div class="mr-4">
                          <i class="far fa-eye flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"></i>
                          {{ discussion.views }}
                        </div>
                        <div>
                          <i class="far fa-thumbs-up flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"></i>
                          {{ discussion.likes }}
                        </div>
                      </div>
                    </div>
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