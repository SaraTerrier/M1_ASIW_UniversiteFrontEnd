<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';

defineProps<{
  title: string;
  chartData: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}>();
</script>

<template>
  <div class="chart-card">
    <h3 class="chart-title">{{ title }}</h3>
    <div class="chart-wrapper">
      <Bar 
        v-if="chartData.labels && chartData.labels.length > 0"
        :data="chartData" 
        :options="options" 
      />
      <p v-else class="no-data">Aucune donnée disponible</p>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-md);
}

.chart-title {
  margin-bottom: var(--spacing-6);
  text-align: center;
}

.chart-wrapper {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data {
  color: var(--color-text-secondary);
  font-style: italic;
  text-align: center;
}
</style>
