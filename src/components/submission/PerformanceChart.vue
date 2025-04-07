<template>
  <div class="performance-chart-container">
    <div class="chart-header">
      <h3 class="text-lg font-semibold text-gray-800">性能分析</h3>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-color bg-blue-500"></span>
          <span>执行时间</span>
        </div>
        <div class="legend-item">
          <span class="legend-color bg-green-500"></span>
          <span>内存使用</span>
        </div>
      </div>
    </div>
    <div class="chart-content">
      <div class="chart-grid">
        <div v-for="(item, index) in chartData" :key="index" class="chart-bar">
          <div class="bar-container">
            <div
              class="time-bar"
              :style="{ height: `${(item.time / maxTime) * 100}%` }"
            ></div>
            <div
              class="memory-bar"
              :style="{ height: `${(item.memory / maxMemory) * 100}%` }"
            ></div>
          </div>
          <div class="bar-label">#{{ index + 1 }}</div>
        </div>
      </div>
      <div class="chart-stats">
        <div class="stat-item">
          <span class="stat-label">平均执行时间</span>
          <span class="stat-value">{{ avgTimeInMsWithUnit }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均内存使用</span>
          <span class="stat-value">{{ avgMemoryInMBWithUnit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  testCaseResults: Array<{
    timeInMs: number;
    memoryInMB: number;
  }>;
  avgTimeInMsWithUnit: string;
  avgMemoryInMBWithUnit: string;
}

const props = defineProps<Props>();

// 计算图表数据
const chartData = computed(() => {
  return props.testCaseResults.map(result => ({
    time: result.timeInMs,
    memory: result.memoryInMB
  }));
});

// 计算最大值用于比例计算
const maxTime = computed(() => {
  return Math.max(...chartData.value.map(item => item.time), 1);
});

const maxMemory = computed(() => {
  return Math.max(...chartData.value.map(item => item.memory), 1);
});
</script>

<style scoped>
.performance-chart-container {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-container {
  width: 24px;
  height: 100%;
  display: flex;
  justify-content: center;
  gap: 2px;
}

.time-bar, .memory-bar {
  width: 8px;
  border-radius: 4px;
  transition: height 0.3s ease;
}

.time-bar {
  background-color: #3b82f6;
}

.memory-bar {
  background-color: #10b981;
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}
</style>
