<template>
  <div class="chart-card">
    <h3 class="chart-title">{{ title }}</h3>
    <div class="chart-wrapper">
      <Line 
        v-if="chartData.labels && chartData.labels.length > 0"
        :data="chartData" 
        :options="options" 
      />
      <p v-else class="no-data">Aucune donnée disponible</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';

defineProps<{
  title: string;
  chartData: ChartData<'line'>;
  options?: ChartOptions<'line'>;
}>();
</script>

<style scoped>
.chart-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-md);
}

.chart-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-6);
  color: var(--color-text-primary);
  text-align: center;
  font-family: var(--font-family-heading);
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
  font-size: var(--font-size-base);
}
</style>
