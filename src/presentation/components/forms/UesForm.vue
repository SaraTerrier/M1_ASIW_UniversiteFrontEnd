<script setup lang="ts">
import { ref, onBeforeMount, defineExpose, defineProps, toRaw, watch } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Ues } from '@/domain/entities/Ues';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
//import { ParcoursDAO } from '@/domain/daos/ParcoursDAO'; 
import { UesDAOMocks as UesDAO } from '@/domain/daos/mocks/UesDAOMocks';

const currentUes = ref<Ues>(new Ues(null, null, null));
const isOpen = ref(false);

const formErrors = ref<{
  NumeroUe: string | null;
  Intitule: string | null;
  EnseigneeDans?: string | null;
}>
({
    NumeroUe : null,
    Intitule : null,
    EnseigneeDans : null,
});

const openForm = (ues: Ues | null = null) => {
  isOpen.value = true;

  if (ues) {
    currentUes.value = structuredClone(toRaw(ues));
  }
};

const closeForm = () => {
  isOpen.value = false;
  currentUes.value = new Ues(null, null, null, null);
};

const props = defineProps({
  ues: {
    type: Object as () => Ues | null,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['create:ues', 'update:ues']); 

onBeforeMount(() => {
  if (props.ues) {
    currentUes.value = props.ues;
  }
});

const saveUes = () => {
  if (formErrors.value.NumeroUe || formErrors.value.Intitule || formErrors.value.EnseigneeDans) {
    return;
  }
  if (currentUes.value.ID) {
    // quand tu retireras le mock, ne pas oublier d'ajouter currentUes.value.ID
    UesDAO.getInstance().update(currentUes.value).then(() => {
      alert('Ues mis à jour avec succès');
      // Emission de l'événement de mise à jour avec une copie du ues mis à jour
      emit('update:ues', structuredClone(toRaw(currentUes.value)));
      closeForm();
    }).catch((ex) => {
      alert(ex.message);
    });
  } else {
    UesDAO.getInstance().create(currentUes.value).then((newUes) => {
      alert('Ue créé avec succès');
      emit('create:ues', newUes); 
      closeForm();
    }).catch((ex) => {
      alert(ex.message);
    });
  }
};

watch(() => currentUes.value.Intitule, () => { 

  if (!currentUes.value.Intitule || currentUes.value.Intitule.trim() === '' || currentUes.value.Intitule.length < 3) { 
    formErrors.value.Intitule = 'Le nom de l\'UE doit faire au moins 3 caractères'; 
  } else { 
    formErrors.value.Intitule = null; 
  } 
}); 

watch(() => currentUes.value.NumeroUe, () => { 
  if (!currentUes.value.NumeroUe || currentUes.value.NumeroUe.trim() === '') { 
    formErrors.value.NumeroUe = 'Le numéro de l\'UE est obligatoire'; 
  } else if (currentUes.value.NumeroUe.length < 2) { 
    formErrors.value.NumeroUe = 'Le numéro de l\'UE doit faire au moins 2 caractères'; 
  } else { 
    formErrors.value.NumeroUe = null; 
  } 
}); 

watch(() => currentUes.value.EnseigneeDans, () => { 
  if (!currentUes.value.EnseigneeDans || currentUes.value.EnseigneeDans.length === 0) { 
    formErrors.value.EnseigneeDans = null;
  } else { 
    formErrors.value.EnseigneeDans = null; 
  } 
}); 


defineExpose({
  openForm,
  closeForm,
});
</script>

<template>
  <div v-if="isOpen" class="custom-modal">
    <div class="card new-parcours">
      <div class="card-header" style="background: #273656">
        <template v-if="ues && ues.ID"> Modification du l'UE </template>
        <template v-else> Nouvelle UE </template>
      </div>
      <div class="card-body">
        <div class="card-text mt-1 mb-1">
          <form>
            <CustomInput v-model="currentUes.NumeroUe" id="numeroUe" libelle="Numéro UE" type="text" placeholder="Numéro de l'UE" :error="formErrors.NumeroUe" />
            <CustomInput v-model="currentUes.Intitule" id="intitule" libelle="Intitulé" type="text" placeholder="Intitulé de l'UE" :error="formErrors.Intitule" />
            <CustomInput v-model="currentUes.EnseigneeDans" id="enseigneeDans" libelle="Enseignee Dans" type="text" placeholder="Enseignee Dans" :error="formErrors.EnseigneeDans" />
          </form>
        </div>
        <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm">
          Annuler
        </CustomButton>
        <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveUes">
          Enregistrer
        </CustomButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-modal {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(87, 86, 86, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.custom-modal .card {
  width: 250px;
}

.card-header {
  background: #273656;
  color: white;
  text-align: left;
}

.card-text {
  text-align: left;
}
</style>