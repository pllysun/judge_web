import { reactive, ref } from 'vue';
import { getAuthHeader } from '../services/api';
import { codeRunService } from '../services/codeRunService';

/**
 * 代码执行和提交逻辑
 */
export function useExecution() {
  // 执行结果
  const executionResult = reactive({
    status: '', // success, error, running
    message: '',
    output: '',
    time: '0ms',
    memory: '0MB'
  });

  // 测试用例结果数组
  const testCaseResults = ref([]);

  // 是否正在运行代码
  const isRunning = ref(false);

  // 整体运行结果
  const overallResult = ref({
    status: '',
    allPassed: false,
    message: ''
  });

  // 运行单个测试用例
  const runSingleTestCase = async (code, language, testCase, expectedOutput) => {
    executionResult.status = 'running';
    executionResult.message = '正在执行...';

    try {
      const result = await codeRunService.runCode(code, language, testCase);

      // 更新执行结果
      if (result.testCaseResults && result.testCaseResults.length > 0) {
        const testResult = result.testCaseResults[0];

        // 检查是否有编译错误
        if (result.compileError) {
          executionResult.status = 'error';
          executionResult.message = '编译错误';
          executionResult.output = result.compileError;
          executionResult.time = '0ms';
          executionResult.memory = '0MB';
        }
        // 检查状态
        else if (testResult.status && testResult.status !== 'Accepted') {
          executionResult.status = 'error';

          // 根据API返回的message和状态码设置错误信息
          if (result.apiMessage) {
            // 使用API返回的message
            executionResult.message = result.apiMessage;
          } else {
            // 使用默认错误信息
            executionResult.message = testResult.status === 'Time Limit Exceeded' ? '执行超时' :
                                      testResult.status === 'Memory Limit Exceeded' ? '内存超限' :
                                      testResult.status === 'Compile Error' ? '编译错误' :
                                      `执行错误: ${testResult.status}`;
          }

          executionResult.output = testResult.stdout || '';
          executionResult.time = testResult.timeInMsWithUnit || '0ms';
          executionResult.memory = testResult.memoryInMBWithUnit || '0MB';
        }
        // 检查输出是否与预期匹配
        else {
          const actualOutput = testResult.stdout?.trim() || '';
          const expectedOutputTrimmed = expectedOutput?.trim() || '';

          if (actualOutput === expectedOutputTrimmed) {
            executionResult.status = 'success';
            executionResult.message = '执行成功';
          } else {
            executionResult.status = 'error';
            executionResult.message = '输出与预期不符';
          }

          executionResult.output = testResult.stdout || '';
          executionResult.time = testResult.timeInMsWithUnit || '0ms';
          executionResult.memory = testResult.memoryInMBWithUnit || '0MB';
        }
      } else {
        executionResult.status = 'error';
        executionResult.message = '未获取到执行结果';
        executionResult.output = '';
        executionResult.time = '0ms';
        executionResult.memory = '0MB';
      }
    } catch (error) {
      console.error('运行代码出错:', error);
      executionResult.status = 'error';
      executionResult.message = error.message || '运行代码失败';
      executionResult.output = error.message || '运行代码失败';
      executionResult.time = '0ms';
      executionResult.memory = '0MB';
    }
  };

  // 运行所有测试用例
  const runAllTestCases = async (code, language, testCasesData) => {
    if (!testCasesData || testCasesData.length === 0) {
      console.error('没有测试用例可运行');
      return;
    }

    // 重置状态
    isRunning.value = true;
    testCaseResults.value = [];
    overallResult.value = {
      status: 'running',
      allPassed: false,
      message: '正在运行测试用例...'
    };

    try {
      // 准备测试用例数据
      const testCases = testCasesData.map(tc => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || ''
      }));

      // 运行所有测试用例
      const results = await codeRunService.runMultipleTestCases(code, language, testCases);

      // 更新测试用例结果
      testCaseResults.value = results;

      // 检查是否全部通过
      const allPassed = results.every(r => r.passed);

      // 更新整体结果
      overallResult.value = {
        status: 'done',
        allPassed,
        message: allPassed ? '所有测试用例通过' : '部分测试用例未通过'
      };

      // 如果有选中的测试用例，更新单个执行结果
      if (results.length > 0) {
        const firstResult = results[0];
        if (firstResult.result.testCaseResults && firstResult.result.testCaseResults.length > 0) {
          const testResult = firstResult.result.testCaseResults[0];

          executionResult.status = firstResult.passed ? 'success' : 'error';
          executionResult.message = firstResult.passed ? '执行成功' : '执行失败';
          executionResult.output = testResult.stdout || '';
          executionResult.time = testResult.timeInMsWithUnit || '0ms';
          executionResult.memory = testResult.memoryInMBWithUnit || '0MB';
        }
      }
    } catch (error) {
      console.error('运行测试用例出错:', error);
      overallResult.value = {
        status: 'error',
        allPassed: false,
        message: error.message || '运行测试用例失败'
      };
    } finally {
      isRunning.value = false;
    }
  };

  // 运行代码（兼容旧接口）
  const runCode = async (code, language, testCase, expectedOutput) => {
    // 如果只有一个测试用例，直接运行
    if (testCase && expectedOutput) {
      await runSingleTestCase(code, language, testCase, expectedOutput);
    }
  };

  // 提交代码
  const submitCode = async (code, language, callback) => {
    executionResult.status = 'running';
    executionResult.message = '正在提交...';

    try {
      const API_BASE_URL = 'http://pllysun.top:7500/api';

      // 从URL中获取题目ID
      const pathParts = window.location.pathname.split('/');
      // 路径格式为 /problems/:id/solve，所以题目ID是倒数第二个部分
      const problemId = pathParts[pathParts.length - 2];

      if (!problemId) {
        throw new Error('未找到题目ID');
      }

      // 准备请求数据
      const requestData = {
        problemId: problemId,
        code: typeof code === 'object' && code.__v_isRef ? code.value : code,
        language: typeof language === 'object' && language.__v_isRef ? language.value : language
      };

      // 使用JSON.parse(JSON.stringify())处理可能的循环引用
      const safeRequestData = JSON.parse(JSON.stringify(requestData));

      // 调用提交代码API
      const response = await fetch(`${API_BASE_URL}/code/submit`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(safeRequestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '提交代码失败');
      }

      const data = await response.json();

      if (data.code === 200) {
        executionResult.status = 'success';
        executionResult.message = '提交成功';
        executionResult.output = '代码已成功提交，正在评测中...';

        // 如果有回调函数，传递提交ID
        if (callback && typeof callback === 'function' && data.data && data.data.submissionId) {
          callback(data.data.submissionId);
        }
      } else {
        executionResult.status = 'error';
        executionResult.message = data.message || '提交失败';
      }
    } catch (error) {
      console.error('提交代码出错:', error);
      executionResult.status = 'error';
      executionResult.message = error.message || '提交代码失败';
    }
  };

  return {
    executionResult,
    testCaseResults,
    isRunning,
    overallResult,
    runCode,
    runAllTestCases,
    submitCode
  };
}
