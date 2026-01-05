<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useToast } from 'vue-toastification';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Ues } from '@/domain/entities/Ues';
import { Parcours } from '@/domain/entities/Parcours';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import UesForm from '@/presentation/components/forms/UesForm.vue';
import CustomTable from '../components/tables/CustomTable.vue';
import { UesDAO } from '@/domain/daos/UesDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const router = useRouter();
const toast = useToast();

// Référence vers le composant UesForm pour appeler openForm()
const ueForm = ref<typeof UesForm | null>(null);
// Liste de toutes les UEs affichées dans le tableau
const ues = ref<Ues[]>([]);
// Map des parcours indexés par ID pour résolution rapide des noms
const parcoursMap = ref<Map<number, Parcours>>(new Map());
// Indicateur de chargement initial
const isLoading = ref<boolean>(true);
// Indicateur de suppression en cours
const isDeleting = ref<boolean>(false);

/**
 * Callback appelé après la création réussie d'une UE
 * Ajoute la nouvelle UE au début de la liste pour qu'elle soit visible immédiatement
 * 
 */
const onUesCreated = (newUes: Ues) => { 
  ues.value.unshift(newUes);
  toast.success('✨ UE créée avec succès !', {
    timeout: 3000
  });
}; 

/**
 * Callback appelé après la mise à jour réussie d'une UE
 * Recherche l'UE dans la liste et la remplace par la version mise à jour
 * 
 */
const onUesUpdated = (updatedUes: Ues) => { 
  const index = ues.value.findIndex(p => p.Id === updatedUes.Id); 
  if (index !== -1) { 
    ues.value[index] = updatedUes;
    toast.info('📝 UE mise à jour !', {
      timeout: 3000
    });
  }
};

/**
 * Gère la suppression d'une UE avec confirmation
 * 
 * Processus :
 * 1. Affiche une modale de confirmation (SweetAlert2) avec le nom de l'UE
 * 2. Si confirmé, active l'indicateur de suppression
 * 3. Appelle l'API pour supprimer l'UE
 * 4. Retire l'UE de la liste locale
 * 5. Affiche un message de succès ou d'erreur
 * 
 */
const onDeleteUes = (p: Ues) => { 
  Swal.fire({ 
    title: 'Êtes-vous sûr ?', 
    text: `Voulez-vous vraiment supprimer l'UE "${p.Intitule}" ?`,
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
      UesDAO.getInstance().delete(p.Id!).then(() => { 
        ues.value = ues.value.filter((item) => item.Id !== p.Id);
        toast.success('🗑️ UE supprimée avec succès !', {
          timeout: 3000
        });
      }).catch((error) => {
        console.error('Erreur lors de la suppression:', error);
        toast.error('❌ Erreur lors de la suppression de l’UE', {
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
const formatterEdition = (ues: Ues) => { 
  return '<i class="bi bi-pen-fill text-primary"></i>'; 
}; 

/**
 * Formateur pour la colonne Suppression
 * Retourne une icône stylisée pour le bouton de suppression
 * 
 */
const formatterSuppression = (ues: Ues) => { 
  return '<i class="bi bi-trash-fill text-danger"></i>'; 
};

/**
 * Formateur pour la colonne Parcours
 * Affiche les noms des parcours associés à l'UE, séparés par des virgules
 * 
 * Gère deux formats de données :
 * - Tableau d'IDs (number) : résolution via parcoursMap
 * - Tableau d'objets Parcours : accès direct aux noms
 * 
 */
const formatterParcours = (ues: Ues) => {
  // Récupère les données des parcours associés à l'UE, retourne un tableau vide si inexistant
  const parcoursData = ues.Parcours as any[] || [];
  // Si aucun parcours n'est associé, retourne un tableau vide
  if (parcoursData.length === 0) return [];

  // Tableau qui contiendra les noms des parcours
  let noms: string[] = [];

  // Vérifie si les parcours sont stockés sous forme d'IDs (number)
  if (typeof parcoursData[0] === 'number') {
      // Récupère le nom de chaque parcours via son ID depuis la map, sinon affiche "ID {id}"
      noms = parcoursData.map((id: number) => parcoursMap.value.get(id)?.NomParcours || `ID ${id}`);
  } else {
      // Les parcours sont déjà des objets complets, récupère directement le nom
      noms = parcoursData.map((p: any) => p.NomParcours);
  }

  // Retourne les noms des parcours séparés par une virgule et un espace
  return noms.join(', ');
};

/**
 * Navigation vers la page de détail d'une UE pour l'édition complète
 * 
 */
const onEditUes = (ues: Ues) => {
  router.push(`/ues/${ues.Id}`);
};

/**
 * Définition des colonnes pour CustomTable
 * Chaque colonne spécifie :
 * - field : nom du champ dans l'entité Ues
 * - label : libellé affiché dans l'en-tête
 * - formatter : fonction de formatage personnalisé (optionnel)
 * - onClick : action au clic (optionnel)
 * - style : styles CSS personnalisés (optionnel)
 */
const columns = [ 
  { field: 'EditionUes', label: 'Edition', formatter: formatterEdition, onClick: onEditUes, style: 'width: 32px; text-align: center;' },
  { field: 'Id', label: 'Id', formatter: null,  onClick: undefined, style: undefined },
  { field: 'Intitule', label: 'Intitulé', formatter: null, onClick: undefined, style : undefined },
  { field: 'NumeroUe', label: 'Numéro Ue', formatter: null, onClick: undefined, style : undefined },
  { field: 'Parcours', label: 'Parcours', formatter: formatterParcours, onClick: undefined, style : undefined },
  { field: 'DeleteUes', label: 'Suppression', formatter: formatterSuppression, onClick: onDeleteUes, style: 'width: 32px;text-align:center;' }, 
];

/**
 * Hook onMounted - Chargement initial des données
 * 
 * Séquence :
 * 1. Charge tous les parcours et les indexe dans une Map par ID
 * 2. Charge toutes les UEs
 * 3. Affiche un message de succès avec le nombre d'UEs chargées
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
    const data = await UesDAO.getInstance().list();
    ues.value = data;
    toast.success(`✅ ${data.length} UE${data.length > 1 ? 's' : ''} chargée${data.length > 1 ? 's' : ''}`, {
      timeout: 2000
    });
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    toast.error('❌ Erreur lors du chargement des UEs', {
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
          <i class="bi bi-book-fill"></i>
        </div>
        <div>
          <h2 class="page-title">Unités d'Enseignement</h2>
          <p class="page-subtitle">Gérez les UEs et leurs parcours associés</p>
        </div>
      </div>
    </div>

    <!-- Contient le header avec bouton d'ajout et le corps avec tableau/squelette/état vide -->
    <div class="card main-card animate-slide-in-up">
      <!-- Header : Titre avec compteur et bouton Ajouter -->
      <div class="card-header">
        <div class="card-title">
          <i class="bi bi-list-ul me-2 color-white"></i>
          <h4>Liste des UEs</h4>
          <span class="badge-count" v-if="!isLoading">{{ ues.length }}</span>
        </div>

        <CustomButton 
          :color="BootstrapButtonEnum.info" 
          @click="() => ueForm?.openForm()"
          class="btn-add-animation"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Ajouter une UE 
        </CustomButton> 
      </div> 

      <!-- Corps de la carte : affichage conditionnel selon l'état -->
      <div class="card-body">
        <!-- État de chargement : squelette animé (5 lignes) -->
        <div v-if="isLoading" class="skeleton-container">
          <div class="skeleton-row" v-for="i in 5" :key="i">
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 35%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 15%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 35%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
          </div>
        </div>

        <!-- État vide : affiché si aucune UE n'existe -->
        <div v-else-if="ues.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <i class="bi bi-journal-x"></i>
          </div>
          <h4>Aucune UE disponible</h4>
          <p>Commencez par créer votre première unité d'enseignement</p>
          <CustomButton 
            :color="BootstrapButtonEnum.info" 
            @click="() => ueForm?.openForm()"
            class="mt-3"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Créer une UE
          </CustomButton>
        </div>

        <!-- Tableau principal : affiche les UEs avec CustomTable -->
        <div v-else class="table-wrapper">
          <CustomTable 
            idAttribute="Id" 
            :columns="columns" 
            :data="ues"
            class="table-modern"
          />
        </div>

        <!-- Overlay de suppression : affiché pendant la suppression d'une UE -->
        <div v-if="isDeleting" class="deleting-overlay">
          <div class="loading-spinner"></div>
          <span>Suppression en cours...</span>
        </div>
      </div> 
    </div> 
  </div>
  
  <!-- Formulaire modal pour créer/éditer une UE (invisible jusqu'à ouverture) -->
  <UesForm 
    ref="ueForm" 
    @create:ues="onUesCreated" 
    @update:ues="onUesUpdated" 
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