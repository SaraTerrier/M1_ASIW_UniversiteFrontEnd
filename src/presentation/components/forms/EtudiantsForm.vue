<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Etudiants } from '@/domain/entities/Etudiants';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { Parcours } from '@/domain/entities/Parcours';

const toast = useToast();
const currentEtudiant = ref<Etudiants>(new Etudiants(null, null, null, null, null, null));
const originalParcoursId = ref<number | null>(null);
const parcoursOptions = ref<Parcours[]>([]);
const isOpen = ref(false);
const isSaving = ref(false);

const formErrors = ref<{
  NumEtud: string | null;
  Nom: string | null;
  Prenom?: string | null;
  Email?: string | null;
  Parcours?: string | null;
}>
  ({
    NumEtud: null,
    Nom: null,
    Prenom: null,
    Email: null,
    Parcours: null,
  });

const parseParcours = (p: any): Parcours => {
    if (typeof p === 'number') {
        return parcoursOptions.value.find(opt => opt.Id === p) || new Parcours(p, `Parcours ${p}`, null);
    }
    return new Parcours(p.ID, p.NomParcours, p.AnneeFormation);
};

const openForm = (etudiant: Etudiants | null = null) => { 
    isOpen.value = true; 
    if (etudiant) { 
        const parcours = parseParcours(etudiant.ParcoursSuivi);
        originalParcoursId.value = parcours?.Id || null;
        currentEtudiant.value = new Etudiants(
            etudiant.Id,
            etudiant.Nom,
            etudiant.Prenom,
            etudiant.NumEtud,
            etudiant.Email,
            parcours
        );
    } 
};

const closeForm = () => {
  isOpen.value = false;
  currentEtudiant.value = new Etudiants(null, null, null, null, null, null);
  originalParcoursId.value = null;
};

const props = defineProps({
  etudiant: {
    type: Object as () => Etudiants | null,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['create:etudiant', 'update:etudiant']);

onBeforeMount(() => {
  if (props.etudiant) {
    currentEtudiant.value = props.etudiant;
  }
  ParcoursDAO.getInstance().list().then((parcours) => {
    parcoursOptions.value = parcours
  });
});


const saveEtudiants = () => {
  if (formErrors.value.Nom || formErrors.value.Prenom || formErrors.value.Parcours || formErrors.value.NumEtud || formErrors.value.Email) {
    toast.warning('⚠️ Veuillez corriger les erreurs du formulaire', {
      timeout: 3000
    });
    return;
  }
  
  isSaving.value = true;
  
  if (currentEtudiant.value.Id) {
    EtudiantsDAO.getInstance().update(currentEtudiant.value.Id, currentEtudiant.value, originalParcoursId.value).then(() => {
      emit('update:etudiant', JSON.parse(JSON.stringify(toRaw(currentEtudiant.value))));
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
    EtudiantsDAO.getInstance().create(currentEtudiant.value).then((newEtudiant) => {
      emit('create:etudiant', newEtudiant);
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


watch(() => props.etudiant, (newEtudiant) => { 
    if (newEtudiant) { 
        currentEtudiant.value = newEtudiant; 
        openForm(); 
    } 
});

// Validation du champ NumEtud de l'étudiant
watch(() => currentEtudiant.value.NumEtud, () => {
    if (!currentEtudiant.value.NumEtud || currentEtudiant.value.NumEtud.trim() === '') {
        formErrors.value.NumEtud = 'Le numéro étudiant est requis';
    } else if (currentEtudiant.value.NumEtud.length < 3) {
        formErrors.value.NumEtud = 'Le numéro étudiant doit faire au moins 3 caractères';
    } else {
        formErrors.value.NumEtud = null;
    }
});

// Validation du champ Nom de l'étudiant 
watch(() => currentEtudiant.value.Nom, () => {
    if (!currentEtudiant.value.Nom || currentEtudiant.value.Nom.trim() === '') {
        formErrors.value.Nom = 'Le nom est requis';
    } else if (currentEtudiant.value.Nom.length < 2) {
        formErrors.value.Nom = 'Le nom doit faire au moins 2 caractères';
    } else {
        formErrors.value.Nom = null;
    }
});

// Validation du champ Prenom de l'étudiant
watch(() => currentEtudiant.value.Prenom, () => {
    if (!currentEtudiant.value.Prenom || currentEtudiant.value.Prenom.trim() === '') {
        formErrors.value.Prenom = 'Le prénom est requis';
    } else if (currentEtudiant.value.Prenom.length < 2) {
        formErrors.value.Prenom = 'Le prénom doit faire au moins 2 caractères';
    } else {
        formErrors.value.Prenom = null;
    }
});

// Validation du champ Email de l'étudiant
watch(() => currentEtudiant.value.Email, () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!currentEtudiant.value.Email || currentEtudiant.value.Email.trim() === '') {
        formErrors.value.Email = 'L\'email est requis';
    } else if (!emailRegex.test(currentEtudiant.value.Email)) {
        formErrors.value.Email = 'L\'email n\'est pas valide';
    } else {
        formErrors.value.Email = null;
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
        <i :class="currentEtudiant.Id ? 'bi bi-pencil-square' : 'bi bi-plus-circle'" class="me-2"></i>
        <span v-if="currentEtudiant.Id">Modification de l'Étudiant</span>
        <span v-else>Nouvel Étudiant</span>
      </div>
    </template>

    <template v-slot:body>
      <form @submit.prevent="saveEtudiants" class="etudiant-form">
        <CustomInput 
          v-model="currentEtudiant.NumEtud" 
          id="numetud" 
          libelle="Numéro Étudiant" 
          type="text"
          placeholder="Ex: 12345678" 
          :error="formErrors.NumEtud"
          icon="bi bi-hash"
        />

        <div class="form-row">
          <CustomInput 
            v-model="currentEtudiant.Nom" 
            id="nom" 
            libelle="Nom" 
            type="text"
            placeholder="Ex: Dupont" 
            :error="formErrors.Nom"
            icon="bi bi-person-fill"
          />

          <CustomInput 
            v-model="currentEtudiant.Prenom" 
            id="prenom" 
            libelle="Prénom" 
            type="text"
            placeholder="Ex: Marie" 
            :error="formErrors.Prenom"
            icon="bi bi-person-fill"
          />
        </div>

        <CustomInput 
          v-model="currentEtudiant.Email" 
          id="email" 
          libelle="Email" 
          type="email"
          placeholder="Ex: marie.dupont@example.com" 
          :error="formErrors.Email"
          icon="bi bi-envelope-fill"
        />

        <div class="form-group-modern">
          <label for="parcours" class="form-label-modern">
            Parcours
            <span v-if="formErrors.Parcours" class="text-danger ms-1">*</span>
          </label>
          <div class="select-wrapper">
            <i class="select-icon bi bi-diagram-3-fill"></i>
            <v-select 
              label="NomParcours" 
              v-model="currentEtudiant.ParcoursSuivi" 
              :options="parcoursOptions"
              placeholder="Sélectionnez un parcours"
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
            @click="saveEtudiants"
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
/* Styles spécifiques à EtudiantsForm */
.etudiant-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
</style>