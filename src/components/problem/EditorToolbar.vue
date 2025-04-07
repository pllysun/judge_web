<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

// 定义语言类型
interface Language {
  value: string
  label: string
}

const props = defineProps({
  selectedLanguage: {
    type: String,
    default: 'cpp',
  },
  languages: {
    type: Array as () => Language[],
    default: () => [
      { value: 'cpp', label: 'C++' },
      { value: 'c', label: 'C' },
      { value: 'java', label: 'Java' },
      { value: 'python', label: 'Python' },
      { value: 'javascript', label: 'JavaScript' },
    ],
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:selectedLanguage',
  'run',
  'submit',
  'submit-success',
  'switch-to-result',
])

// 下拉菜单状态
const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)
const selectedOption = ref('cpp')

// 以固定顺序排序的语言选项
const sortedLanguages = computed(() => {
  const orderMap: Record<string, number> = {
    cpp: 1,
    c: 2,
    java: 3,
    python: 4,
    javascript: 5,
  }

  return [...props.languages].sort((a, b) => {
    const orderA = orderMap[a.value] || 99
    const orderB = orderMap[b.value] || 99
    return orderA - orderB
  })
})

// 初始化时设置选中项
onMounted(() => {
  const hasCpp = props.languages.some((lang) => lang.value === 'cpp')

  if (hasCpp) {
    selectedOption.value = 'cpp'
    if (props.selectedLanguage !== 'cpp') {
      emit('update:selectedLanguage', 'cpp')
    }
  } else if (props.languages.length > 0) {
    selectedOption.value = sortedLanguages.value[0].value
    emit('update:selectedLanguage', selectedOption.value)
  }

  document.addEventListener('click', handleClickOutside)
})

// 监听props变化，但初始时仍保持cpp
watch(
  () => props.selectedLanguage,
  (newValue) => {
    if (newValue && newValue !== selectedOption.value) {
      selectedOption.value = newValue
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 选择语言
const selectLanguage = (value: string) => {
  selectedOption.value = value
  emit('update:selectedLanguage', value)
  isOpen.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// 运行代码
const runCode = () => {
  emit('run')
  emit('switch-to-result')
}

// 提交代码
const submitCode = () => {
  emit('submit')
}

// 获取语言对应的图标
const getLanguageIcon = (language: string): string => {
  const iconMap: Record<string, string> = {
    javascript: 'fab fa-js-square',
    python: 'fab fa-python',
    java: 'fab fa-java',
    cpp: 'fas fa-file-code',
    c: 'fas fa-code',
  }

  return iconMap[language] || 'fas fa-code'
}

// 获取语言对应的标签名称
const getLanguageLabel = (language: string): string => {
  const labelMap: Record<string, string> = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
  }

  return labelMap[language] || language
}
</script>

<template>
  <div class="editor-toolbar-wrapper">
    <div class="toolbar-content">
      <div class="selector-container">
        <div class="language-selector">
          <div ref="selectRef" class="select-box" @click.stop="isOpen = !isOpen">
            <div class="selected-value">
              <i :class="[getLanguageIcon(selectedOption), 'lang-icon']"></i>
              <span class="lang-text">{{ getLanguageLabel(selectedOption) }}</span>
              <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>

            <div v-if="isOpen" class="dropdown-menu">
              <div
                v-for="lang in sortedLanguages"
                :key="lang.value"
                class="dropdown-item"
                :class="{ 'is-selected': lang.value === selectedOption }"
                @click.stop="selectLanguage(lang.value)"
              >
                <i :class="[getLanguageIcon(lang.value), 'lang-icon']"></i>
                <span class="lang-text">{{ lang.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions-container">
        <button @click="runCode" class="action-button run-button">
          <i class="fas fa-play action-icon"></i>
          <span>运行</span>
        </button>
        <button
          @click="submitCode"
          class="action-button submit-button"
          :disabled="props.isSubmitting"
        >
          <i
            :class="[
              'action-icon',
              props.isSubmitting ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane',
            ]"
          ></i>
          <span>{{ props.isSubmitting ? '提交中...' : '提交' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-toolbar-wrapper {
  width: 100%;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selector-container {
  display: flex;
  align-items: center;
}

.language-selector {
  position: relative;
  width: 150px;
}

.select-box {
  user-select: none;
  position: relative;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.select-box:hover {
  border-color: #a5b4fc;
}

.selected-value {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  position: relative;
}

.lang-icon {
  color: #6366f1;
  font-size: 1.125rem;
  width: 1.5rem;
  text-align: center;
  margin-right: 0.5rem;
}

.lang-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.dropdown-arrow {
  position: absolute;
  right: 0.75rem;
  font-size: 0.75rem;
  color: #6366f1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 100;
  overflow: hidden;
  overflow-y: auto;
  max-height: 200px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item.is-selected {
  background-color: #eef2ff;
  color: #4f46e5;
  font-weight: 500;
}

.actions-container {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-icon {
  margin-right: 0.5rem;
}

.run-button {
  background-color: #e0e7ff;
  color: #4338ca;
}

.run-button:hover {
  background-color: #c7d2fe;
}

.submit-button {
  background-color: #4f46e5;
  color: white;
}

.submit-button:hover {
  background-color: #4338ca;
}
</style>
