<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

// 定义组件发出的事件
const emit = defineEmits(['update:visible', 'submit', 'cancel'])

// 通知类型选项
const typeOptions = [
  { label: '系统更新', value: 'SYSTEM_UPDATE' },
  { label: '比赛开始', value: 'COMPETITION_START' },
  { label: '公告', value: 'ANNOUNCEMENT' },
  { label: '其他', value: 'OTHER' }
]

// 表单数据
const notificationForm = ref({
  type: 'SYSTEM_UPDATE',
  title: '',
  content: '',
  receiverId: 'all' // 默认发送给所有用户
})

// 表单验证
const formErrors = ref({
  title: '',
  content: ''
})

// 下拉菜单状态
const typeDropdownOpen = ref(false)
const typeDropdownRef = ref<HTMLElement | null>(null)

// 关闭弹窗
function closeModal() {
  // 重置表单
  notificationForm.value = {
    type: 'SYSTEM_UPDATE',
    title: '',
    content: '',
    receiverId: 'all'
  }
  formErrors.value = {
    title: '',
    content: ''
  }
  
  emit('update:visible', false)
  emit('cancel')
}

// 验证表单
function validateForm() {
  let isValid = true
  formErrors.value = {
    title: '',
    content: ''
  }

  if (!notificationForm.value.title.trim()) {
    formErrors.value.title = '通知标题不能为空'
    isValid = false
  }

  if (!notificationForm.value.content.trim()) {
    formErrors.value.content = '通知内容不能为空'
    isValid = false
  }

  return isValid
}

// 提交通知
function submitNotification() {
  if (!validateForm()) return
  
  emit('submit', { ...notificationForm.value })
}

// 选择通知类型
function selectType(value: string) {
  notificationForm.value.type = value
  typeDropdownOpen.value = false
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeModal"></div>
      </div>

      <!-- 弹窗内容 -->
      <div
        class="inline-block align-middle bg-white rounded-lg text-left shadow-xl transform translate-y-0 sm:my-8 sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">发送系统通知</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">请填写通知内容，发送给指定用户或所有用户</p>
              </div>
            </div>
          </div>

          <!-- 表单区域 -->
          <div class="mt-4 space-y-4">
            <!-- 通知类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">通知类型</label>
              <div class="mt-1 relative">
                <button
                  type="button"
                  ref="typeDropdownRef"
                  @click="typeDropdownOpen = !typeDropdownOpen"
                  class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <span class="block truncate">
                    {{ typeOptions.find((option) => option.value === notificationForm.type)?.label || '请选择通知类型' }}
                  </span>
                  <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      class="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                </button>

                <!-- 下拉选项列表 -->
                <div
                  v-if="typeDropdownOpen"
                  class="dropdown-menu-fix absolute bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  style="width: 100%; top: 100%; left: 0; margin-top: 4px; z-index: 2100"
                >
                  <div
                    v-for="option in typeOptions"
                    :key="option.value"
                    @click="selectType(option.value)"
                    class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100"
                    :class="{ 'bg-blue-50': option.value === notificationForm.type }"
                  >
                    <span
                      class="block truncate"
                      :class="{
                        'font-medium': option.value === notificationForm.type,
                        'font-normal': option.value !== notificationForm.type,
                      }"
                    >
                      {{ option.label }}
                    </span>

                    <!-- 选中标记 -->
                    <span
                      v-if="option.value === notificationForm.type"
                      class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600"
                    >
                      <svg
                        class="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 通知标题 -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">通知标题</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="title"
                  v-model="notificationForm.title"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  :class="{ 'border-red-300': formErrors.title }"
                  placeholder="请输入通知标题"
                />
                <p v-if="formErrors.title" class="mt-1 text-sm text-red-600">{{ formErrors.title }}</p>
              </div>
            </div>

            <!-- 通知内容 -->
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700">通知内容</label>
              <div class="mt-1">
                <textarea
                  id="content"
                  v-model="notificationForm.content"
                  rows="4"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  :class="{ 'border-red-300': formErrors.content }"
                  placeholder="请输入通知内容"
                ></textarea>
                <p v-if="formErrors.content" class="mt-1 text-sm text-red-600">{{ formErrors.content }}</p>
              </div>
            </div>

            <!-- 接收者 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">接收者</label>
              <div class="mt-1">
                <div class="flex items-center">
                  <input
                    id="all-users"
                    type="radio"
                    v-model="notificationForm.receiverId"
                    value="all"
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label for="all-users" class="ml-2 block text-sm text-gray-700">所有用户</label>
                </div>
                <div class="flex items-center mt-2">
                  <input
                    id="current-user"
                    type="radio"
                    v-model="notificationForm.receiverId"
                    value="current"
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label for="current-user" class="ml-2 block text-sm text-gray-700">当前选中用户</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 按钮区域 -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="submitNotification"
            :disabled="isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            :class="{ 'opacity-75 cursor-not-allowed': isSubmitting }"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            发送通知
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>