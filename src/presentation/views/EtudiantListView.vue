<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2'; 
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import EtudiantsForm from '@/presentation/components/forms/EtudiantsForm.vue';
import CustomTable from '../components/tables/CustomTable.vue'; 
import { Etudiants } from '@/domain/entities/Etudiants'; 
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { Parcours } from '@/domain/entities/Parcours';

const etudiantsForm = ref<typeof EtudiantsForm | null>(null); 
const etudiants = ref<Etudiants[]>([]);
const parcoursMap = ref<Map<number, Parcours>>(new Map());

const onEtudiantCreated = (newEtudiant: Etudiants) => { 
  etudiants.value.unshift(newEtudiant); 
}; 

const onEtudiantUpdated = (updatedEtudiant: Etudiants) => { 
  const index = etudiants.value.findIndex(p => p.Id === updatedEtudiant.Id); 
  if (index !== -1) { 
    etudiants.value[index] = updatedEtudiant; 
  }
};

const onDeleteEtudiant = (p: Etudiants) => { 
  Swal.fire({ 
    title: 'Êtes-vous sûr de vouloir supprimer cet étudiant ?', 
    showCancelButton: true, 
    confirmButtonText: 'Supprimer', 
    cancelButtonText: 'Annuler', 
  }).then((result) => { 
    if (result.isConfirmed) { 
      EtudiantsDAO.getInstance().delete(p.Id!).then(() => { 
        etudiants.value = etudiants.value.filter((item) => item.Id !== p.Id); 
      }).catch(() => { 
        alert('Une erreur est survenue lors de la suppression de l\'étudiant'); 
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
  const parcoursList = await ParcoursDAO.getInstance().list();
    parcoursList.forEach(p => {
        if (p.Id) parcoursMap.value.set(p.Id, p);
  });
  EtudiantsDAO.getInstance().list().then((data) => { 
    etudiants.value = data; 
  }); 
}); 

</script>

<template> 
    <div class="container-fluid"> 
      <div class="card mt-5"> 
        <div class="card-header"> 
          <div class="card-title"> 
            <h4>Liste des Étudiants</h4> 
          </div> 
            <CustomButton :color="BootstrapButtonEnum.info" @click="() => etudiantsForm?.openForm()"> 
                Ajouter un étudiant 
            </CustomButton> 
        </div> 

        <div class="card-body"> 
          <CustomTable idAttribute="Id" :columns="columns" :data="etudiants" />
        </div> 
      </div> 
    </div> 
    <EtudiantsForm ref="etudiantsForm" @create:etudiant="onEtudiantCreated" @update:etudiant="onEtudiantUpdated" /> 
</template> 

<style scoped>

</style>