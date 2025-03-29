<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  selectedLanguage: {
    type: String,
    default: 'cpp'
  },
  languages: {
    type: Array,
    default: () => [
      { value: 'cpp', label: 'C++' },
      { value: 'c', label: 'C' },
      { value: 'java', label: 'Java' },
      { value: 'python', label: 'Python' },
      { value: 'javascript', label: 'JavaScript' }
    ]
  }
});

const emit = defineEmits(['update:selectedLanguage', 'run', 'submit', 'submit-success', 'switch-to-result']);

// 下拉菜单状态
const isOpen = ref(false);
const selectRef = ref(null);

// 选择语言
const selectLanguage = (value: string) => {
  emit('update:selectedLanguage', value);
  isOpen.value = false;
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

// 添加和移除点击事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 运行代码
const runCode = () => {
  emit('run');
  
  // 切换到结果标签页并显示执行结果（从TestCasePanel.vue迁移过来的功能）
  emit('switch-to-result');
};

// 提交代码
const submitCode = () => {
  emit('submit');
  
  // 监听提交结果，成功后跳转到提交详情页面
  emit('submit-success', (submissionId) => {
    if (submissionId) {
      // 使用router跳转到提交详情页面
      window.location.href = `/submissions/${submissionId}`;
    }
  });
};

// 获取语言对应的图标
const getLanguageIcon = (language: string): string => {
  const iconMap: Record<string, string> = {
    'javascript': 'fab fa-js-square',
    'python': 'fab fa-python',
    'java': 'fab fa-java',
    'cpp': 'fas fa-file-code',
    'c': 'fas fa-code'
  };

  return iconMap[language] || 'fas fa-code';
};

// 获取语言对应的标签名称
const getLanguageLabel = (language: string): string => {
  const labelMap: Record<string, string> = {
    'javascript': 'JavaScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C'
  };

  return labelMap[language] || language;
};
</script>

<template>
  <div class="editor-toolbar">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="language-selector">
          <div class="relative">
            <div 
              ref="selectRef"
              class="custom-select language-select"
              @click="isOpen = !isOpen"
            >
              <div class="selected-option flex items-center">
                <i :class="[getLanguageIcon(selectedLanguage), 'mr-2 text-indigo-500']"></i>
                <span>{{ getLanguageLabel(selectedLanguage) }}</span>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i class="fas fa-chevron-down text-indigo-500 text-xs"></i>
                </div>
              </div>
              <div v-if="isOpen" class="options-container">
                <div 
                  v-for="lang in languages" 
                  :key="lang.value" 
                  class="option flex items-center" 
                  :class="{ 'selected': lang.value === selectedLanguage }"
                  :data-lang="lang.value"
                  @click="selectLanguage(lang.value)"
                >
                  <i :class="[getLanguageIcon(lang.value), 'mr-2 text-indigo-500']"></i>
                  <span>{{ lang.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex space-x-3">
        <button
          @click="runCode"
          class="leetcode-button run-button"
        >
          <i class="fas fa-play mr-2"></i>
          运行
        </button>
        <button
          @click="submitCode"
          class="leetcode-button submit-button"
        >
          <i class="fas fa-paper-plane mr-2"></i>
          提交
        </button>
      </div>
    </div>
  </div>
</template>
