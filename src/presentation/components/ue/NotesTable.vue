<script setup lang="ts">
import { ref } from 'vue';
import type { Etudiants } from '@/domain/entities/Etudiants';
import type { Note } from '@/domain/entities/Note';
import type { Parcours } from '@/domain/entities/Parcours';

/**
 * Props du composant NotesTable
 * - etudiants : Liste des étudiants à afficher dans le tableau
 * - notesMap : Map contenant les notes indexées par ID étudiant
 * - allParcours : Liste de tous les parcours pour résolution des noms
 */
interface Props {
  etudiants: Etudiants[];
  notesMap: Map<number, Note>;
  allParcours: Parcours[];
}

/**
 * Événements émis par le composant
 * - save-note : Émis lors de la sauvegarde d'une note (création/modification)
 * - delete-note : Émis lors de la suppression d'une note
 */
interface Emits {
  (e: 'save-note', etudiantId: number, value: number): void;
  (e: 'delete-note', etudiantId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ID de l'étudiant dont la note est en cours d'édition (null = aucune édition en cours)
const editingNoteId = ref<number | null>(null);
// Valeur temporaire de la note en cours d'édition
const editingNoteValue = ref<number | null>(null);

/**
 * Récupère le nom du parcours d'un étudiant
 * 
 * Gère plusieurs formats de données :
 * - Objet avec propriété NomParcours : retourne directement le nom
 * - ID numérique : recherche le parcours dans allParcours
 * - Valeur nulle/invalide : retourne 'N/A'
 */
const getParcoursName = (parcoursSuivi: any): string => {
  if (!parcoursSuivi) return 'N/A';
  
  // Si c'est déjà un objet avec le nom, le retourner directement
  if (typeof parcoursSuivi === 'object' && parcoursSuivi.NomParcours) {
    return parcoursSuivi.NomParcours;
  }
  
  // Extraire l'ID (nombre ou propriété Id de l'objet)
  const parcoursId = typeof parcoursSuivi === 'number' ? parcoursSuivi : parcoursSuivi?.Id;
  if (!parcoursId) return 'N/A';
  
  // Rechercher le parcours dans la liste complète
  const parcours = props.allParcours.find(p => p.Id === parcoursId);
  return parcours?.NomParcours || 'N/A';
};

/**
 * Récupère la note d'un étudiant depuis la Map
 * 
 */
const getNote = (etudiantId: number | null): string => {
  if (!etudiantId) return '__';
  const noteObj = props.notesMap.get(etudiantId);
  return noteObj?.Valeur !== null && noteObj?.Valeur !== undefined ? noteObj.Valeur.toString() : '__';
};

/**
 * Démarre le mode édition pour la note d'un étudiant
 * 
 * Processus :
 * 1. Active l'édition en stockant l'ID de l'étudiant
 * 2. Charge la valeur actuelle de la note (ou null si pas de note)
 * 3. Affiche un champ input à la place de l'affichage de la note
 */
const startEditNote = (etudiantId: number | null) => {
  if (!etudiantId) return;
  editingNoteId.value = etudiantId;
  const noteObj = props.notesMap.get(etudiantId);
  editingNoteValue.value = noteObj?.Valeur !== null && noteObj?.Valeur !== undefined ? noteObj.Valeur : null;
};

/**
 * Annule le mode édition en cours
 * Réinitialise les variables d'édition à null
 */
const cancelEditNote = () => {
  editingNoteId.value = null;
  editingNoteValue.value = null;
};

/**
 * Sauvegarde la note éditée
 * 
 * Processus :
 * 1. Vérifie que l'ID étudiant et la valeur sont valides
 * 2. Émet l'événement 'save-note' vers le parent
 * 3. Annule le mode édition
 */
const saveNote = (etudiantId: number | null) => {
  if (!etudiantId || editingNoteValue.value === null) return;
  emit('save-note', etudiantId, editingNoteValue.value);
  cancelEditNote();
};

/**
 * Supprime la note d'un étudiant
 * Émet l'événement 'delete-note' vers le parent qui gérera la confirmation
 */
const deleteNote = (etudiantId: number | null) => {
  if (!etudiantId) return;
  emit('delete-note', etudiantId);
};
</script>

<template>
  <!-- Carte principale du tableau des notes -->
  <div class="card main-card animate-slide-in-up" style="animation-delay: 0.2s;">
    <!-- En-tête avec titre et compteur d'étudiants -->
    <div class="card-header">
      <div class="card-title">
        <i class="bi bi-clipboard-data me-2 color-white"></i>
        <h4>Notes des étudiants</h4>
        <span class="badge-count" v-if="etudiants.length > 0">
          {{ etudiants.length }}
        </span>
      </div>
    </div>
    <div class="card-body">
      <!-- État vide : affiché si aucun étudiant n'est inscrit aux parcours sélectionnés -->
      <div v-if="etudiants.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <i class="bi bi-people"></i>
        </div>
        <h4>Aucun étudiant inscrit</h4>
        <p>Sélectionnez des parcours pour voir les étudiants associés</p>
      </div>
      
      <!-- Tableau des étudiants avec leurs notes (mode édition inline) -->
      <div v-else class="table-wrapper">
        <table class="table table-modern">
          <!-- En-tête du tableau avec icônes -->
          <thead>
            <tr>
              <th><i class="bi bi-hash me-1"></i> N° Étudiant</th>
              <th><i class="bi bi-person me-1"></i> Nom</th>
              <th><i class="bi bi-person me-1"></i> Prénom</th>
              <th><i class="bi bi-diagram-3 me-1"></i> Parcours</th>
              <th class="text-center"><i class="bi bi-award me-1"></i> Note / 20</th>
              <th class="text-center"><i class="bi bi-gear me-1"></i> Actions</th>
            </tr>
          </thead>
          <!-- Corps du tableau : une ligne par étudiant -->
          <tbody>
            <tr v-for="etudiant in etudiants" :key="etudiant.Id || 0" class="table-row-hover">
              <!-- Colonne : Numéro étudiant -->
              <td class="fw-semibold">{{ etudiant.NumEtud }}</td>
              <!-- Colonne : Nom -->
              <td>{{ etudiant.Nom }}</td>
              <!-- Colonne : Prénom -->
              <td>{{ etudiant.Prenom }}</td>
              <!-- Colonne : Parcours avec badge -->
              <td>
                <span class="badge bg-secondary">
                  {{ getParcoursName(etudiant.ParcoursSuivi) }}
                </span>
              </td>
              <!-- Colonne : Note (affichage ou édition) -->
              <td class="text-center">
                <!-- Mode affichage : note ou '__' si pas de note -->
                <span 
                  v-if="!editingNoteId || editingNoteId !== etudiant.Id" 
                  class="note-display"
                  :class="{ 'note-empty': getNote(etudiant.Id) === '__' }"
                >
                  {{ getNote(etudiant.Id) }}
                </span>
                <!-- Mode édition : champ input numérique (0-20, pas de 0.5) -->
                <input 
                  v-else
                  v-model.number="editingNoteValue"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  class="form-control form-control-sm note-input"
                  placeholder="0-20"
                  @keyup.enter="saveNote(etudiant.Id)"
                  @keyup.escape="cancelEditNote"
                />
              </td>
              <!-- Colonne : Actions (boutons contextuels selon le mode) -->
              <td class="text-center">
                <div class="action-buttons">
                  <!-- Mode affichage : boutons Éditer/Ajouter et Supprimer -->
                  <template v-if="!editingNoteId || editingNoteId !== etudiant.Id">
                    <!-- Bouton Éditer (ou Ajouter si pas de note) -->
                    <button 
                      class="btn btn-sm btn-action btn-edit"
                      @click="startEditNote(etudiant.Id)"
                      :title="getNote(etudiant.Id) === '__' ? 'Ajouter une note' : 'Modifier la note'"
                    >
                      <i :class="getNote(etudiant.Id) === '__' ? 'bi bi-plus-circle' : 'bi bi-pencil'"></i>
                    </button>
                    <!-- Bouton Supprimer (visible uniquement si note existante) -->
                    <button 
                      v-if="getNote(etudiant.Id) !== '__'"
                      class="btn btn-sm btn-action btn-delete"
                      @click="deleteNote(etudiant.Id)"
                      title="Supprimer la note"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </template>
                  <!-- Mode édition : boutons Valider et Annuler -->
                  <template v-else>
                    <!-- Bouton Valider : sauvegarde la note -->
                    <button 
                      class="btn btn-sm btn-action btn-validate"
                      @click="saveNote(etudiant.Id)"
                      title="Valider"
                    >
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <!-- Bouton Annuler : annule l'édition sans sauvegarder -->
                    <button 
                      class="btn btn-sm btn-action btn-cancel"
                      @click="cancelEditNote"
                      title="Annuler"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-display {
  display: inline-block;
  min-width: 60px;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-success-light);
  color: white;
  font-weight: var(--font-weight-bold);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
}

.note-display.note-empty {
  background: var(--color-neutral-300);
  color: var(--color-text-secondary);
}

.note-input {
  width: 80px !important;
  display: inline-block !important;
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-2);
  justify-content: center;
}

.btn-action {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: var(--border-radius-md);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  cursor: pointer;
  font-size: var(--font-size-base);
  color: white;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-edit {
  background: linear-gradient(135deg, var(--color-info), var(--color-info-light));
}

.btn-delete {
  background: linear-gradient(135deg, var(--color-danger), var(--color-danger-light));
}

.btn-validate {
  background: linear-gradient(135deg, var(--color-success), var(--color-success-light));
}

.btn-cancel {
  background: linear-gradient(135deg, var(--color-neutral-600), var(--color-neutral-700));
}

@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>
