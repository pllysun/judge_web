<template>
  <div class="code-editor-container">
    <!-- 题目描述区域 -->
    <div class="problem-section">
      <ProblemDescription :problem="problem" :loading="loading" />
    </div>
    
    <!-- 编辑器区域 -->
    <div class="editor-section">
      <!-- 编辑器工具栏 -->
      <EditorToolbar 
        :languages="languages" 
        :selectedLanguage="selectedLanguage" 
        @update:selectedLanguage="handleLanguageChange" 
        @run="runCode" 
        @submit="submitCode" 
        @submit-success="handleSubmitSuccess"
        class="editor-toolbar"
      />
      
      <!-- 代码编辑器 -->
      <div class="editor-container">
        <CodeEditor :code="code" @update:code="code = $event" :language="selectedLanguage" />
      </div>
      
      <!-- 测试用例面板 -->
      <div class="test-case-section">
        <TestCasePanel 
          :testCases="testCases" 
          :isLoadingTestCases="isLoadingTestCases" 
          :testCaseError="testCaseError" 
          :testCase="testCase"
          :expectedOutput="expectedOutput"
          :selectedTestCaseIndex="selectedTestCaseIndex"
          :executionResult="executionResult"
          :showExecutionResult="!!executionResult.status || testCaseResults.length > 0"
          :testCaseResults="testCaseResults"
          :isRunning="isRunning"
          :overallResult="overallResult"
          :code="code"
          :language="selectedLanguage"
          @update:testCase="testCase = $event"
          @update:expectedOutput="expectedOutput = $event"
          @update:selectedTestCaseIndex="selectedTestCaseIndex = $event"
          @run="runCode"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import CodeEditor from '../components/CodeEditor.vue';
import ProblemDescription from '../components/problem/ProblemDescription.vue';
import TestCasePanel from '../components/problem/TestCasePanel.vue';
import EditorToolbar from '../components/problem/EditorToolbar.vue';

// 导入拆分出的composables
import { useEditor } from '../composables/useEditor';
import { useProblem } from '../composables/useProblem';
import { useTestCase } from '../composables/useTestCase';
import { useExecution } from '../composables/useExecution';

// 获取路由参数
const route = useRoute();

// 使用拆分出的composables
const { code, selectedLanguage, languages, resetCode, handleLanguageChange } = useEditor();
const { problem, loading, fetchProblemDetail } = useProblem();
const {
  testCase,
  expectedOutput,
  testCases,
  isLoadingTestCases,
  testCaseError,
  selectedTestCaseIndex,
  fetchTestCases,
  setupTestCaseWatch
} = useTestCase();
const { 
  executionResult, 
  testCaseResults, 
  isRunning, 
  overallResult,
  runCode: executeCode, 
  runAllTestCases,
  submitCode: submitCodeToServer 
} = useExecution();

// 设置测试用例选择变化的监听
setupTestCaseWatch();

// 运行代码
const runCode = () => {
  // 确保使用当前编辑器中的代码内容
  console.log('运行代码:', code);
  // 运行所有测试用例
  runAllTestCases(code, selectedLanguage.value, testCases.value);
};

// 提交代码
const submitCode = () => {
  submitCodeToServer(code, selectedLanguage.value, (submissionId) => {
    // 如果有提交ID，可以在这里处理跳转逻辑
    console.log('提交成功，提交ID:', submissionId);
  });
};

// 处理提交成功事件
const handleSubmitSuccess = (callback) => {
  // 将回调函数传递给submitCodeToServer
  submitCodeToServer(code, selectedLanguage.value, callback);
};

// 组件挂载时获取测试用例和题目详情
onMounted(() => {
  // 从路由参数中获取题目ID
  const problemId = route.params.id;
  if (problemId) {
    fetchTestCases(problemId);
    fetchProblemDetail(problemId);
  }
});
</script>

<style scoped>
/* 基础布局 */
.code-editor-container {
  display: flex;
  height: calc(100vh - 64px);
  overflow: hidden;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.problem-section {
  width: 40%;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  padding: clamp(8px, 1vw, 16px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);
  background-color: white;
  transition: all 0.3s ease;
}

.editor-section {
  width: 60%;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.editor-container {
  height: 70%;
  flex: 1 1 auto;
  overflow: hidden;
  min-height: 0;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.test-case-section {
  height: 20%;
  overflow-y: auto;
  background-color: white;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.02);
  transition: height 0.3s ease;
}

/* 大屏幕设备 (1200px以上) */
@media (min-width: 1200px) {
  .problem-section {
    width: 40%;
  }
  
  .editor-section {
    width: 60%;
  }
}

/* 中等屏幕设备 (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .problem-section {
    width: 45%;
  }
  
  .editor-section {
    width: 55%;
  }
}

/* 平板设备 (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .problem-section {
    width: 45%;
  }
  
  .editor-section {
    width: 55%;
  }
  
  .editor-container {
    height: 65%;
  }
  
  .test-case-section {
    height: 25%;
  }
}

/* 手机设备 (767px以下) */
@media (max-width: 767px) {
  .code-editor-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 64px);
  }
  
  .problem-section {
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px;
  }
  
  .editor-section {
    width: 100%;
    height: 60vh;
  }
  
  .editor-container {
    height: 60%;
  }
  
  .test-case-section {
    height: 30%;
  }
}

/* 小型手机设备 (480px以下) */
@media (max-width: 480px) {
  .code-editor-container {
    height: auto;
    min-height: calc(100vh - 64px);
  }
  
  .problem-section {
    max-height: 35vh;
    padding: 10px;
  }
  
  .editor-section {
    height: 65vh;
  }
  
  .editor-toolbar {
    padding: 8px;
  }
  
  .editor-container {
    height: 55%;
  }
  
  .test-case-section {
    height: 35%;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  /* 增大按钮点击区域 */
  .editor-toolbar button {
    padding: 10px 16px;
    margin: 4px;
  }
  
  /* 增大下拉菜单项的高度 */
  .custom-select .options .option {
    padding: 12px 16px;
  }
  
  /* 增大测试用例项的点击区域 */
  .test-case-item {
    padding: 12px;
    margin-bottom: 8px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .code-editor-container {
    background-color: #1e1e1e;
  }
  
  .problem-section,
  .editor-section,
  .test-case-section {
    background-color: #1e1e1e;
    border-color: #333;
  }
}
</style>
