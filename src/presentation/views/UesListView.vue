<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import UesForm from '@/presentation/components/forms/UesForm.vue';
import CustomTable from '../components/tables/CustomTable.vue'; 
import { Ues } from '@/domain/entities/Ues'; 
//import { UeDAO } from '@/domain/daos/UeDAO';
import { UesDAOMocks as UeDAO } from '@/domain/daos/mocks/UesDAOMocks'; 

const ueForm = ref<typeof UesForm | null>(null); 
const ues = ref<Ues[]>([]); 

const onUesCreated = (newUes: Ues) => { 
  ues.value.unshift(newUes); 
}; 

const onUesUpdated = (updatedUes: Ues) => { 
  const index = ues.value.findIndex(p => p.ID === updatedUes.ID); 
  if (index !== -1) { 
    ues.value[index] = updatedUes; 
  }
};

const onDeleteUes = (p: Ues) => { 

  Swal.fire({ 

    title: 'Êtes-vous sûr de vouloir supprimer cette Ue ?', 

    showCancelButton: true, 

    confirmButtonText: 'Supprimer', 

    cancelButtonText: 'Annuler', 

  }).then((result) => { 

    if (result.isConfirmed) { 

      UeDAO.getInstance().delete(p.ID!).then(() => { 

        ues.value = ues.value.filter((ues) => ues.ID !== p.ID); 

      }).catch(() => { 

        alert('Une erreur est survenue lors de la suppression de l\'Ue'); 
      }); 

    } 

  }) 

} 

const formatterEdition = (ues: Ues) => { 
  return '<i class="bi bi-pen-fill text-primary"></i>'; 
}; 

const formatterSuppression = (ues: Ues) => { 
  return '<i class="bi bi-trash-fill text-danger"></i>'; 
};

const columns = [ 
  { field: 'EditionUes', label: 'Edition', formatter: formatterEdition, onClick: (p: Ues) => ueForm.value?.openForm(p), style: 'width: 32px; text-align: center;' },
  { field: 'ID', label: 'ID', formatter: null,  onClick: undefined, style: undefined },
  { field: 'Intitule', label: 'Intitulé', formatter: null, onClick: undefined, style : undefined },
  { field: 'NumeroUe', label: 'Numéro Ue', formatter: null, onClick: undefined, style : undefined },
  { field: 'EnseigneeDans', label: 'Enseignée Dans', formatter: null, onClick: undefined, style : undefined },
  { field: 'DeleteUes', label: 'Suppression', formatter: formatterSuppression, onClick: onDeleteUes, style: 'width: 32px;text-align:center;' }, 
];

onMounted(() => { 
  UeDAO.getInstance().list().then((data) => { 
    ues.value = data; 
  }); 
}); 

</script>

<template> 

    <div class="container-fluid"> 
      <div class="card mt-5"> 
        <div class="card-header"> 
          <div class="card-title"> 
            <h4>Liste des Ues</h4> 
          </div> 

            <CustomButton :color="BootstrapButtonEnum.info" @click="() => ueForm?.openForm()"> 
                Ajouter une Ue 
            </CustomButton> 
        </div> 

        <div class="card-body"> 
          <CustomTable idAttribute="ID" :columns="columns" :data="ues" />
        </div> 

      </div> 

    </div> 
    <UesForm ref="ueForm" @create:ues="onUesCreated" @update:ues="onUesUpdated" /> 
</template> 

<style scoped>

</style>