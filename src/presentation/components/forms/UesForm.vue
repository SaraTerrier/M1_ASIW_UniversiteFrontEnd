<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Ues } from '@/domain/entities/Ues';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { UesDAO } from '@/domain/daos/UesDAO';
import { Parcours } from '@/domain/entities/Parcours';

const toast = useToast();
const currentUes = ref<Ues>(new Ues(null, null, null, null));
const parcoursOptions = ref<Parcours[]>([]);
const isOpen = ref(false);
const isSaving = ref(false);

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
    toast.warning('⚠️ Veuillez corriger les erreurs du formulaire', {
      timeout: 3000
    });
    return;
  }
  
  isSaving.value = true;
  
  if (currentUes.value.Id) {
    UesDAO.getInstance().update(currentUes.value.Id, currentUes.value).then(() => {
      emit('update:ues', JSON.parse(JSON.stringify(toRaw(currentUes.value))));
      closeForm();
    }).catch((ex) => {
      console.error('Erreur lors de la mise à jour:', ex);
      toast.error(`❌ Erreur: ${ex.message}`, {
        timeout: 4000
      });
    }).finally(() => {
      isSaving.value = false;
    });
  } else {
    console.log('UE avant création:', currentUes.value);
    UesDAO.getInstance().create(currentUes.value).then((newUes) => {
      emit('create:ues', newUes);
      closeForm();
    }).catch((ex) => {
      console.error('Erreur lors de la création:', ex);
      toast.error(`❌ Erreur: ${ex.message}`, {
        timeout: 4000
      });
    }).finally(() => {
      isSaving.value = false;
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
  <CustomModal :isOpen="isOpen" width="700px">
    <template v-slot:title>
      <div class="form-title">
        <i :class="currentUes.Id ? 'bi bi-pencil-square' : 'bi bi-plus-circle'" class="me-2"></i>
        <span v-if="currentUes.Id">Modification de l'UE</span>
        <span v-else>Nouvelle UE</span>
      </div>
    </template>

    <template v-slot:body>
      <form @submit.prevent="saveUes" class="ues-form">
        <div class="form-row">
          <CustomInput 
            v-model="currentUes.NumeroUe" 
            id="numeroue" 
            libelle="Numéro UE" 
            type="text"
            placeholder="Ex: UE1, UE2..." 
            :error="formErrors.NumeroUe"
            icon="bi bi-hash"
          />

          <CustomInput 
            v-model="currentUes.Intitule" 
            id="intitule" 
            libelle="Intitulé" 
            type="text"
            placeholder="Ex: Mathématiques Avancées" 
            :error="formErrors.Intitule"
            icon="bi bi-book-fill"
          />
        </div>

        <div class="form-group-modern">
          <label for="parcours" class="form-label-modern">
            Parcours
            <span v-if="formErrors.Parcours" class="text-danger ms-1">*</span>
          </label>
          <div class="select-wrapper">
            <i class="select-icon bi bi-diagram-3-fill"></i>
            <v-select 
              multiple 
              label="NomParcours" 
              v-model="currentUes.Parcours" 
              :options="parcoursOptions"
              placeholder="Sélectionnez les parcours"
              class="v-select-modern"
            ></v-select>
          </div>
          <div v-if="formErrors.Parcours" class="error-message">
            <i class="bi bi-x-circle me-1"></i>
            {{ formErrors.Parcours }}
          </div>
        </div>

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
            @click="saveUes"
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
/* Styles spécifiques à UesForm */
.ues-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-row {
  grid-template-columns: 1fr 2fr;
}
</style>