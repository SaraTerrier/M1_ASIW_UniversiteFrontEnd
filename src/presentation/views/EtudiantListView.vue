<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2'; 
import { useToast } from 'vue-toastification'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Etudiants } from '@/domain/entities/Etudiants';
import { Parcours } from '@/domain/entities/Parcours';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import EtudiantsForm from '@/presentation/components/forms/EtudiantsForm.vue';
import CustomTable from '../components/tables/CustomTable.vue';
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const toast = useToast();

// Référence vers le composant EtudiantsForm pour appeler openForm()
const etudiantsForm = ref<typeof EtudiantsForm | null>(null);
// Liste de tous les étudiants affichés dans le tableau
const etudiants = ref<Etudiants[]>([]);
// Map des parcours indexés par ID pour résolution rapide des noms
const parcoursMap = ref<Map<number, Parcours>>(new Map());
// Indicateur de chargement initial
const isLoading = ref<boolean>(true);
// Indicateur de suppression en cours
const isDeleting = ref<boolean>(false);

/**
 * Callback appelé après la création réussie d'un étudiant
 * Ajoute le nouvel étudiant au début de la liste pour qu'il soit visible immédiatement
 * 
 */
const onEtudiantCreated = (newEtudiant: Etudiants) => { 
  etudiants.value.unshift(newEtudiant);
  toast.success('✨ Étudiant créé avec succès !', {
    timeout: 3000
  });
}; 

/**
 * Callback appelé après la mise à jour réussie d'un étudiant
 * Recherche l'étudiant dans la liste et le remplace par la version mise à jour
 * 
 */
const onEtudiantUpdated = (updatedEtudiant: Etudiants) => { 
  const index = etudiants.value.findIndex(p => p.Id === updatedEtudiant.Id); 
  if (index !== -1) { 
    etudiants.value[index] = updatedEtudiant;
    toast.info('📝 Étudiant mis à jour !', {
      timeout: 3000
    });
  }
};

/**
 * Gère la suppression d'un étudiant avec confirmation
 * 
 * Processus :
 * 1. Affiche une modale de confirmation (SweetAlert2) avec le nom de l'étudiant
 * 2. Si confirmé, active l'indicateur de suppression
 * 3. Appelle l'API pour supprimer l'étudiant
 * 4. Retire l'étudiant de la liste locale
 * 5. Affiche un message de succès ou d'erreur
 * 
 */
const onDeleteEtudiant = (p: Etudiants) => { 
  Swal.fire({ 
    title: 'Êtes-vous sûr ?', 
    text: `Voulez-vous vraiment supprimer l'étudiant "${p.Prenom} ${p.Nom}" ?`,
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
  }).then((result) => { 
    if (result.isConfirmed) {
      isDeleting.value = true;
      EtudiantsDAO.getInstance().delete(p.Id!).then(() => { 
        etudiants.value = etudiants.value.filter((item) => item.Id !== p.Id);
        toast.success('🗑️ Étudiant supprimé avec succès !', {
          timeout: 3000
        });
      }).catch((error) => {
        console.error('Erreur lors de la suppression:', error);
        toast.error('❌ Erreur lors de la suppression de l’étudiant', {
          timeout: 4000
        });
      }).finally(() => {
        isDeleting.value = false;
      });
    } 
  }) 
} 


/**
 * Formateur pour la colonne Édition
 * Retourne une icône stylisée pour le bouton d'édition
 * 
 */
const formatterEdition = (etudiant: Etudiants) => { 
  return '<i class="bi bi-pen-fill text-primary"></i>'; 
}; 

/**
 * Formateur pour la colonne Suppression
 * Retourne une icône stylisée pour le bouton de suppression
 * 
 */
const formatterSuppression = (etudiant: Etudiants) => { 
  return '<i class="bi bi-trash-fill text-danger"></i>'; 
};

/**
 * Formateur pour la colonne Parcours
 * Affiche le nom du parcours suivi par l'étudiant
 * 
 * Gère deux formats de données :
 * - ID (number) : résolution via parcoursMap
 * - Objet Parcours : accès direct au nom
 * 
 */
const formatterParcours = (etudiant: Etudiants) => {
  const parcoursId = etudiant.ParcoursSuivi;

  if (!parcoursId) return [];

  if (typeof parcoursId === 'number') {
      const parcours = parcoursMap.value.get(parcoursId);
      return parcours ? parcours.NomParcours : `Parcours ${parcoursId}`;
  } else {
      return parcoursId.NomParcours;
  }
};

/**
 * Définition des colonnes pour CustomTable
 * Chaque colonne spécifie :
 * - field : nom du champ dans l'entité Etudiants
 * - label : libellé affiché dans l'en-tête
 * - formatter : fonction de formatage personnalisé (optionnel)
 * - onClick : action au clic (optionnel)
 * - style : styles CSS personnalisés (optionnel)
 */
const columns = [ 
  { field: 'EditionEtudiants', label: 'Edition', formatter: formatterEdition, onClick: (p: Etudiants) => etudiantsForm.value?.openForm(p), style: 'width: 32px; text-align: center;' },
  { field: 'Id', label: 'Id', formatter: null,  onClick: undefined, style: undefined },
  { field: 'NumEtud', label: 'Numéro Étudiant', formatter: null, onClick: undefined, style : undefined },
  { field: 'Nom', label: 'Nom', formatter: null, onClick: undefined, style : undefined },
  { field: 'Prenom', label: 'Prénom', formatter: null, onClick: undefined, style : undefined },
  { field: 'Email', label: 'Email', formatter: null, onClick: undefined, style : undefined },
  { field: 'Parcours', label: 'Parcours', formatter: formatterParcours, onClick: undefined, style : undefined },
  { field: 'DeleteEtudiants', label: 'Suppression', formatter: formatterSuppression, onClick: onDeleteEtudiant, style: 'width: 32px;text-align:center;' }, 
];

/**
 * Hook onMounted - Chargement initial des données
 * 
 * Séquence :
 * 1. Charge tous les parcours et les indexe dans une Map par ID
 * 2. Charge tous les étudiants
 * 3. Affiche un message de succès avec le nombre d'étudiants chargés
 * 4. Gère les erreurs avec message toast
 * 5. Désactive l'indicateur de chargement
 */
onMounted(async () => {
  isLoading.value = true;
  try {
    const parcoursList = await ParcoursDAO.getInstance().list();
    parcoursList.forEach(p => {
      if (p.Id) parcoursMap.value.set(p.Id, p);
    });
    const data = await EtudiantsDAO.getInstance().list();
    etudiants.value = data;
    toast.success(`✅ ${data.length} étudiant${data.length > 1 ? 's' : ''} chargé${data.length > 1 ? 's' : ''}`, {
      timeout: 2000
    });
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    toast.error('❌ Erreur lors du chargement des étudiants', {
      timeout: 4000
    });
  } finally {
    isLoading.value = false;
  }
}); 

</script>

<template> 
  <div class="container-fluid page-container">
    <!-- Titre, icône et description de la section -->
    <div class="page-header animate-slide-in-down">
      <div class="page-header-content">
        <div class="page-icon">
          <i class="bi bi-people-fill"></i>
        </div>
        <div>
          <h2 class="page-title">Étudiants</h2>
          <p class="page-subtitle">Gérez les étudiants et leurs informations</p>
        </div>
      </div>
    </div>

    <!-- Contient le header avec bouton d'ajout et le corps avec tableau/squelette/état vide -->
    <div class="card main-card animate-slide-in-up">
      <!-- Header : Titre avec compteur et bouton Ajouter -->
      <div class="card-header">
        <div class="card-title">
          <i class="bi bi-list-ul me-2 color-white"></i>
          <h4>Liste des Étudiants</h4>
          <span class="badge-count" v-if="!isLoading">{{ etudiants.length }}</span>
        </div>

        <CustomButton 
          :color="BootstrapButtonEnum.info" 
          @click="() => etudiantsForm?.openForm()"
          class="btn-add-animation"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Ajouter un étudiant 
        </CustomButton> 
      </div> 

      <!-- Corps de la carte : affichage conditionnel selon l'état -->
      <div class="card-body">
        <!-- État de chargement : squelette animé (5 lignes avec 8 colonnes) -->
        <div v-if="isLoading" class="skeleton-container">
          <div class="skeleton-row" v-for="i in 5" :key="i">
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 10%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 15%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 15%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 25%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 20%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
          </div>
        </div>

        <!-- État vide : affiché si aucun étudiant n'existe -->
        <div v-else-if="etudiants.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <i class="bi bi-person-x"></i>
          </div>
          <h4>Aucun étudiant disponible</h4>
          <p>Commencez par ajouter votre premier étudiant</p>
          <CustomButton 
            :color="BootstrapButtonEnum.info" 
            @click="() => etudiantsForm?.openForm()"
            class="mt-3"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Créer un étudiant
          </CustomButton>
        </div>

        <!-- Tableau principal : affiche les étudiants avec CustomTable -->
        <div v-else class="table-wrapper">
          <CustomTable 
            idAttribute="Id" 
            :columns="columns" 
            :data="etudiants"
            class="table-modern"
          />
        </div>

        <!-- Overlay de suppression : affiché pendant la suppression d'un étudiant -->
        <div v-if="isDeleting" class="deleting-overlay">
          <div class="loading-spinner"></div>
          <span>Suppression en cours...</span>
        </div>
      </div> 
    </div> 
  </div>
  
  <!-- Formulaire modal pour créer/éditer un étudiant (invisible jusqu'à ouverture) -->
  <EtudiantsForm 
    ref="etudiantsForm" 
    @create:etudiant="onEtudiantCreated" 
    @update:etudiant="onEtudiantUpdated" 
  /> 
</template> 

<style scoped>
.card-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  position: relative;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
  }
}
</style>