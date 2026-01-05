<script setup lang="ts">
</script>

<template>
  <main>
    <div class="presentation">
      <h1>Bienvenue sur le site de votre université !</h1>
      <p>Ici, vous trouverez tous les outils en tant qu'etudiant et enseignant afin de suivre et gérer vos U.E.</p>
    </div>
  </main>
</template>

<style scoped>
.presentation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  text-align: center;
  padding: var(--spacing-6);
}

.presentation h1 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-4xl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-4);
}

.presentation p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
}
</style>