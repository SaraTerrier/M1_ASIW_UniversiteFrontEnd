<script setup lang="ts">
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { computed, ref } from 'vue';

const props = defineProps<{
    color: BootstrapButtonEnum,
    loading?: boolean,
    disabled?: boolean
}>();

const isLoading = ref(props.loading || false);

const buttonClasses = computed(() => {
    return {
        'btn': true,
        'btn-modern': true,
        [props.color]: true,
        'disabled': props.disabled || isLoading.value
    }
});
</script>

<template>
    <button 
        type="button" 
        :class="buttonClasses"
        :disabled="disabled || isLoading"
    >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <slot />
    </button>
</template>

<style scoped>
.btn-modern {
    position: relative;
    overflow: hidden;
    transition: var(--transition-base);
}

.btn-modern:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.btn-modern:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.btn-modern:not(:disabled):active {
    transform: translateY(0);
}
</style>