<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ues } from '@/domain/entities/Ues';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';

interface Props {
  ue: Ues;
  isSaving?: boolean;
}

// Définition des événements émis par le composant
interface Emits {
  (e: 'save', ueData: { NumeroUe: string; Intitule: string }): void;
  (e: 'update:ue', ue: Ues): void;
}

// Validers par défaut pour les props
const props = withDefaults(defineProps<Props>(), {
  isSaving: false
});

const emit = defineEmits<Emits>();

// Gestion des erreurs de validation du formulaire
const formErrors = ref({
  NumeroUe: null as string | null,
  Intitule: null as string | null,
});

const handleSubmit = () => {
  // Validation
  formErrors.value.NumeroUe = null;
  formErrors.value.Intitule = null;
  
  if (!props.ue?.NumeroUe || props.ue.NumeroUe.trim().length < 2) {
    formErrors.value.NumeroUe = 'Le numéro UE doit faire au moins 2 caractères';
    return;
  }
  
  if (!props.ue?.Intitule || props.ue.Intitule.trim().length < 3) {
    formErrors.value.Intitule = 'L\'intitulé doit faire au moins 3 caractères';
    return;
  }
  
  emit('save', {
    NumeroUe: props.ue.NumeroUe,
    Intitule: props.ue.Intitule
  });
};

// Observer les changements pour validation
watch(() => props.ue?.NumeroUe, (newVal) => {
  if (newVal && newVal.trim().length >= 2) {
    formErrors.value.NumeroUe = null;
  }
});

watch(() => props.ue?.Intitule, (newVal) => {
  if (newVal && newVal.trim().length >= 3) {
    formErrors.value.Intitule = null;
  }
});
</script>

<template>
  <div class="card main-card animate-slide-in-up">
    <div class="card-header">
      <div class="card-title">
        <i class="bi bi-info-circle me-2 color-white"></i>
        <h4>Informations générales</h4>
      </div>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-hash me-2"></i>
                Numéro UE
              </label>
              <input 
                v-model="ue.NumeroUe" 
                type="text" 
                class="form-control modern-input"
                :class="{ 'is-invalid': formErrors.NumeroUe }"
                placeholder="Ex: UE01"
              />
              <div v-if="formErrors.NumeroUe" class="invalid-feedback">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ formErrors.NumeroUe }}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-card-heading me-2"></i>
                Intitulé
              </label>
              <input 
                v-model="ue.Intitule" 
                type="text" 
                class="form-control modern-input"
                :class="{ 'is-invalid': formErrors.Intitule }"
                placeholder="Ex: Mathématiques appliquées"
              />
              <div v-if="formErrors.Intitule" class="invalid-feedback">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ formErrors.Intitule }}
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <CustomButton 
            type="submit"
            :color="BootstrapButtonEnum.info"
            :disabled="isSaving"
            class="btn-with-icon"
          >
            <span v-if="!isSaving">
              <i class="bi bi-save me-2"></i>
              Enregistrer les modifications
            </span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2"></span>
              Enregistrement...
            </span>
          </CustomButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modern-input {
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  transition: var(--transition-base);
  background: var(--color-surface);
}

.modern-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  outline: none;
}

.modern-input.is-invalid {
  border-color: var(--color-danger);
}

.form-label {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.invalid-feedback {
  display: block;
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
}
</style>
