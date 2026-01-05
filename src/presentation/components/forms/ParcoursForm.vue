<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { useToast } from 'vue-toastification'; // Service de notifications toast
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const toast = useToast();

// Parcours en cours d'édition ou de création
const currentParcours = ref<Parcours>(new Parcours(null, null, null));
// Contrôle l'ouverture/fermeture du modal
const isOpen = ref(false);

// Map des erreurs de validation du formulaire
const formErrors = ref<{
  NomParcours: string | null;
  AnneeFormation: string | null;
}>
  ({
    NomParcours: null,
    AnneeFormation: null,
  });

/**
 * Ouvre le modal en mode création ou édition
 */
const openForm = (parcours: Parcours | null = null) => {
  isOpen.value = true;

  if (parcours) {
    // Clone profond pour éviter les mutations directes de l'objet original
    currentParcours.value = structuredClone(toRaw(parcours));
  }
};

/**
 * Ferme le modal et réinitialise le formulaire
 * Remet le parcours à un état vide pour une prochaine ouverture en mode création
 */
const closeForm = () => {
  isOpen.value = false;
  currentParcours.value = new Parcours(null, null, null);
};

// Parcours à éditer (optionnel, pour mode édition)
const props = defineProps({
  parcours: {
    type: Object as () => Parcours | null,
    required: false,
    default: null,
  },
});

// Émissions d'événements vers le composant parent
// - create:parcours : Émis après création réussie d'un parcours
// - update:parcours : Émis après modification réussie d'un parcours
const emit = defineEmits(['create:parcours', 'update:parcours']);

/**
 * Hook onBeforeMount - Initialisation avant le montage du composant
 * Si un parcours est passé en prop, il est chargé dans le formulaire
 */
onBeforeMount(() => {
  if (props.parcours) {
    currentParcours.value = props.parcours;
  }
});

// Indicateur de sauvegarde en cours
const isSaving = ref(false);

/**
 * Sauvegarde le parcours (création ou modification)
 * 
 * Processus :
 * 1. Vérifie qu'il n'y a pas d'erreurs de validation
 * 2. Active l'indicateur de sauvegarde
 * 3. Si le parcours a un ID : mise à jour (UPDATE)
 *    Sinon : création (CREATE)
 * 4. Émet l'événement approprié au parent
 * 5. Ferme le modal en cas de succès
 * 6. Affiche un message d'erreur en cas d'échec
 */
const saveParcours = () => {
  // Validation avant sauvegarde
  if (formErrors.value.NomParcours || formErrors.value.AnneeFormation) {
    toast.warning('⚠️ Veuillez corriger les erreurs du formulaire', {
      timeout: 3000
    });
    return;
  }
  
  isSaving.value = true;
  
  // Mode ÉDITION : mise à jour d'un parcours existant
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
    // Mode CRÉATION : nouveau parcours
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

/**
 * Valide le nom du parcours en temps réel
 * Règle : minimum 3 caractères (hors espaces)
 */
watch(() => currentParcours.value.NomParcours, () => {

  if (!currentParcours.value.NomParcours || currentParcours.value.NomParcours.trim() === '' || currentParcours.value.NomParcours.length < 3) {

    formErrors.value.NomParcours = 'Le nom du parcours doit faire au moins 3 caractères';

  } else {

    formErrors.value.NomParcours = null;
  }
});

/**
 * Valide l'année de formation en temps réel
 * Règles :
 * - Doit être un nombre valide
 * - Ne doit pas être dans le futur (année actuelle maximum)
 */
watch(() => currentParcours.value.AnneeFormation, () => {

  if (!currentParcours.value.AnneeFormation || isNaN(currentParcours.value.AnneeFormation) || currentParcours.value.AnneeFormation > new Date().getFullYear()) {

    formErrors.value.AnneeFormation = "L'année de formation ne doit pas être dans le futur";

  } else {
    formErrors.value.AnneeFormation = null;
  }
});

// Permet au composant parent d'appeler openForm() et closeForm() via une ref
defineExpose({
  openForm,
  closeForm,
});
</script>

<template>
  <!-- Modal principal contenant le formulaire de parcours -->
  <CustomModal :isOpen="isOpen" width="600px">
    <!-- Titre dynamique selon le mode (création/édition) -->
    <template v-slot:title>
      <div class="form-title">
        <i :class="currentParcours.Id ? 'bi bi-pencil-square' : 'bi bi-plus-circle'" class="me-2"></i>
        <span v-if="currentParcours.Id">Modification du parcours</span>
        <span v-else>Nouveau parcours</span>
      </div>
    </template>

    <!-- Corps du modal : formulaire avec champs et boutons -->
    <template v-slot:body>
      <form @submit.prevent="saveParcours" class="parcours-form">
        <!-- Champ : Nom/Intitulé du parcours -->
        <CustomInput 
          v-model="currentParcours.NomParcours" 
          id="intitule" 
          libelle="Intitulé" 
          type="text"
          placeholder="Ex: Master MIAGE parcours SIID" 
          :error="formErrors.NomParcours"
          icon="bi bi-bookmark-fill"
        />

        <!-- Champ : Année de formation -->
        <CustomInput 
          v-model="currentParcours.AnneeFormation" 
          id="annee" 
          libelle="Année de Formation" 
          type="number"
          placeholder="Ex: 2024" 
          :error="formErrors.AnneeFormation"
          icon="bi bi-calendar-fill"
        />

        <!-- Boutons d'action : Annuler / Enregistrer -->
        <div class="form-actions">
          <!-- Bouton Annuler : ferme le modal sans sauvegarder -->
          <CustomButton 
            :color="BootstrapButtonEnum.danger" 
            @click="closeForm"
            :disabled="isSaving"
            type="button"
          >
            <i class="bi bi-x-circle me-2"></i>
            Annuler
          </CustomButton>

          <!-- Bouton Enregistrer : sauvegarde avec indicateur de chargement -->
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