<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    width: {
        type: String,
        required: false,
        default: null,
    },
});

// Bloquer le scroll du body quand le modal est ouvert
onMounted(() => {
    document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
    document.body.style.overflow = '';
});
</script>

<template>
    <Transition name="modal-fade">
        <div v-if="isOpen" class="custom-modal-backdrop" @click.self="$emit('close')">
            <Transition name="modal-slide">
                <div v-if="isOpen" class="custom-modal-content" :style="{ 'max-width': width ?? '500px' }">
                    <div class="modal-card">
                        <div class="modal-header">
                            <div class="modal-title">
                                <slot name="title"></slot>
                            </div>
                        </div>
                        <div class="modal-body">
                            <slot name="body"></slot>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>
</template>

<style scoped>
/* Backdrop du modal */
.custom-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-index-modal-backdrop);
    padding: var(--spacing-4);
    backdrop-filter: blur(4px);
}

/* Contenu du modal */
.custom-modal-content {
    width: 100%;
    max-height: 90vh;
    z-index: var(--z-index-modal);
}

/* Carte du modal */
.modal-card {
    background: var(--color-surface);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-2xl);
    overflow: hidden;
}

/* En-tête du modal */
.modal-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: var(--color-text-inverse);
    padding: var(--spacing-6);
    border-bottom: none;
}

.modal-title {
    font-family: var(--font-family-heading);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    margin: 0;
    text-align: left;
}

/* Corps du modal */
.modal-body {
    padding: var(--spacing-6);
    max-height: calc(90vh - 100px);
    overflow-y: auto;
}

/* Animations de transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity var(--duration-normal) var(--ease-in-out);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-slide-enter-active {
    transition: all var(--duration-normal) var(--ease-out);
}

.modal-slide-leave-active {
    transition: all var(--duration-fast) var(--ease-in);
}

.modal-slide-enter-from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
}

.modal-slide-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
    .custom-modal-backdrop {
        padding: var(--spacing-2);
    }

    .modal-header,
    .modal-body {
        padding: var(--spacing-4);
    }

    .modal-title {
        font-size: var(--font-size-lg);
    }
}
</style>