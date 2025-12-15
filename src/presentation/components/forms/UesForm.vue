<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Ues } from '@/domain/entities/Ues';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { UesDAO } from '@/domain/daos/UesDAO';
import { Parcours } from '@/domain/entities/Parcours';

const currentUes = ref<Ues>(new Ues(null, null, null, null));
const parcoursOptions = ref<Parcours[]>([]);
const isOpen = ref(false);

const formErrors = ref<{
  NumeroUe: string | null;
  Intitule: string | null;
  Parcours?: string | null;
}>
  ({
    NumeroUe: null,
    Intitule: null,
    Parcours: null,
  });

const parseParcours = (p: any): Parcours => {
    if (typeof p === 'number') {
        return parcoursOptions.value.find(opt => opt.Id === p) || new Parcours(p, `Parcours ${p}`, null);
    }
    return new Parcours(p.ID, p.NomParcours, p.AnneeFormation);
};

const openForm = (ue: Ues | null = null) => { 
    isOpen.value = true; 
    if (ue) { 
        currentUes.value = new Ues(
            ue.Id,
            ue.NumeroUe,
            ue.Intitule,
            (ue.Parcours || []).map(parseParcours)
        );
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
  ParcoursDAO.getInstance().list().then((parcours) => {
    parcoursOptions.value = parcours
  });
});


const saveUes = () => {
  if (formErrors.value.NumeroUe || formErrors.value.Intitule || formErrors.value.Parcours) {
    return;
  }
  if (currentUes.value.Id) {
    UesDAO.getInstance().update(currentUes.value.Id, currentUes.value).then(() => {
      alert('Ues mis à jour avec succès');
      // Emission de l'événement de mise à jour avec une copie du ues mis à jour
      emit('update:ues', JSON.parse(JSON.stringify(toRaw(currentUes.value))));
      closeForm();
    }).catch((ex) => {
      console.error('Erreur lors de la mise à jour:', ex);
      alert(ex.message);
    });
  } else {
    console.log('UE avant création:', currentUes.value);
    UesDAO.getInstance().create(currentUes.value).then((newUes) => {
      alert('Ue créé avec succès');
      emit('create:ues', newUes);
      closeForm();
    }).catch((ex) => {
      console.error('Erreur lors de la création:', ex);
      alert(ex.message);
    });
  }
};

watch(() => props.ues, (newUE) => { 
    if (newUE) { 
        currentUes.value = newUE; 
        openForm(); 
    } 
}); 

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

defineExpose({
  openForm,
  closeForm,
});
</script>

<template>

  <CustomModal :isOpen="isOpen">

    <template v-slot:title>

      <template v-if="ues && ues.Id"> Modification de l'UE</template>

      <template v-else> Nouvelle UE</template>

    </template>

    <template v-slot:body>

      <div class="text-start mt-1 mb-1">

        <form>

          <CustomInput v-model="currentUes.NumeroUe" class="mt-2" id="numeroue" libelle="Numéro" type="text"
            placeholder="Numéro d'UE" :error="formErrors.NumeroUe" />

          <CustomInput v-model="currentUes.Intitule" id="intitule" libelle="Intitulé" type="text"
            placeholder="Intitulé de l'UE" :error="formErrors.Intitule" />

          <div class="form-group">

            <label for="intitule">Parcours :</label>

            <v-select multiple label="NomParcours" v-model="currentUes.Parcours" :options="parcoursOptions"></v-select>
            <div v-if="formErrors.Parcours" class="invalid-feedback">
              {{ formErrors.Parcours }}
            </div>

          </div>

        </form>

      </div>

      <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm">
        Annuler
      </CustomButton>

      <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveUes">
        Enregistrer
      </CustomButton>

    </template>

  </CustomModal>

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