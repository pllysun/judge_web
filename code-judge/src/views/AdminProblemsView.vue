<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// 题目列表数据
const problems = ref([
  {
    id: 1,
    title: '两数之和',
    difficulty: 'easy',
    tags: ['数组', '哈希表'],
    passRate: '65.4%',
    createTime: '2023-01-10'
  },
  {
    id: 2,
    title: '最长回文子串',
    difficulty: 'medium',
    tags: ['字符串', '动态规划'],
    passRate: '32.1%',
    createTime: '2023-01-15'
  },
  {
    id: 3,
    title: '无重复字符的最长子串',
    difficulty: 'medium',
    tags: ['字符串', '滑动窗口'],
    passRate: '36.5%',
    createTime: '2023-01-18'
  }
])

// 搜索关键词
const searchKeyword = ref('')

// 筛选题目
const filteredProblems = computed(() => {
  if (!searchKeyword.value) return problems.value

  const keyword = searchKeyword.value.toLowerCase()
  return problems.value.filter(problem =>
    problem.title.toLowerCase().includes(keyword) ||
    problem.id.toString().includes(keyword) ||
    problem.tags.some(tag => tag.toLowerCase().includes(keyword))
  )
})

// 查看题目详情
function viewProblem(problemId: number) {
  console.log('查看题目详情:', problemId)
  // 实际项目中这里应该跳转到题目详情页或打开详情弹窗
}

// 编辑题目
function editProblem(problemId: number) {
  console.log('编辑题目:', problemId)
  // 实际项目中这里应该跳转到题目编辑页或打开编辑弹窗
}

// 管理标签
function manageTags(problemId: number) {
  console.log('管理标签:', problemId)
  // 实际项目中这里应该打开标签管理弹窗
}

// 删除题目
function deleteProblem(problemId: number) {
  console.log('删除题目:', problemId)
  // 实际项目中这里应该调用删除题目API
}

// 创建题目
function createProblem() {
  console.log('创建题目')
  // 实际项目中这里应该跳转到创建题目页或打开创建题目弹窗
}


</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h2 class="text-lg leading-6 font-medium text-gray-900">题目管理</h2>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">管理系统题目、标签和难度设置</p>
      </div>
      <div class="flex space-x-3">
        <div class="relative">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="搜索题目"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <button
          type="button"
          @click="createProblem"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          创建题目
        </button>
      </div>
    </div>
    <div class="border-t border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                题目ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                题目名称
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                难度
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                标签
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                通过率
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                创建时间
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="problem in filteredProblems" :key="problem.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ problem.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ problem.title }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': problem.difficulty === 'easy',
                    'bg-yellow-100 text-yellow-800': problem.difficulty === 'medium',
                    'bg-red-100 text-red-800': problem.difficulty === 'hard'
                  }"
                >
                  {{
                    problem.difficulty === 'easy' ? '简单' :
                    problem.difficulty === 'medium' ? '中等' : '困难'
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(tag, index) in problem.tags"
                    :key="index"
                    class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ problem.passRate }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ problem.createTime }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    type="button"
                    @click="viewProblem(problem.id)"
                    class="text-indigo-600 hover:text-indigo-900"
                    title="查看详情"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fill-rule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="editProblem(problem.id)"
                    class="text-blue-600 hover:text-blue-900"
                    title="编辑题目"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="manageTags(problem.id)"
                    class="text-yellow-600 hover:text-yellow-900"
                    title="管理标签"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="deleteProblem(problem.id)"
                    class="text-red-600 hover:text-red-900"
                    title="删除题目"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>