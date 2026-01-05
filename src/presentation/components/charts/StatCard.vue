<template>
  <div class="stat-card" :class="`stat-card-${variant}`">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-content">
      <h3 class="stat-title">{{ title }}</h3>
      <p class="stat-value">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  value: number | string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
}>();
</script>

<style scoped>
.stat-card {
  color: var(--color-text-inverse);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  box-shadow: var(--shadow-lg);
}

.stat-card-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card-tertiary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card-quaternary {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  font-size: var(--font-size-5xl);
  line-height: var(--line-height-tight);
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--spacing-2) 0;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}
</style>
