<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="sidebar">
    <!-- Logo / Titre -->
    <div class="sidebar-header">
      <div class="logo-container">
        <i class="bi bi-mortarboard-fill logo-icon"></i>
        <span class="logo-text">Université</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Navigation principale -->
    <ul class="nav-menu">
      <li class="nav-item">
        <RouterLink class="nav-link" active-class="active" to="/">
          <i class="bi bi-house-fill nav-icon"></i>
          <span>Accueil</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link" active-class="active" to="/parcours">
          <i class="bi bi-diagram-3-fill nav-icon"></i>
          <span>Parcours</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link" active-class="active" to="/ues">
          <i class="bi bi-book-fill nav-icon"></i>
          <span>UE</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link" active-class="active" to="/etudiants">
          <i class="bi bi-people-fill nav-icon"></i>
          <span>Étudiants</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link" active-class="active" to="/statistiques">
          <i class="bi bi-graph-up nav-icon"></i>
          <span>Statistiques</span>
        </RouterLink>
      </li>
    </ul>

    <div class="divider"></div>

    <!-- Profil utilisateur -->
    <div class="sidebar-footer">
      <div class="user-profile">
        <img 
          src="@/assets/logoupjv-blanc.png" 
          alt="Profil" 
          class="user-avatar"
        >
        <div class="user-info">
          <strong class="user-name">Enseignant</strong>
          <span class="user-role">Admin</span>
        </div>
      </div>
      
      <div class="user-actions">
        <button class="action-btn" title="Paramètres">
          <i class="bi bi-gear-fill"></i>
        </button>
        <button class="action-btn" title="Déconnexion">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 280px;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-4);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
}

.sidebar-header {
  padding: var(--spacing-4) 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
}

.logo-icon {
  font-size: var(--font-size-3xl);
  color: var(--color-accent);
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.logo-text {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.5px;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: var(--spacing-3) 0;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.nav-item {
  margin-bottom: var(--spacing-2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  font-weight: var(--font-weight-medium);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-accent);
  transform: scaleY(0);
  transition: var(--transition-fast);
}

.nav-link:hover,
.nav-link.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link:hover {
  transform: translateX(4px);
}

.nav-link:hover::before,
.nav-link.active::before {
  transform: scaleY(1);
}

.nav-link.active {
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-icon {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.sidebar-footer {
  padding-top: var(--spacing-4);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-3);
  transition: var(--transition-base);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.15);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-3);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  color: white;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--font-size-lg);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.action-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .sidebar { width: 70px; padding: var(--spacing-2); }
  .logo-text, .nav-link span, .user-info, .user-actions { display: none; }
  .logo-container, .user-profile { justify-content: center; }
  .nav-link { justify-content: center; padding: var(--spacing-3); }
}
</style>
