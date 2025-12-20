<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UesDAO } from '@/domain/daos/UesDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { NoteDAO } from '@/domain/daos/NoteDAO';
import { Ues } from '@/domain/entities/Ues';
import { Parcours } from '@/domain/entities/Parcours';
import { Note } from '@/domain/entities/Note';
import type { Etudiants } from '@/domain/entities/Etudiants';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const currentUe = ref<Ues | null>(null);
const allParcours = ref<Parcours[]>([]);
const selectedParcours = ref<Parcours[]>([]);
const etudiants = ref<Etudiants[]>([]);
const notesMap = ref<Map<number, Note>>(new Map());

const editingNoteId = ref<number | null>(null);
const editingNoteValue = ref<number | null>(null);

const formErrors = ref({
  NumeroUe: null as string | null,
  Intitule: null as string | null,
});

// Charger les données initiales
onMounted(async () => {
  const ueId = parseInt(route.params.id as string);
  
  try {
    // Charger l'UE
    currentUe.value = await UesDAO.getInstance().get(ueId);
    
    // Charger tous les parcours
    allParcours.value = await ParcoursDAO.getInstance().list();
    
    // Initialiser les parcours sélectionnés
    if (currentUe.value.Parcours && Array.isArray(currentUe.value.Parcours)) {
      selectedParcours.value = allParcours.value.filter(p => 
        currentUe.value!.Parcours!.some((up: any) => {
          const parcoursId = typeof up === 'number' ? up : up.Id;
          return parcoursId === p.Id;
        })
      );
    }
    
    // Charger les étudiants
    await loadEtudiants();
    
    // Charger les notes pour cette UE
    await loadNotes();
    
    loading.value = false;
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    alert('Erreur lors du chargement de l\'UE');
    loading.value = false;
  }
});

// Charger les étudiants des parcours sélectionnés
const loadEtudiants = async () => {
  if (!selectedParcours.value || selectedParcours.value.length === 0) {
    etudiants.value = [];
    return;
  }
  
  try {
    const allEtudiants = await EtudiantsDAO.getInstance().list();
    const parcoursIds = selectedParcours.value.map(p => p.Id);
    
    // Filtrer les étudiants appartenant aux parcours sélectionnés
    // ParcoursSuivi peut être soit un ID (number) soit un objet Parcours
    etudiants.value = allEtudiants.filter(e => {
      const parcoursId = typeof e.ParcoursSuivi === 'number' 
        ? e.ParcoursSuivi 
        : (e.ParcoursSuivi as any)?.Id;
      return parcoursId && parcoursIds.includes(parcoursId);
    });

    await loadNotes();
  } catch (error) {
    console.error('Erreur lors du chargement des étudiants:', error);
  }
};

// Charger les notes pour cette UE
const loadNotes = async () => {
  if (!currentUe.value?.Id || etudiants.value.length === 0) return;
  
  try {
    notesMap.value.clear();
    
    // Charger la note de chaque étudiant individuellement
    for (const etudiant of etudiants.value) {
      if (etudiant.Id) {
        const note = await NoteDAO.getInstance().getNoteByEtudiantAndUe(etudiant.Id, currentUe.value.Id);
        if (note) {
          notesMap.value.set(etudiant.Id, note);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notes:', error);
  }
};

// Gérer le changement de parcours
const onParcoursChange = async () => {
  await loadEtudiants();
};

// Obtenir le nom du parcours à partir de son ID ou objet
const getParcoursName = (parcoursSuivi: any): string => {
  if (!parcoursSuivi) return 'N/A';
  
  // Si c'est déjà un objet Parcours avec NomParcours
  if (typeof parcoursSuivi === 'object' && parcoursSuivi.NomParcours) {
    return parcoursSuivi.NomParcours;
  }
  
  // Si c'est un ID (number)
  const parcoursId = typeof parcoursSuivi === 'number' ? parcoursSuivi : parcoursSuivi?.Id;
  if (!parcoursId) return 'N/A';
  
  const parcours = allParcours.value.find(p => p.Id === parcoursId);
  return parcours?.NomParcours || 'N/A';
};

// Obtenir la note d'un étudiant
const getNote = (etudiantId: number | null): string => {
  if (!etudiantId) return '__';
  const noteObj = notesMap.value.get(etudiantId);
  return noteObj?.Valeur !== null && noteObj?.Valeur !== undefined ? noteObj.Valeur.toString() : '__';
};

// Commencer l'édition d'une note
const startEditNote = (etudiantId: number | null) => {
  if (!etudiantId) return;
  editingNoteId.value = etudiantId;
  const noteObj = notesMap.value.get(etudiantId);
  editingNoteValue.value = noteObj?.Valeur !== null && noteObj?.Valeur !== undefined ? noteObj.Valeur : null;
};

// Annuler l'édition d'une note
const cancelEditNote = () => {
  editingNoteId.value = null;
  editingNoteValue.value = null;
};

// Sauvegarder une note
const saveNote = async (etudiantId: number | null) => {
  if (!etudiantId || editingNoteValue.value === null || !currentUe.value?.Id) return;
  
  // Validation
  if (editingNoteValue.value < 0 || editingNoteValue.value > 20) {
    alert('La note doit être entre 0 et 20');
    return;
  }
  
  try {
    const existingNote = notesMap.value.get(etudiantId);
    
    // Vérifier si la note existe vraiment (a un ID valide dans la base)
    if (existingNote && existingNote.Id) {
      // Modifier une note existante
      await NoteDAO.getInstance().updateByEtudiantAndUe(
        etudiantId, 
        currentUe.value.Id, 
        editingNoteValue.value
      );
      
      // L'API renvoie 204, donc on recharge la note depuis l'API
      const updatedNote = await NoteDAO.getInstance().getNoteByEtudiantAndUe(etudiantId, currentUe.value.Id);
      if (updatedNote) {
        notesMap.value.set(etudiantId, updatedNote);
      }
    } else {
      // Créer une nouvelle note
      let newNote = new Note(null, 0, 0, 0);
      newNote.IdEtudiant = etudiantId;
      newNote.IdUe = currentUe.value.Id;
      newNote.Valeur = editingNoteValue.value;
      const savedNote = await NoteDAO.getInstance().create(newNote);
      
      // Mettre à jour la map locale
      notesMap.value.set(etudiantId, savedNote);
    }
    
    cancelEditNote();
    alert('Note enregistrée avec succès');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la note:', error);
    alert('Erreur lors de la sauvegarde de la note');
  }
};

// Supprimer une note
const deleteNote = async (etudiantId: number | null) => {
  if (!etudiantId || !currentUe.value?.Id) return;
  
  const noteObj = notesMap.value.get(etudiantId);
  if (!noteObj) {
    alert('Aucune note à supprimer');
    return;
  }
  
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
    return;
  }
  
  try {
    await NoteDAO.getInstance().deleteByEtudiantAndUe(etudiantId, currentUe.value.Id);
    
    // Retirer de la map locale
    notesMap.value.delete(etudiantId);
    
    alert('Note supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    alert('Erreur lors de la suppression de la note');
  }
};

// Sauvegarder les informations de base de l'UE
const saveUeInfo = async () => {
  // Validation
  formErrors.value.NumeroUe = null;
  formErrors.value.Intitule = null;
  
  if (!currentUe.value?.NumeroUe || currentUe.value.NumeroUe.trim().length < 2) {
    formErrors.value.NumeroUe = 'Le numéro UE doit faire au moins 2 caractères';
    return;
  }
  
  if (!currentUe.value?.Intitule || currentUe.value.Intitule.trim().length < 3) {
    formErrors.value.Intitule = 'L\'intitulé doit faire au moins 3 caractères';
    return;
  }
  
  try {
    // Mettre à jour les parcours
    currentUe.value.Parcours = selectedParcours.value;
    
    // Sauvegarder
    await UesDAO.getInstance().update(currentUe.value.Id!, currentUe.value);
    alert('UE mise à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    alert('Erreur lors de la mise à jour de l\'UE');
  }
};

// Retour à la liste
const goBack = () => {
  router.push('/ues');
};

// Observer les changements de parcours pour validation
watch(() => currentUe.value?.NumeroUe, (newVal) => {
  if (newVal && newVal.trim().length >= 2) {
    formErrors.value.NumeroUe = null;
  }
});

watch(() => currentUe.value?.Intitule, (newVal) => {
  if (newVal && newVal.trim().length >= 3) {
    formErrors.value.Intitule = null;
  }
});
</script>

<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">
      <p>Chargement...</p>
    </div>
    
    <div v-else-if="currentUe">
      <!-- En-tête avec informations de base -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3>Gestion de l'UE</h3>
          <button class="btn btn-secondary btn-sm" @click="goBack">
            ← Retour
          </button>
        </div>
        <div class="card-body">
          <form @submit.prevent="saveUeInfo">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Numéro UE</label>
                  <input 
                    v-model="currentUe.NumeroUe" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.NumeroUe }"
                  />
                  <div v-if="formErrors.NumeroUe" class="invalid-feedback">
                    {{ formErrors.NumeroUe }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Intitulé</label>
                  <input 
                    v-model="currentUe.Intitule" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.Intitule }"
                  />
                  <div v-if="formErrors.Intitule" class="invalid-feedback">
                    {{ formErrors.Intitule }}
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary">
              Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>

      <!-- Gestion des parcours -->
      <div class="card mb-4">
        <div class="card-header">
          <h4>Parcours associés</h4>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Ajouter/Modifier des parcours</label>
            <v-select 
              multiple 
              label="NomParcours" 
              v-model="selectedParcours" 
              :options="allParcours"
              @update:modelValue="onParcoursChange"
            ></v-select>
          </div>
          
          <div v-if="selectedParcours && selectedParcours.length > 0">
            <h5>Parcours sélectionnés :</h5>
            <ul class="list-group">
              <li 
                v-for="parcours in selectedParcours" 
                :key="parcours.Id || 0" 
                class="list-group-item"
              >
                {{ parcours.NomParcours }} ({{ parcours.AnneeFormation }})
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Gestion des notes des étudiants -->
      <div class="card">
        <div class="card-header">
          <h4>Notes des étudiants</h4>
        </div>
        <div class="card-body">
          <div v-if="etudiants.length === 0" class="alert alert-info">
            Aucun étudiant inscrit dans les parcours sélectionnés
          </div>
          
          <div v-else>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>N° Étudiant</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Parcours</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="etudiant in etudiants" :key="etudiant.Id || 0">
                  <td>{{ etudiant.NumEtud }}</td>
                  <td>{{ etudiant.Nom }}</td>
                  <td>{{ etudiant.Prenom }}</td>
                  <td>{{ getParcoursName(etudiant.ParcoursSuivi) }}</td>
                  <td>
                    <span v-if="!editingNoteId || editingNoteId !== etudiant.Id">
                      {{ getNote(etudiant.Id) }}
                    </span>
                    <input 
                      v-else
                      v-model.number="editingNoteValue"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      class="form-control form-control-sm"
                      style="width: 80px; display: inline-block;"
                    />
                  </td>
                  <td>
                    <button 
                      v-if="!editingNoteId || editingNoteId !== etudiant.Id"
                      class="btn btn-sm btn-primary me-2"
                      @click="startEditNote(etudiant.Id)"
                    >
                      {{ getNote(etudiant.Id) === '__' ? 'Ajouter' : 'Modifier' }}
                    </button>
                    <button 
                      v-if="(!editingNoteId || editingNoteId !== etudiant.Id) && getNote(etudiant.Id) !== '__'"
                      class="btn btn-sm btn-danger"
                      @click="deleteNote(etudiant.Id)"
                    >
                      Supprimer
                    </button>
                    <template v-if="editingNoteId === etudiant.Id">
                      <button 
                        class="btn btn-sm btn-success me-2"
                        @click="saveNote(etudiant.Id)"
                      >
                        Valider
                      </button>
                      <button 
                        class="btn btn-sm btn-secondary"
                        @click="cancelEditNote"
                      >
                        Annuler
                      </button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-danger">
      Erreur : UE introuvable
    </div>
  </div>
</template>


<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  background-color: #273656;
  color: white;
}

.table {
  margin-bottom: 0;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
