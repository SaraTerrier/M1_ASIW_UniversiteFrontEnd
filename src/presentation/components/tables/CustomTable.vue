<script setup lang="ts">
defineProps<{
    idAttribute: string,
    columns: { field: string, label: string, formatter: Function | null, onClick?: Function, style?: string }[]
    data: any[]
}>();
</script>

<template>
    <div class="table-container">
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.field" :style="column.style">
                        {{ column.label }}
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="item in data" :key="item[idAttribute]" class="table-row-modern">
                    <td 
                        v-for="column in columns" 
                        :key="column.field" 
                        :style="column.style"
                        :class="{ 'clickable': column.onClick }"
                        @click="column.onClick ? column.onClick(item) : undefined"
                    >
                        <template v-if="column.formatter">
                            <span v-html="column.formatter(item)"></span>
                        </template>
                        <template v-else>
                            {{ item[column.field] }}
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.table-container {
    overflow-x: auto;
    border-radius: var(--border-radius-lg);
}

.table {
    margin-bottom: 0;
    width: 100%;
}

.table thead th {
    background-color: var(--color-neutral-100);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--spacing-4);
    border-bottom: 2px solid var(--color-border);
    white-space: nowrap;
}

.table-row-modern {
    transition: var(--transition-fast);
}

.table-row-modern:hover {
    background-color: var(--color-surface-hover) !important;
}

.table tbody td {
    padding: var(--spacing-4);
    vertical-align: middle;
    border-bottom: 1px solid var(--color-border-light);
}

.clickable {
    cursor: pointer;
    transition: var(--transition-fast);
}

.clickable:hover {
    opacity: 0.8;
}

.clickable:hover :deep(i) {
    transform: scale(1.2);
}

/* Style des icônes dans le tableau */
:deep(i) {
    font-size: var(--font-size-lg);
    transition: var(--transition-fast);
}

:deep(.bi-pen-fill) {
    color: var(--color-primary);
}

:deep(.bi-trash-fill) {
    color: var(--color-danger);
}

:deep(.bi-pen-fill:hover) {
    filter: brightness(1.2);
}

:deep(.bi-trash-fill:hover) {
    filter: brightness(1.2);
}

/* Responsive */
@media (max-width: 768px) {
    .table thead th,
    .table tbody td {
        padding: var(--spacing-3);
        font-size: var(--font-size-sm);
    }
}
</style>