<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Etudiants } from '@/domain/entities/Etudiants';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { Parcours } from '@/domain/entities/Parcours';

const currentEtudiant = ref<Etudiants>(new Etudiants(null, null, null, null, null, null));
const originalParcoursId = ref<number | null>(null);
const parcoursOptions = ref<Parcours[]>([]);
const isOpen = ref(false);

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
    return;
  }
  if (currentEtudiant.value.Id) {
    EtudiantsDAO.getInstance().update(currentEtudiant.value.Id, currentEtudiant.value, originalParcoursId.value).then(() => {
      alert('Etudiants mis à jour avec succès');
      // Emission de l'événement de mise à jour avec une copie du etudiant mis à jour
      emit('update:etudiant', JSON.parse(JSON.stringify(toRaw(currentEtudiant.value))));
      closeForm();
    }).catch((ex) => {
      console.error('Erreur lors de la mise à jour:', ex);
      alert(ex.message);
    });
  } else {
    EtudiantsDAO.getInstance().create(currentEtudiant.value).then((newEtudiant) => {
      alert('Etudiant créé avec succès');
      emit('create:etudiant', newEtudiant);
      closeForm();
    }).catch((ex) => {
      console.error('Erreur lors de la création:', ex);
      alert(ex.message);
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
  <CustomModal :isOpen="isOpen">
    <template v-slot:title>
      <template v-if="etudiant && etudiant.Id"> Modification de l'Etudiant</template>
      <template v-else> Nouvel Etudiant</template>
    </template>
    <template v-slot:body>
      <div class="text-start mt-1 mb-1">
        <form>
          <CustomInput v-model="currentEtudiant.NumEtud" class="mt-2" id="numetud" libelle="Numéro Étudiant" type="text"
            placeholder="Numéro d'Étudiant" :error="formErrors.NumEtud" />
          <CustomInput v-model="currentEtudiant.Nom" id="nom" libelle="Nom" type="text"
            placeholder="Nom de l'Étudiant" :error="formErrors.Nom" />
          <CustomInput v-model="currentEtudiant.Prenom" id="prenom" libelle="Prénom" type="text"
            placeholder="Prénom de l'Étudiant" :error="formErrors.Prenom" />
          <CustomInput v-model="currentEtudiant.Email" id="email" libelle="Email" type="email"
            placeholder="Email de l'Étudiant" :error="formErrors.Email" />
          <div class="form-group">
            <label for="intitule">Parcours :</label>
            <v-select label="NomParcours" v-model="currentEtudiant.ParcoursSuivi" :options="parcoursOptions"></v-select>
            <div v-if="formErrors.Parcours" class="invalid-feedback">
              {{ formErrors.Parcours }}
            </div>
          </div>
        </form>
      </div>
      <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm">
        Annuler
      </CustomButton>
      <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveEtudiants">
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