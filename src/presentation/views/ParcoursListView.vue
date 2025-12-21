<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2'; 
import { useToast } from 'vue-toastification';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';
import CustomTable from '../components/tables/CustomTable.vue'; 
import { Parcours } from '@/domain/entities/Parcours'; 
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const toast = useToast();
const parcoursForm = ref<typeof ParcoursForm | null>(null); 
const parcours = ref<Parcours[]>([]); 
const isLoading = ref<boolean>(true);
const isDeleting = ref<boolean>(false);

const onParcoursCreated = (newParcours: Parcours) => { 
  parcours.value.unshift(newParcours);
  toast.success('✨ Parcours créé avec succès !', {
    timeout: 3000
  });
}; 

const onParcoursUpdated = (updatedParcours: Parcours) => { 
  const index = parcours.value.findIndex(p => p.Id === updatedParcours.Id); 
  if (index !== -1) { 
    parcours.value[index] = updatedParcours;
    toast.info('📝 Parcours mis à jour !', {
      timeout: 3000
    });
  }
};

const onDeleteParcours = (p: Parcours) => { 
  Swal.fire({ 
    title: 'Êtes-vous sûr ?', 
    text: `Voulez-vous vraiment supprimer le parcours "${p.NomParcours}" ?`,
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
      ParcoursDAO.getInstance().delete(p.Id!).then(() => { 
        parcours.value = parcours.value.filter((item) => item.Id !== p.Id);
        toast.success('🗑️ Parcours supprimé avec succès !', {
          timeout: 3000
        });
      }).catch((error) => {
        console.error('Erreur lors de la suppression:', error);
        toast.error('❌ Erreur lors de la suppression du parcours', {
          timeout: 4000
        });
      }).finally(() => {
        isDeleting.value = false;
      }); 
    } 
  }) 
} 

const formatterEdition = (parcours: Parcours) => { 
  return '<i class="bi bi-pen-fill text-primary"></i>'; 
}; 

const formatterSuppression = (parcours: Parcours) => { 
  return '<i class="bi bi-trash-fill text-danger"></i>'; 
};

const columns = [ 
  { field: 'EditionParcours', label: 'Edition', formatter: formatterEdition, onClick: (p: Parcours) => parcoursForm.value?.openForm(p), style: 'width: 32px; text-align: center;' },
  { field: 'Id', label: 'Id', formatter: null,  onClick: undefined, style: undefined },
  { field: 'NomParcours', label: 'Intitulé', formatter: null, onClick: undefined, style : undefined },
  { field: 'AnneeFormation', label: 'Année', formatter: null, onClick: undefined, style: undefined },
  { field: 'DeleteParcours', label: 'Suppression', formatter: formatterSuppression, onClick: onDeleteParcours, style: 'width: 32px;text-align:center;' }, 
]; 

onMounted(() => {
  isLoading.value = true;
  ParcoursDAO.getInstance().list().then((data) => { 
    parcours.value = data;
    toast.success(`✅ ${data.length} parcours chargés`, {
      timeout: 2000
    });
  }).catch((error) => {
    console.error('Erreur lors du chargement:', error);
    toast.error('❌ Erreur lors du chargement des parcours', {
      timeout: 4000
    });
  }).finally(() => {
    isLoading.value = false;
  }); 
}); 

</script>

<template> 
  <div class="container-fluid page-container">
    <!-- En-tête de page avec breadcrumb -->
    <div class="page-header animate-slide-in-down">
      <div class="page-header-content">
        <div class="page-icon">
          <i class="bi bi-diagram-3-fill"></i>
        </div>
        <div>
          <h2 class="page-title">Parcours de Formation</h2>
          <p class="page-subtitle">Gérez les différents parcours et années de formation</p>
        </div>
      </div>
    </div>

    <!-- Carte principale avec animation -->
    <div class="card main-card animate-slide-in-up">
      <div class="card-header">
        <div class="card-title">
          <i class="bi bi-list-ul me-2 color-white"></i>
          <h4>Liste des parcours</h4>
          <span class="badge-count" v-if="!isLoading">{{ parcours.length }}</span>
        </div>

        <CustomButton 
          :color="BootstrapButtonEnum.info" 
          @click="() => parcoursForm?.openForm()"
          class="btn-add-animation"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Ajouter un parcours 
        </CustomButton> 
      </div> 

      <div class="card-body">
        <!-- État de chargement avec skeleton -->
        <div v-if="isLoading" class="skeleton-container">
          <div class="skeleton-row" v-for="i in 5" :key="i">
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 60%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 20%; height: 16px;"></div>
            <div class="skeleton-cell" style="width: 5%; height: 16px;"></div>
          </div>
        </div>

        <!-- Message si aucun parcours -->
        <div v-else-if="parcours.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <i class="bi bi-inbox"></i>
          </div>
          <h4>Aucun parcours disponible</h4>
          <p>Commencez par créer votre premier parcours de formation</p>
          <CustomButton 
            :color="BootstrapButtonEnum.info" 
            @click="() => parcoursForm?.openForm()"
            class="mt-3"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Créer un parcours
          </CustomButton>
        </div>

        <!-- Tableau des parcours avec wrapper pour scroll -->
        <div v-else class="table-wrapper">
          <CustomTable 
            idAttribute="Id" 
            :columns="columns" 
            :data="parcours"
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
  
  <ParcoursForm 
    ref="parcoursForm" 
    @create:parcours="onParcoursCreated" 
    @update:parcours="onParcoursUpdated" 
  /> 
</template> 

<style scoped>
/* Styles spécifiques à ParcoursListView */
.card-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  position: relative;
  z-index: 1;
}

.card-title i {
  font-size: var(--font-size-xl);
}

.btn-add-animation {
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.deleting-overlay span {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.table-modern {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
  }
  
  .card-title {
    flex-wrap: wrap;
  }
}

/* Personnalisation SweetAlert2 */
:deep(.swal2-popup) {
  border-radius: var(--border-radius-xl) !important;
  padding: var(--spacing-8) !important;
}

:deep(.swal2-title) {
  font-family: var(--font-family-heading) !important;
  font-size: var(--font-size-2xl) !important;
}

:deep(.swal2-html-container) {
  font-family: var(--font-family-base) !important;
  font-size: var(--font-size-base) !important;
}
</style>