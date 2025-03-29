<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedRoleLevel: {
    type: Number,
    default: 2
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

// 定义组件发出的事件
const emit = defineEmits(['update:visible', 'update:selectedRoleLevel', 'submit', 'cancel'])

// 角色选项 - 使用数字作为值，显示中文名称
const roleOptions = [
  { label: '游客', value: 1 },
  { label: '用户', value: 2 },
  { label: '会员', value: 3 },
  { label: '管理员', value: 4 },
  { label: '超级管理员', value: 5 },
]

// 下拉菜单状态
const roleDropdownOpen = ref(false)
const roleDropdownRef = ref<HTMLElement | null>(null)

// 关闭弹窗
function closeModal() {
  emit('update:visible', false)
  emit('cancel')
}

// 提交角色修改
function submitRoleChange() {
  emit('submit')
}

// 选择角色
function selectRole(value: number) {
  emit('update:selectedRoleLevel', value)
  roleDropdownOpen.value = false
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
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">修改用户权限</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">请选择新的用户权限级别</p>
              </div>
            </div>
          </div>

          <!-- 下拉选择框 -->
          <div class="mt-4 relative">
            <div>
              <button
                type="button"
                ref="roleDropdownRef"
                @click="roleDropdownOpen = !roleDropdownOpen"
                class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <span class="block truncate">
                  {{
                    roleOptions.find((option) => option.value === selectedRoleLevel)?.label ||
                    '请选择权限级别'
                  }}
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
            </div>

            <!-- 下拉选项列表 -->
            <div
              v-if="roleDropdownOpen"
              class="dropdown-menu-fix absolute bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              style="width: 100%; top: 100%; left: 0; margin-top: 4px; z-index: 2100"
            >
              <div
                v-for="option in roleOptions"
                :key="option.value"
                @click="selectRole(option.value)"
                class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-100"
                :class="{ 'bg-indigo-50': option.value === selectedRoleLevel }"
              >
                <span
                  class="block truncate"
                  :class="{
                    'font-medium': option.value === selectedRoleLevel,
                    'font-normal': option.value !== selectedRoleLevel,
                  }"
                >
                  {{ option.label }}
                </span>

                <!-- 选中标记 -->
                <span
                  v-if="option.value === selectedRoleLevel"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600"
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

        <!-- 按钮区域 -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="submitRoleChange"
            :disabled="isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
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
            {{ isSubmitting ? '处理中...' : '确定' }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>