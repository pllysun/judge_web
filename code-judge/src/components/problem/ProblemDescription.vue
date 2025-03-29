<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

// 初始化markdown-it实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const props = defineProps({
  problem: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      problemId: '',
      title: '',
      difficulty: '',
      difficultyLevel: null,
      acceptRate: '0%',
      submissionCount: '0',
      tags: [],
      content: '',
      examples: [],
      hints: [],
      constraints: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 获取难度标签对象（包含文本和样式类）
const difficultyLabel = computed(() => {
  const difficultyObj = props.problem.difficultyLevel;
  if (!difficultyObj) {
    return { difficulty: '未知', class: 'bg-gray-100 text-gray-800' };
  }
  
  // 如果是字符串（兼容旧数据格式）
  if (typeof difficultyObj === 'string') {
    const difficultyMap = {
      'EASY': { difficulty: '简单', class: 'bg-green-100 text-green-800' },
      'MEDIUM': { difficulty: '中等', class: 'bg-yellow-100 text-yellow-800' },
      'HARD': { difficulty: '困难', class: 'bg-red-100 text-red-800' }
    };
    return difficultyMap[difficultyObj] || { difficulty: difficultyObj, class: 'bg-gray-100 text-gray-800' };
  }
  
  // 如果是对象，根据level属性判断
  if (difficultyObj.level) {
    const difficultyMap = {
      1: { difficulty: difficultyObj.difficulty || '简单', class: 'bg-green-100 text-green-800' },
      2: { difficulty: difficultyObj.difficulty || '中等', class: 'bg-yellow-100 text-yellow-800' },
      3: { difficulty: difficultyObj.difficulty || '困难', class: 'bg-red-100 text-red-800' }
    };
    return difficultyMap[difficultyObj.level] || { difficulty: difficultyObj.difficulty || '未知', class: 'bg-gray-100 text-gray-800' };
  }
  
  // 如果有displayText属性
  if (difficultyObj.displayText) {
    // 根据displayText判断颜色
    const textToClass = {
      '简单': 'bg-green-100 text-green-800',
      '中等': 'bg-yellow-100 text-yellow-800',
      '困难': 'bg-red-100 text-red-800'
    };
    return { 
      difficulty: difficultyObj.displayText, 
      class: textToClass[difficultyObj.displayText] || 'bg-gray-100 text-gray-800' 
    };
  }
  
  // 如果有difficulty属性
  if (difficultyObj.difficulty) {
    const textToClass = {
      '简单': 'bg-green-100 text-green-800',
      '中等': 'bg-yellow-100 text-yellow-800',
      '困难': 'bg-red-100 text-red-800'
    };
    return { 
      difficulty: difficultyObj.difficulty, 
      class: textToClass[difficultyObj.difficulty] || 'bg-gray-100 text-gray-800' 
    };
  }
  
  // 兜底返回
  return { difficulty: '未知', class: 'bg-gray-100 text-gray-800' };
});

// 渲染Markdown内容

// 渲染Markdown内容
const renderedContent = computed(() => {
  return md.render(props.problem.content || '');
});
</script>

<template>
  <div class="problem-description">
    <div class="flex items-center justify-between mb-4">
      <div>
        <router-link :to="`/problems/${problem.id}`" class="text-indigo-600 hover:text-indigo-900">
          <i class="fas fa-arrow-left mr-2"></i>返回题目
        </router-link>
      </div>
      <div>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="difficultyLabel.class">
          {{ difficultyLabel.difficulty }}
        </span>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-4">
      <i class="fas fa-spinner fa-spin text-indigo-500 mr-2"></i>
      <span>加载题目中...</span>
    </div>
    
    <div v-else>
      <h2 class="text-xl font-bold text-gray-900 mb-2">{{ problem.problemId }}. {{ problem.title }}</h2>
      
      <div class="mt-2 flex items-center">
        <span class="text-sm text-gray-500 mr-2">
          <i class="fas fa-check-circle text-green-500 mr-1"></i>
          通过率: {{ problem.acceptRate }}
        </span>
        <span class="mx-2 text-gray-300">|</span>
        <span class="text-sm text-gray-500">
          <i class="fas fa-users text-gray-400 mr-1"></i>
          提交次数: {{ problem.submissionCount }}
        </span>
      </div>
      
      <div class="mt-2 mb-4">
        <span v-for="(tag, index) in problem.tags" :key="index" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
          {{ tag }}
        </span>
      </div>
      
      <div class="prose max-w-none">
        <div class="markdown-content" v-html="renderedContent"></div>
        
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
  </div>
</template>

<style scoped>
.problem-description {
  height: 100%;
  overflow-y: auto;
}

.prose pre {
  background-color: #f7fafc;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
}

.prose code {
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