<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';
import CustomTable from '../components/tables/CustomTable.vue'; 
import { Parcours } from '@/domain/entities/Parcours'; 
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const parcoursForm = ref<typeof ParcoursForm | null>(null); 
const parcours = ref<Parcours[]>([]); 

const onParcoursCreated = (newParcours: Parcours) => { 
  parcours.value.unshift(newParcours); 
}; 

const onParcoursUpdated = (updatedParcours: Parcours) => { 
  const index = parcours.value.findIndex(p => p.Id === updatedParcours.Id); 
  if (index !== -1) { 
    parcours.value[index] = updatedParcours; 
  }
};

const onDeleteParcours = (p: Parcours) => { 

  Swal.fire({ 

    title: 'Êtes-vous sûr de vouloir supprimer ce parcours ?', 

    showCancelButton: true, 

    confirmButtonText: 'Supprimer', 

    cancelButtonText: 'Annuler', 

  }).then((result) => { 

    if (result.isConfirmed) { 

      ParcoursDAO.getInstance().delete(p.Id!).then(() => { 

        parcours.value = parcours.value.filter((item) => item.Id !== p.Id); 

      }).catch(() => { 

        alert('Une erreur est survenue lors de la suppression du parcours'); 

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
  ParcoursDAO.getInstance().list().then((data) => { 
    parcours.value = data; 
  }); 
}); 

</script>

<template> 

    <div class="container-fluid"> 
      <div class="card mt-5"> 
        <div class="card-header"> 
          <div class="card-title"> 
            <h4>Liste des parcours</h4> 
          </div> 

            <CustomButton :color="BootstrapButtonEnum.info" @click="() => parcoursForm?.openForm()"> 
                Ajouter un parcours 
            </CustomButton> 
        </div> 

        <div class="card-body"> 
          <CustomTable idAttribute="Id" :columns="columns" :data="parcours" />
        </div> 

      </div> 

    </div> 
    <ParcoursForm ref="parcoursForm" @create:parcours="onParcoursCreated" @update:parcours="onParcoursUpdated" /> 
</template> 

<style scoped>

</style>