<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';

defineProps<{
  title: string;
  chartData: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
}>();
</script>

<template>
  <div class="chart-card-full">
    <h3 class="chart-title">{{ title }}</h3>
    <div class="chart-wrapper-large">
      <Doughnut 
        v-if="chartData.labels && chartData.labels.length > 0"
        :data="chartData" 
        :options="options" 
      />
      <p v-else class="no-data">Aucune donnée disponible</p>
    </div>
  </div>
</template>

<style scoped>
.chart-card-full {
  background: var(--color-surface);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-md);
}

.chart-title {
  margin-bottom: var(--spacing-6);
  text-align: center;
}

.chart-wrapper-large {
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

@media (max-width: 1024px) {
  .chart-wrapper-large {
    height: 400px;
  }
}
</style>
