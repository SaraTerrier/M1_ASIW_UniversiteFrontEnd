<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const toast = useToast();

const currentParcours = ref<Parcours>(new Parcours(null, null, null));
const isOpen = ref(false);

const formErrors = ref<{
  NomParcours: string | null;
  AnneeFormation: string | null;
}>
  ({
    NomParcours: null,
    AnneeFormation: null,
  });

const openForm = (parcours: Parcours | null = null) => {
  isOpen.value = true;

  if (parcours) {
    currentParcours.value = structuredClone(toRaw(parcours));
  }
};

const closeForm = () => {
  isOpen.value = false;
  currentParcours.value = new Parcours(null, null, null);
};

const props = defineProps({
  parcours: {
    type: Object as () => Parcours | null,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['create:parcours', 'update:parcours']);

onBeforeMount(() => {
  if (props.parcours) {
    currentParcours.value = props.parcours;
  }
});

const isSaving = ref(false);

const saveParcours = () => {
  if (formErrors.value.NomParcours || formErrors.value.AnneeFormation) {
    toast.warning('⚠️ Veuillez corriger les erreurs du formulaire', {
      timeout: 3000
    });
    return;
  }
  
  isSaving.value = true;
  
  if (currentParcours.value.Id) {
    ParcoursDAO.getInstance().update(currentParcours.value.Id, currentParcours.value).then(() => {
      emit('update:parcours', structuredClone(toRaw(currentParcours.value)));
      closeForm();
    }).catch((ex) => {
      toast.error(`❌ Erreur: ${ex.message}`, {
        timeout: 4000
      });
    }).finally(() => {
      isSaving.value = false;
    });
  } else {
    ParcoursDAO.getInstance().create(currentParcours.value).then((newParcours) => {
      emit('create:parcours', newParcours);
      closeForm();
    }).catch((ex) => {
      toast.error(`❌ Erreur: ${ex.message}`, {
        timeout: 4000
      });
    }).finally(() => {
      isSaving.value = false;
    });
  }
};

watch(() => currentParcours.value.NomParcours, () => {

  if (!currentParcours.value.NomParcours || currentParcours.value.NomParcours.trim() === '' || currentParcours.value.NomParcours.length < 3) {

    formErrors.value.NomParcours = 'Le nom du parcours doit faire au moins 3 caractères';

  } else {

    formErrors.value.NomParcours = null;
  }
});

watch(() => currentParcours.value.AnneeFormation, () => {

  if (!currentParcours.value.AnneeFormation || isNaN(currentParcours.value.AnneeFormation) || currentParcours.value.AnneeFormation > new Date().getFullYear()) {

    formErrors.value.AnneeFormation = "L'année de formation ne doit pas être dans le futur";

  } else {
    formErrors.value.AnneeFormation = null;
  }
});

defineExpose({
  openForm,
  closeForm,
});
</script>

<template>
  <CustomModal :isOpen="isOpen" width="600px">
    <template v-slot:title>
      <div class="form-title">
        <i :class="currentParcours.Id ? 'bi bi-pencil-square' : 'bi bi-plus-circle'" class="me-2"></i>
        <span v-if="currentParcours.Id">Modification du parcours</span>
        <span v-else>Nouveau parcours</span>
      </div>
    </template>

    <template v-slot:body>
      <form @submit.prevent="saveParcours" class="parcours-form">
        <CustomInput 
          v-model="currentParcours.NomParcours" 
          id="intitule" 
          libelle="Intitulé" 
          type="text"
          placeholder="Ex: Master MIAGE parcours SIID" 
          :error="formErrors.NomParcours"
          icon="bi bi-bookmark-fill"
        />

        <CustomInput 
          v-model="currentParcours.AnneeFormation" 
          id="annee" 
          libelle="Année de Formation" 
          type="number"
          placeholder="Ex: 2024" 
          :error="formErrors.AnneeFormation"
          icon="bi bi-calendar-fill"
        />

        <div class="form-actions">
          <CustomButton 
            :color="BootstrapButtonEnum.danger" 
            @click="closeForm"
            :disabled="isSaving"
            type="button"
          >
            <i class="bi bi-x-circle me-2"></i>
            Annuler
          </CustomButton>

          <CustomButton 
            :color="BootstrapButtonEnum.primary" 
            @click="saveParcours"
            :loading="isSaving"
            :disabled="isSaving"
            type="button"
          >
            <i class="bi bi-check-circle me-2" v-if="!isSaving"></i>
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </CustomButton>
        </div>
      </form>
    </template>
  </CustomModal>
</template>

<style scoped>
/* Styles spécifiques à ParcoursForm */
.parcours-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
</style>