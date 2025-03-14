<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';

const route = useRoute();
const problemId = route.params.id;

// 模拟题目详情数据
const problem = ref({
  id: Number(problemId),
  title: '',
  difficulty: '',
  tags: [],
  description: '',
  examples: [],
  constraints: [],
  passRate: '',
  submissionCount: 0
});

// 模拟获取题目详情数据
onMounted(() => {
  // 在实际应用中，这里会调用API获取题目详情
  // 模拟数据
  if (problemId === '1') {
    problem.value = {
      id: 1,
      title: '两数之和',
      difficulty: '简单',
      tags: ['数组', '哈希表'],
      description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。你可以按任意顺序返回答案。',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: '因为 nums[1] + nums[2] == 6 ，返回 [1, 2] 。'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        '只会存在一个有效答案'
      ],
      passRate: '48%',
      submissionCount: 12500
    };
  } else if (problemId === '2') {
    problem.value = {
      id: 2,
      title: '无重复字符的最长子串',
      difficulty: '中等',
      tags: ['字符串', '滑动窗口'],
      description: '给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。',
      examples: [
        {
          input: 's = "abcabcbb"',
          output: '3',
          explanation: '因为无重复字符的最长子串是 "abc"，所以其长度为 3。'
        },
        {
          input: 's = "bbbbb"',
          output: '1',
          explanation: '因为无重复字符的最长子串是 "b"，所以其长度为 1。'
        }
      ],
      constraints: [
        '0 <= s.length <= 5 * 10^4',
        's 由英文字母、数字、符号和空格组成'
      ],
      passRate: '36%',
      submissionCount: 9800
    };
  } else {
    // 默认数据
    problem.value = {
      id: Number(problemId),
      title: `题目 ${problemId}`,
      difficulty: '中等',
      tags: ['数组', '算法'],
      description: '这是题目描述...',
      examples: [
        {
          input: '示例输入',
          output: '示例输出',
          explanation: '解释'
        }
      ],
      constraints: ['约束条件'],
      passRate: '35%',
      submissionCount: 5000
    };
  }
});

// 代码编辑器内容
const code = ref('// 请在这里编写你的代码\n');

// 提交代码
const submitCode = () => {
  console.log('提交代码:', code.value);
  // 实际应用中，这里会调用API提交代码
};

// 运行代码
const runCode = () => {
  console.log('运行代码:', code.value);
  // 实际应用中，这里会调用API运行代码
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    
    <!-- 主要内容 -->
    <div class="py-10">
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- 题目标题和信息 -->
          <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-t-lg shadow-sm">
            <div class="flex flex-wrap items-center justify-between sm:flex-nowrap">
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ problem.id }}. {{ problem.title }}
                </h1>
                <div class="mt-2 flex flex-wrap items-center">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 my-1" 
                    :class="{
                      'bg-green-100 text-green-800': problem.difficulty === '简单',
                      'bg-yellow-100 text-yellow-800': problem.difficulty === '中等',
                      'bg-red-100 text-red-800': problem.difficulty === '困难'
                    }"
                  >
                    {{ problem.difficulty }}
                  </span>
                  <span 
                    v-for="(tag, index) in problem.tags" 
                    :key="index"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 my-1"
                  >
                    {{ tag }}
                  </span>
                  <span class="text-sm text-gray-500 mr-4 my-1">
                    通过率: {{ problem.passRate }}
                  </span>
                  <span class="text-sm text-gray-500 my-1">
                    提交次数: {{ problem.submissionCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 左侧：题目描述 -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">题目描述</h3>
              </div>
              <div class="px-4 py-5 sm:p-6">
                <p class="text-base text-gray-700 whitespace-pre-line">{{ problem.description }}</p>
                
                <div class="mt-6">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">示例:</h4>
                  <div v-for="(example, index) in problem.examples" :key="index" class="mb-4 bg-gray-50 p-4 rounded-md">
                    <div class="mb-2">
                      <span class="font-medium">输入:</span> <code class="bg-gray-100 px-2 py-1 rounded">{{ example.input }}</code>
                    </div>
                    <div class="mb-2">
                      <span class="font-medium">输出:</span> <code class="bg-gray-100 px-2 py-1 rounded">{{ example.output }}</code>
                    </div>
                    <div v-if="example.explanation">
                      <span class="font-medium">解释:</span> {{ example.explanation }}
                    </div>
                  </div>
                </div>
                
                <div class="mt-6">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">约束:</h4>
                  <ul class="list-disc pl-5 space-y-1">
                    <li v-for="(constraint, index) in problem.constraints" :key="index" class="text-gray-700">
                      {{ constraint }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- 右侧：代码编辑器 -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">代码编辑器</h3>
                  <div>
                    <select class="mr-2 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md">
                      <option>JavaScript</option>
                      <option>Python</option>
                      <option>Java</option>
                      <option>C++</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="p-0">
                <textarea 
                  v-model="code" 
                  class="w-full h-96 font-mono text-sm p-4 bg-gray-800 text-gray-100 focus:outline-none"
                  spellcheck="false"
                ></textarea>
              </div>
              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button 
                  @click="runCode"
                  type="button" 
                  class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                >
                  运行
                </button>
                <button 
                  @click="submitCode"
                  type="button" 
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  提交
                </button>
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