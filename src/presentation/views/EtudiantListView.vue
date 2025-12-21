<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2'; 
import { useToast } from 'vue-toastification';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import EtudiantsForm from '@/presentation/components/forms/EtudiantsForm.vue';
import CustomTable from '../components/tables/CustomTable.vue'; 
import { Etudiants } from '@/domain/entities/Etudiants'; 
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { Parcours } from '@/domain/entities/Parcours';

const toast = useToast();
const etudiantsForm = ref<typeof EtudiantsForm | null>(null); 
const etudiants = ref<Etudiants[]>([]);
const parcoursMap = ref<Map<number, Parcours>>(new Map());
const isLoading = ref<boolean>(true);
const isDeleting = ref<boolean>(false);

const onEtudiantCreated = (newEtudiant: Etudiants) => { 
  etudiants.value.unshift(newEtudiant);
  toast.success('✨ Étudiant créé avec succès !', {
    timeout: 3000
  });
}; 

const onEtudiantUpdated = (updatedEtudiant: Etudiants) => { 
  const index = etudiants.value.findIndex(p => p.Id === updatedEtudiant.Id); 
  if (index !== -1) { 
    etudiants.value[index] = updatedEtudiant;
    toast.info('📝 Étudiant mis à jour !', {
      timeout: 3000
    });
  }
};

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

const formatterEdition = (etudiant: Etudiants) => { 
  return '<i class="bi bi-pen-fill text-primary"></i>'; 
}; 

const formatterSuppression = (etudiant: Etudiants) => { 
  return '<i class="bi bi-trash-fill text-danger"></i>'; 
};

const formatterParcours = (etudiant: Etudiants) => {
  // Récupère les données des parcours associés à l'étudiant
  const parcoursId = etudiant.ParcoursSuivi;
  
  // Si aucun parcours n'est associé, retourne un tableau vide
  if (!parcoursId) return [];

  // Vérifie si le parcours est stocké sous forme d'ID (number)
  if (typeof parcoursId === 'number') {
      const parcours = parcoursMap.value.get(parcoursId);
      return parcours ? parcours.NomParcours : `Parcours ${parcoursId}`;
  } else {
      // Le parcours est déjà un objet complet, retourne directement le nom
      return parcoursId.NomParcours;
  }
};

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
    <!-- En-tête de page -->
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

    <!-- Carte principale avec animation -->
    <div class="card main-card animate-slide-in-up">
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

      <div class="card-body">
        <!-- État de chargement avec skeleton -->
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

        <!-- Message si aucun étudiant -->
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

        <!-- Tableau des étudiants avec wrapper pour scroll -->
        <div v-else class="table-wrapper">
          <CustomTable 
            idAttribute="Id" 
            :columns="columns" 
            :data="etudiants"
            class="table-modern"
          />
        </div>

        <!-- Indicateur de suppression en cours -->
        <div v-if="isDeleting" class="deleting-overlay">
          <div class="loading-spinner"></div>
          <span>Suppression en cours...</span>
        </div>
      </div> 
    </div> 
  </div>
  
  <EtudiantsForm 
    ref="etudiantsForm" 
    @create:etudiant="onEtudiantCreated" 
    @update:etudiant="onEtudiantUpdated" 
  /> 
</template> 

<style scoped>
/* Styles spécifiques à EtudiantListView */
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