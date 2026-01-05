<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useToast } from 'vue-toastification';
import { UesDAO } from '@/domain/daos/UesDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { NoteDAO } from '@/domain/daos/NoteDAO';
import { Ues } from '@/domain/entities/Ues';
import { Parcours } from '@/domain/entities/Parcours';
import { Note } from '@/domain/entities/Note';
import type { Etudiants } from '@/domain/entities/Etudiants';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import UeInfoCard from '@/presentation/components/ue/UeInfoCard.vue';
import ParcoursSelector from '@/presentation/components/ue/ParcoursSelector.vue';
import NotesTable from '@/presentation/components/ue/NotesTable.vue';


const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const isSaving = ref(false);
const currentUe = ref<Ues | null>(null);
const allParcours = ref<Parcours[]>([]);
const selectedParcours = ref<Parcours[]>([]);
const previousParcours = ref<Parcours[]>([]);
const etudiants = ref<Etudiants[]>([]);
const notesMap = ref<Map<number, Note>>(new Map());



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
      // Sauvegarder l'état initial
      previousParcours.value = [...selectedParcours.value];
    }
    
    // Charger les étudiants
    await loadEtudiants();
    
    // Charger les notes pour cette UE
    await loadNotes();
    
    loading.value = false;
    toast.success(`✅ UE "${currentUe.value.Intitule}" chargée avec succès`, {
      timeout: 2000
    });
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    toast.error('❌ Erreur lors du chargement de l\'UE', {
      timeout: 4000
    });
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
  if (!currentUe.value?.Id) return;
  
  try {
    // Identifier les parcours ajoutés
    const addedParcours = selectedParcours.value.filter(
      sp => !previousParcours.value.some(pp => pp.Id === sp.Id)
    );
    
    // Identifier les parcours supprimés
    const removedParcours = previousParcours.value.filter(
      pp => !selectedParcours.value.some(sp => sp.Id === pp.Id)
    );
    
    // Ajouter les nouveaux parcours via l'API
    for (const parcours of addedParcours) {
      if (parcours.Id) {
        await ParcoursDAO.getInstance().addUEToParcours(parcours.Id, currentUe.value.Id);
        toast.success(`✅ UE ajoutée au parcours "${parcours.NomParcours}"`, {
          timeout: 2500
        });
      }
    }

    // Supprimer les parcours via l'API si nécessaire
    for (const parcours of removedParcours) {
      if (parcours.Id) {
        await ParcoursDAO.getInstance().removeUEFromParcours(parcours.Id, currentUe.value.Id);
        toast.success(`✅ UE retirée du parcours "${parcours.NomParcours}"`, {
          timeout: 2500
        });
      }
    }
    
    // Mettre à jour la liste précédente
    previousParcours.value = [...selectedParcours.value];
    
    // Recharger les étudiants
    await loadEtudiants();
  } catch (error) {
    console.error('Erreur lors de la mise à jour des parcours:', error);
    toast.error('❌ Erreur lors de la mise à jour des parcours', {
      timeout: 4000
    });
  }
};



// Sauvegarder une note
const saveNote = async (etudiantId: number, noteValue: number) => {
  if (!currentUe.value?.Id) return;
  
  // Validation
  if (noteValue < 0 || noteValue > 20) {
    toast.error('⚠️ La note doit être entre 0 et 20', {
      timeout: 3000
    });
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
        noteValue
      );
      
      // L'API renvoie 204, donc on recharge la note depuis l'API
      const updatedNote = await NoteDAO.getInstance().getNoteByEtudiantAndUe(etudiantId, currentUe.value.Id);
      if (updatedNote) {
        notesMap.value.set(etudiantId, updatedNote);
      }
      
      toast.info('📝 Note mise à jour avec succès', {
        timeout: 3000
      });
    } else {
      // Créer une nouvelle note
      let newNote = new Note(null, 0, 0, 0);
      newNote.IdEtudiant = etudiantId;
      newNote.IdUe = currentUe.value.Id;
      newNote.Valeur = noteValue;
      const savedNote = await NoteDAO.getInstance().create(newNote);
      
      // Mettre à jour la map locale
      notesMap.value.set(etudiantId, savedNote);
      
      toast.success('✨ Note créée avec succès', {
        timeout: 3000
      });
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la note:', error);
    toast.error('❌ Erreur lors de la sauvegarde de la note', {
      timeout: 4000
    });
  }
};

// Supprimer une note
const deleteNote = async (etudiantId: number) => {
  if (!currentUe.value?.Id) return;
  
  const noteObj = notesMap.value.get(etudiantId);
  if (!noteObj) {
    toast.warning('⚠️ Aucune note à supprimer', {
      timeout: 2000
    });
    return;
  }
  
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: 'Voulez-vous vraiment supprimer cette note ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '🗑️ Supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#e63946',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
    showClass: {
      popup: 'animate-scale-in'
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await NoteDAO.getInstance().deleteByEtudiantAndUe(etudiantId, currentUe.value!.Id!);
        
        // Retirer de la map locale
        notesMap.value.delete(etudiantId);
        
        toast.success('🗑️ Note supprimée avec succès', {
          timeout: 3000
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de la note:', error);
        toast.error('❌ Erreur lors de la suppression de la note', {
          timeout: 4000
        });
      }
    }
  });
};

// Sauvegarder les informations de base de l'UE
const saveUeInfo = async (ueData: { NumeroUe: string; Intitule: string }) => {
  if (!currentUe.value) return;
  
  isSaving.value = true;
  try {
    // Créer un objet Ues pour l'update
    const ueToUpdate = new Ues(
      currentUe.value.Id,
      ueData.Intitule,
      ueData.NumeroUe,
      selectedParcours.value
    );
    
    console.log('Données envoyées à l\'API:', ueToUpdate.toJSON());

    // Mettre à jour l'UE via l'API
    await UesDAO.getInstance().update(currentUe.value.Id!, ueToUpdate);
    
    
    // Mettre à jour l'objet local
    currentUe.value.NumeroUe = ueData.NumeroUe;
    currentUe.value.Intitule = ueData.Intitule;
    currentUe.value.Parcours = selectedParcours.value;
    
    toast.success('✨ UE mise à jour avec succès', {
      timeout: 3000
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    toast.error('❌ Erreur lors de la mise à jour de l\'UE', {
      timeout: 4000
    });
  } finally {
    isSaving.value = false;
  }
};

// Retour à la liste
const goBack = () => {
  router.push('/ues');
};
</script>

<template>
  <div class="container-fluid page-container">
    <!-- Loading state with skeleton -->
    <div v-if="loading" class="animate-fade-in">
      <!-- Skeleton Header -->
      <div class="page-header animate-slide-in-down">
        <div class="page-header-content">
          <div class="skeleton" style="width: 64px; height: 64px; border-radius: var(--border-radius-xl);"></div>
          <div style="flex: 1;">
            <div class="skeleton" style="width: 300px; height: 32px; margin-bottom: var(--spacing-2);"></div>
            <div class="skeleton" style="width: 450px; height: 20px;"></div>
          </div>
        </div>
        <div class="skeleton" style="width: 120px; height: 44px; border-radius: var(--border-radius-lg);"></div>
      </div>
      
      <!-- Skeleton Cards -->
      <div class="skeleton-card-container">
        <div class="skeleton-card" v-for="i in 3" :key="i">
          <div class="skeleton" style="width: 100%; height: 60px; margin-bottom: var(--spacing-4);"></div>
          <div class="skeleton" style="width: 100%; height: 150px;"></div>
        </div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="!currentUe" class="error-container animate-fade-in">
      <div class="error-icon">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <h3>UE introuvable</h3>
      <p>L'unité d'enseignement que vous recherchez n'existe pas ou a été supprimée.</p>
      <CustomButton 
        :color="BootstrapButtonEnum.info" 
        @click="goBack"
      >
        <i class="bi bi-arrow-left me-2"></i>
        Retour à la liste
      </CustomButton>
    </div>
    
    <!-- Main content -->
    <div v-else>
      <!-- En-tête avec informations UE -->
      <div class="page-header animate-slide-in-down">
        <div class="page-header-content">
          <div class="page-icon">
            <i class="bi bi-book-fill"></i>
          </div>
          <div class="page-header-info">
            <h2 class="page-title">{{ currentUe.Intitule }}</h2>
            <p class="page-subtitle">
              <span class="ue-badge">{{ currentUe.NumeroUe }}</span>
              <span class="separator">•</span>
              Gestion complète de l'UE
            </p>
          </div>
        </div>
        <CustomButton 
          :color="BootstrapButtonEnum.info" 
          @click="goBack"
        >
          <i class="bi bi-arrow-left me-2"></i>
          Retour
        </CustomButton>
      </div>

      <!-- Informations générales de l'UE -->
      <UeInfoCard 
        :ue="currentUe"
        :is-saving="isSaving"
        @save="saveUeInfo"
      />

      <!-- Gestion des parcours -->
      <ParcoursSelector
        :all-parcours="allParcours"
        v-model:selected-parcours="selectedParcours"
        @change="onParcoursChange"
      />

      <!-- Gestion des notes des étudiants -->
      <NotesTable
        :etudiants="etudiants"
        :notes-map="notesMap"
        :all-parcours="allParcours"
        @save-note="saveNote"
        @delete-note="deleteNote"
      />
    </div>
  </div>
</template>

<style scoped>
/* === LAYOUT & CONTAINERS === */
.skeleton-card-container {
  display: grid;
  gap: var(--spacing-6);
}

.skeleton-card,
.error-container {
  background: var(--color-surface);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

.error-container {
  text-align: center;
  padding: var(--spacing-16);
  margin: var(--spacing-8) auto;
  max-width: 600px;
}

.error-icon {
  font-size: 80px;
  color: var(--color-danger);
  margin-bottom: var(--spacing-6);
  animation: float 3s ease-in-out infinite;
}

.error-container h3 {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-3);
}

.error-container p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

/* === HEADER === */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-5);
  flex-wrap: wrap;
}

.page-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  flex: 1;
}

.page-header-info {
  flex: 1;
}

.ue-badge {
  display: inline-block;
  background: var(--color-accent);
  color: var(--color-primary-dark);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.separator {
  margin: 0 var(--spacing-2);
  color: var(--color-text-tertiary);
}

/* === ANIMATIONS === */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }
  
  .page-header-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>