import { ref } from 'vue';
import { getAuthHeader } from '../services/api';

/**
 * 题目数据获取和处理逻辑
 */
export function useProblem() {
  // 题目数据
  const problem = ref({
    id: '',
    problemId: '',
    title: '',
    difficulty: '',
    difficultyLevel: null,
    difficultyLabel: '',
    acceptRate: '',
    submissionCount: '',
    tags: [],
    content: '',
    examples: [],
    hints: [],
    constraints: []
  });

  // 加载状态
  const loading = ref(true);

  // 获取题目详情
  const fetchProblemDetail = async (problemId) => {
    try {
      loading.value = true;
      
      if (!problemId) {
        throw new Error('未找到题目ID');
      }
      
      // 调用API获取题目详情
      const API_BASE_URL = 'http://pllysun.top:7500/api';
      const response = await fetch(`${API_BASE_URL}/problem/${problemId}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('获取题目详情失败');
      }
      
      const data = await response.json();
      
      // 处理API返回的数据
      if (data.data) {
        const problemData = data.data;
        problem.value = {
          id: problemData.id || '',
          problemId: problemData.problemId || '',
          title: problemData.title || '',
          difficulty: problemData.difficulty || '',
          difficultyLevel: {
            level: problemData.difficulty,
            difficulty: getDifficultyLabel(problemData.difficulty).label
          },
          difficultyLabel: getDifficultyLabel(problemData.difficulty),
          acceptRate: problemData.acceptRate || '0%',
          submissionCount: problemData.submissionCount || '0',
          tags: problemData.tags || [],
          content: problemData.content || '',
          examples: problemData.examples || [],
          hints: problemData.hints || [],
          constraints: problemData.constraints || []
        };
      } else {
        // 如果没有data字段，则假设response本身就是数据
        problem.value = {
          id: data.id || '',
          problemId: data.problemId || '',
          title: data.title || '',
          difficulty: data.difficulty || '',
          difficultyLevel: {
            level: data.difficulty,
            difficulty: getDifficultyLabel(data.difficulty).label
          },
          difficultyLabel: getDifficultyLabel(data.difficulty),
          acceptRate: data.acceptRate || '0%',
          submissionCount: data.submissionCount || '0',
          tags: data.tags || [],
          content: data.content || '',
          examples: data.examples || [],
          hints: data.hints || [],
          constraints: data.constraints || []
        };
      }
    } catch (error) {
      console.error('获取题目详情失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 根据难度值获取难度标签
  const getDifficultyLabel = (difficulty) => {
    const difficultyMap = {
      1: { label: '简单', class: 'bg-green-100 text-green-800' },
      2: { label: '中等', class: 'bg-yellow-100 text-yellow-800' },
      3: { label: '困难', class: 'bg-red-100 text-red-800' }
    };
    
    return difficultyMap[difficulty] || { label: '未知', class: 'bg-gray-100 text-gray-800' };
  };

  return {
    problem,
    loading,
    fetchProblemDetail
  };
}