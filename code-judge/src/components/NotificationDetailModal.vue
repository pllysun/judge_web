<script setup lang="ts">
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'

// 初始化markdown-it实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 定义组件接收的属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  notification: {
    type: Object,
    default: () => ({})
  }
})

// 定义组件发出的事件
const emit = defineEmits(['update:visible', 'close'])

// 关闭弹窗
function closeModal() {
  emit('update:visible', false)
  emit('close')
}

// 获取通知内容并转换为HTML
const renderedContent = computed(() => {
  const content = props.notification.content || ''
  return md.render(content)
})
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-gray-900/60 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 backdrop-blur-sm transition-opacity duration-300" @click="closeModal"></div>
      </div>

      <!-- 弹窗内容 -->
      <div
        class="inline-block align-middle rounded-xl text-center shadow-2xl transform transition-all duration-300 ease-out sm:my-8 sm:max-w-4xl md:max-w-6xl w-full overflow-hidden min-h-[400px] border border-gray-200 scale-100 opacity-100"
      >
        <div class="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <h3 class="text-xl font-bold text-white">{{ notification.title }}</h3>
          <button 
            @click="closeModal" 
            class="text-white/80 hover:text-white focus:outline-none transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="bg-white px-6 py-8">
          <!-- 通知内容区域 -->
          <div class="text-left px-4 py-2 max-h-[600px] overflow-y-auto min-h-[300px] prose prose-indigo max-w-none">
            <div v-html="renderedContent" class="markdown-content"></div>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-4 sm:px-6 flex justify-end">
          <button
            type="button"
            class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2.5 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 sm:text-sm hover:scale-105"
            @click="closeModal"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义过渡效果 */
.transition-all {
  transition-property: all;
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

.markdown-content :deep(h1) {
  font-size: 2rem;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #6b7280;
}

.markdown-content :deep(pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
}

.markdown-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}
</style>
