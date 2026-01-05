<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './presentation/components/navigation/NavBar.vue'
</script>

<template>
  <main>
    <div class="application d-flex flex-nowrap">
      <NavBar />
      <RouterView class="content" />
    </div>
  </main>
</template>

<style scoped>
main {
  overflow-x: hidden;
}

main .application {
  width: 100%;
  min-height: 100vh;
  display: flex;
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: var(--spacing-6);
}
</style>
