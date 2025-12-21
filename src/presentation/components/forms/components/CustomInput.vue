<script setup lang="ts">
import { ref } from 'vue';

const model = defineModel();
const isFocused = ref(false);

const props = defineProps<{ 
  id: string, 
  libelle: string, 
  type: string, 
  placeholder: string | undefined, 
  error: string | undefined | null,
  icon?: string
}>(); 
</script>

<template> 
  <div class="form-group-modern">
    <label :for="id" class="form-label-modern">
      {{ libelle }}
      <span v-if="error" class="text-danger ms-1">*</span>
    </label>
    
    <div class="input-wrapper" :class="{ 'focused': isFocused, 'has-error': error }">
      <i v-if="icon" :class="['input-icon', icon]"></i>
      <input 
        v-model="model" 
        :class="{ 'form-control-modern': true, 'is-invalid': error, 'has-icon': icon }" 
        :type="type" 
        :id="id" 
        :placeholder="placeholder"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <div v-if="error" class="error-icon">
        <i class="bi bi-exclamation-circle-fill"></i>
      </div>
    </div>
    
    <Transition name="error-slide">
      <div v-if="error" class="error-message">
        <i class="bi bi-x-circle me-1"></i>
        {{ error }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.form-group-modern {
  margin-bottom: var(--spacing-5);
}

.form-label-modern {
  display: block;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  transition: var(--transition-fast);
}

.input-icon {
  position: absolute;
  left: var(--spacing-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  pointer-events: none;
  transition: var(--transition-fast);
}

.input-wrapper.focused .input-icon {
  color: var(--color-primary);
}

.form-control-modern {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  transition: var(--transition-fast);
  outline: none;
}

.form-control-modern.has-icon {
  padding-left: calc(var(--spacing-4) * 2.5);
}

.form-control-modern:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  background-color: var(--color-surface);
}

.form-control-modern.is-invalid {
  border-color: var(--color-danger);
  padding-right: calc(var(--spacing-4) * 2.5);
}

.form-control-modern.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
}

.error-icon {
  position: absolute;
  right: var(--spacing-4);
  color: var(--color-danger);
  font-size: var(--font-size-lg);
  pointer-events: none;
}

.error-message {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: rgba(230, 57, 70, 0.1);
  border-left: 3px solid var(--color-danger);
  border-radius: var(--border-radius-md);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Animation pour le message d'erreur */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all var(--duration-fast) var(--ease-in-out);
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Responsive */
@media (max-width: 768px) {
  .form-control-modern {
    font-size: var(--font-size-base);
    padding: var(--spacing-3);
  }
}
</style>