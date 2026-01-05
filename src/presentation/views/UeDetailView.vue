<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useToast } from 'vue-toastification'
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

/**
 * Hook onMounted - Chargement initial des données
 * 
 * Séquence d'initialisation :
 * 1. Récupère l'ID de l'UE depuis les paramètres de la route
 * 2. Charge l'UE et tous les parcours disponibles
 * 3. Initialise les parcours sélectionnés en comparant avec les parcours de l'UE
 * 4. Charge les étudiants filtrés par parcours
 * 5. Charge les notes de chaque étudiant pour cette UE
 * 6. Affiche un message de succès ou d'erreur
 */
onMounted(async () => {
  const ueId = parseInt(route.params.id as string);
  
  try {
    currentUe.value = await UesDAO.getInstance().get(ueId);
    
    allParcours.value = await ParcoursDAO.getInstance().list();
    
    if (currentUe.value.Parcours && Array.isArray(currentUe.value.Parcours)) {
      selectedParcours.value = allParcours.value.filter(p => 
        currentUe.value!.Parcours!.some((up: any) => {
          const parcoursId = typeof up === 'number' ? up : up.Id;
          return parcoursId === p.Id;
        })
      );
      previousParcours.value = [...selectedParcours.value];
    }
    
    await loadEtudiants();
    
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

/**
 * Charge les étudiants en fonction des parcours sélectionnés
 * 
 * Processus :
 * 1. Si aucun parcours n'est sélectionné, vide la liste des étudiants
 * 2. Charge tous les étudiants disponibles
 * 3. Filtre uniquement les étudiants appartenant aux parcours sélectionnés
 * 4. Gère la compatibilité entre différents formats (ID ou objet Parcours)
 * 5. Recharge les notes pour les étudiants filtrés
 */
const loadEtudiants = async () => {
  if (!selectedParcours.value || selectedParcours.value.length === 0) {
    etudiants.value = [];
    return;
  }
  
  try {
    const allEtudiants = await EtudiantsDAO.getInstance().list();
    const parcoursIds = selectedParcours.value.map(p => p.Id);
    
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

/**
 * Charge toutes les notes de l'UE pour les étudiants affichés
 * 
 * Cette fonction :
 * - Vide la Map des notes existante
 * - Charge individuellement la note de chaque étudiant pour l'UE actuelle
 * - Stocke les notes dans une Map indexée par IdEtudiant pour accès O(1)
 * 
 */
const loadNotes = async () => {
  if (!currentUe.value?.Id || etudiants.value.length === 0) return;
  
  try {
    notesMap.value.clear();
    
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

/**
 * Gère les changements de sélection des parcours
 * 
 * 1. Compare les parcours précédents et nouveaux pour détecter les ajouts/suppressions
 * 2. Pour chaque parcours ajouté : appelle l'API pour associer l'UE au parcours
 * 3. Pour chaque parcours supprimé : appelle l'API pour dissocier l'UE du parcours
 * 4. Met à jour la référence des parcours précédents
 * 5. Recharge la liste des étudiants filtrée selon les nouveaux parcours
 * 
 */
const onParcoursChange = async () => {
  if (!currentUe.value?.Id) return;
  
  try {
    const addedParcours = selectedParcours.value.filter(
      sp => !previousParcours.value.some(pp => pp.Id === sp.Id)
    );
    
    const removedParcours = previousParcours.value.filter(
      pp => !selectedParcours.value.some(sp => sp.Id === pp.Id)
    );
    
    for (const parcours of addedParcours) {
      if (parcours.Id) {
        await ParcoursDAO.getInstance().addUEToParcours(parcours.Id, currentUe.value.Id);
        toast.success(`✅ UE ajoutée au parcours "${parcours.NomParcours}"`, {
          timeout: 2500
        });
      }
    }

    for (const parcours of removedParcours) {
      if (parcours.Id) {
        await ParcoursDAO.getInstance().removeUEFromParcours(parcours.Id, currentUe.value.Id);
        toast.success(`✅ UE retirée du parcours "${parcours.NomParcours}"`, {
          timeout: 2500
        });
      }
    }
    
    previousParcours.value = [...selectedParcours.value];
    
    await loadEtudiants();
  } catch (error) {
    console.error('Erreur lors de la mise à jour des parcours:', error);
    toast.error('❌ Erreur lors de la mise à jour des parcours', {
      timeout: 4000
    });
  }
};



/**
 * Crée ou met à jour une note pour un étudiant
 * 
 * Validation :
 * - Vérifie que la note est dans l'intervalle [0, 20]
 * 
 * Logique :
 * - Si la note existe déjà avec un ID valide : mise à jour (UPDATE)
 *   → Appelle updateByEtudiantAndUe puis recharge la note depuis l'API
 * - Sinon : création d'une nouvelle note (CREATE)
 *   → Crée une instance Note et l'enregistre via l'API
 * - Met à jour la Map locale avec la note sauvegardée
 * 
 */
const saveNote = async (etudiantId: number, noteValue: number) => {
  if (!currentUe.value?.Id) return;
  
  if (noteValue < 0 || noteValue > 20) {
    toast.error('⚠️ La note doit être entre 0 et 20', {
      timeout: 3000
    });
    return;
  }
  
  try {
    const existingNote = notesMap.value.get(etudiantId);
    
    if (existingNote && existingNote.Id) {
      await NoteDAO.getInstance().updateByEtudiantAndUe(
        etudiantId, 
        currentUe.value.Id, 
        noteValue
      );
      
      const updatedNote = await NoteDAO.getInstance().getNoteByEtudiantAndUe(etudiantId, currentUe.value.Id);
      if (updatedNote) {
        notesMap.value.set(etudiantId, updatedNote);
      }
      
      toast.info('📝 Note mise à jour avec succès', {
        timeout: 3000
      });
    } else {
      let newNote = new Note(null, 0, 0, 0);
      newNote.IdEtudiant = etudiantId;
      newNote.IdUe = currentUe.value.Id;
      newNote.Valeur = noteValue;
      const savedNote = await NoteDAO.getInstance().create(newNote);
      
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

/**
 * Supprime une note après confirmation de l'utilisateur
 * 
 * Processus :
 * 1. Vérifie qu'une note existe pour cet étudiant
 * 2. Affiche une modale de confirmation (SweetAlert2) avec style personnalisé
 * 3. Si confirmé, supprime la note via l'API (deleteByEtudiantAndUe)
 * 4. Retire la note de la Map locale pour mettre à jour l'interface
 * 5. Affiche un message de succès ou d'erreur
 * 
 */
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

/**
 * Met à jour les informations de base de l'UE (Numéro, Intitulé)
 * 
 * Processus :
 * 1. Active l'indicateur de sauvegarde pour l'UI
 * 2. Crée un objet Ues complet avec les nouvelles données
 * 3. Appelle l'API pour mettre à jour l'UE
 * 4. Met à jour l'état local avec les nouvelles valeurs
 * 5. Affiche un message de succès ou d'erreur
 * 
 */
const saveUeInfo = async (ueData: { NumeroUe: string; Intitule: string }) => {
  if (!currentUe.value) return;
  
  isSaving.value = true;
  try {
    const ueToUpdate = new Ues(
      currentUe.value.Id,
      ueData.Intitule,
      ueData.NumeroUe,
      selectedParcours.value
    );

    await UesDAO.getInstance().update(currentUe.value.Id!, ueToUpdate);
    
    
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

/**
 * Navigation de retour vers la liste des UEs
 */
const goBack = () => {
  router.push('/ues');
};
</script>

<template>
  <div class="container-fluid page-container">
    <!-- Squelettes animés affichés pendant le chargement initial -->
    <div v-if="loading" class="animate-fade-in">
      <!-- Squelette : En-tête avec icône, titre et bouton -->
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
      
      <!-- Squelettes : Cartes de contenu (3 cartes) -->
      <div class="skeleton-card-container">
        <div class="skeleton-card" v-for="i in 3" :key="i">
          <div class="skeleton" style="width: 100%; height: 60px; margin-bottom: var(--spacing-4);"></div>
          <div class="skeleton" style="width: 100%; height: 150px;"></div>
        </div>
      </div>
    </div>
    
    <!-- Affiché si l'UE n'existe pas ou a été supprimée -->
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
    
    <div v-else>
      <!-- En-tête : Titre de l'UE, badge du numéro et bouton retour -->
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

      <!-- Carte d'informations : affichage et édition des infos de base de l'UE -->
      <UeInfoCard 
        :ue="currentUe"
        :is-saving="isSaving"
        @save="saveUeInfo"
      />

      <!-- Sélecteur multi-parcours : ajoute/supprime l'UE des parcours sélectionnés -->
      <ParcoursSelector
        :all-parcours="allParcours"
        v-model:selected-parcours="selectedParcours"
        @change="onParcoursChange"
      />

      <!-- Tableau des notes : affiche les étudiants filtrés avec saisie/suppression de notes -->
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

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

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