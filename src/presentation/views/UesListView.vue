<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import UesForm from '@/presentation/components/forms/UesForm.vue';
import CustomTable from '../components/tables/CustomTable.vue'; 
import { Ues } from '@/domain/entities/Ues'; 
import { UesDAO } from '@/domain/daos/UesDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { Parcours } from '@/domain/entities/Parcours';

const router = useRouter();
const ueForm = ref<typeof UesForm | null>(null); 
const ues = ref<Ues[]>([]);
const parcoursMap = ref<Map<number, Parcours>>(new Map());

const onUesCreated = (newUes: Ues) => { 
  ues.value.unshift(newUes); 
}; 

const onUesUpdated = (updatedUes: Ues) => { 
  const index = ues.value.findIndex(p => p.Id === updatedUes.Id); 
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

      UesDAO.getInstance().delete(p.Id!).then(() => { 

        ues.value = ues.value.filter((item) => item.Id !== p.Id); 

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

const onEditUes = (ues: Ues) => {
  router.push(`/ues/${ues.Id}`);
};

const columns = [ 
  { field: 'EditionUes', label: 'Edition', formatter: formatterEdition, onClick: onEditUes, style: 'width: 32px; text-align: center;' },
  { field: 'Id', label: 'Id', formatter: null,  onClick: undefined, style: undefined },
  { field: 'Intitule', label: 'Intitulé', formatter: null, onClick: undefined, style : undefined },
  { field: 'NumeroUe', label: 'Numéro Ue', formatter: null, onClick: undefined, style : undefined },
  { field: 'Parcours', label: 'Parcours', formatter: formatterParcours, onClick: undefined, style : undefined },
  { field: 'DeleteUes', label: 'Suppression', formatter: formatterSuppression, onClick: onDeleteUes, style: 'width: 32px;text-align:center;' }, 
];

onMounted(async () => {
  const parcoursList = await ParcoursDAO.getInstance().list();
    parcoursList.forEach(p => {
        if (p.Id) parcoursMap.value.set(p.Id, p);
  });
  UesDAO.getInstance().list().then((data) => { 
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
          <CustomTable idAttribute="Id" :columns="columns" :data="ues" />
        </div> 

      </div> 

    </div> 
    <UesForm ref="ueForm" @create:ues="onUesCreated" @update:ues="onUesUpdated" /> 
</template> 

<style scoped>

</style>