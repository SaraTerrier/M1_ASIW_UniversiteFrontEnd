<script setup lang="ts">
import type { Parcours } from '@/domain/entities/Parcours';

interface Props {
  allParcours: Parcours[];
  selectedParcours: Parcours[];
}

interface Emits {
  (e: 'update:selectedParcours', parcours: Parcours[]): void;
  (e: 'change'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleChange = (value: Parcours[]) => {
  emit('update:selectedParcours', value);
  emit('change');
};
</script>

<template>
  <div class="card main-card animate-slide-in-up" style="animation-delay: 0.1s;">
    <div class="card-header">
      <div class="card-title">
        <i class="bi bi-diagram-3 me-2 color-white"></i>
        <h4>Parcours associés</h4>
        <span class="badge-count" v-if="selectedParcours.length > 0">
          {{ selectedParcours.length }}
        </span>
      </div>
    </div>
    <div class="card-body">
      <div class="form-group mb-4">
        <label class="form-label">
          <i class="bi bi-list-check me-2"></i>
          Sélectionner les parcours
        </label>
        <v-select 
          multiple 
          label="NomParcours" 
          :model-value="selectedParcours"
          @update:modelValue="handleChange"
          :options="allParcours"
          placeholder="Choisissez un ou plusieurs parcours..."
          class="modern-select"
        ></v-select>
        <small class="form-text">
          Les étudiants inscrits dans ces parcours seront affichés dans la section notes.
        </small>
      </div>
      
      <div v-if="selectedParcours && selectedParcours.length > 0" class="parcours-list">
        <h5 class="section-subtitle">
          <i class="bi bi-check-circle-fill me-2 text-success"></i>
          Parcours sélectionnés
        </h5>
        <div class="parcours-grid">
          <div 
            v-for="parcours in selectedParcours" 
            :key="parcours.Id || 0" 
            class="parcours-card"
          >
            <div class="parcours-icon">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <div class="parcours-info">
              <h6>{{ parcours.NomParcours }}</h6>
              <span class="parcours-year">{{ parcours.AnneeFormation }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-parcours-state">
        <i class="bi bi-folder2-open"></i>
        <p>Aucun parcours sélectionné</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-subtitle {
  display: flex;
  align-items: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-4);
  color: var(--color-text-primary);
}

.form-label {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.form-text {
  display: block;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
  color: var(--color-text-secondary);
}

.parcours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.parcours-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-background-secondary);
  border: 2px solid var(--color-border-light);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
}

.parcours-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.parcours-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.parcours-info {
  flex: 1;
}

.parcours-info h6 {
  margin: 0;
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.parcours-year {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
  background: var(--color-neutral-200);
  color: var(--color-text-secondary);
}

.empty-parcours-state {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-text-secondary);
}

.empty-parcours-state i {
  font-size: 48px;
  margin-bottom: var(--spacing-3);
  opacity: 0.5;
}

.modern-select :deep(.vs__dropdown-toggle) {
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-2);
  transition: var(--transition-base);
}

.modern-select :deep(.vs__dropdown-toggle):hover,
.modern-select :deep(.vs--open .vs__dropdown-toggle) {
  border-color: var(--color-primary);
}

.modern-select :deep(.vs--open .vs__dropdown-toggle) {
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}
</style>
