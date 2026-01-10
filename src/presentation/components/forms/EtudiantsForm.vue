<script setup lang="ts">
import { ref, onBeforeMount, toRaw, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Etudiants } from '@/domain/entities/Etudiants';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';

const toast = useToast();

// Étudiant en cours d'édition ou de création
const currentEtudiant = ref<Etudiants>(new Etudiants(null, null, null, null, null, null));
// Sauvegarde de l'ID du parcours original (pour détecter les changements lors de l'édition)
const originalParcoursId = ref<number | null>(null);
// Liste de tous les parcours disponibles pour le sélecteur
const parcoursOptions = ref<Parcours[]>([]);
// Contrôle l'ouverture/fermeture du modal
const isOpen = ref(false);
// Indicateur de sauvegarde en cours
const isSaving = ref(false);

// Map des erreurs de validation du formulaire
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

/**
 * Convertit un parcours (ID ou objet) en instance Parcours
 * 
 * Gère la compatibilité avec différents formats de données :
 * - Si c'est un nombre : recherche dans parcoursOptions ou crée un parcours minimal
 * - Si c'est un objet : crée une instance Parcours avec les propriétés
 * - Si c'est null ou undefined : retourne null
 * 
 */
const parseParcours = (p: any): Parcours | null => {
    if (!p) return null;
    
    if (typeof p === 'number') {
        return parcoursOptions.value.find(opt => opt.Id === p) || new Parcours(p, `Parcours ${p}`, null);
    }
    return new Parcours(p.ID || p.Id, p.NomParcours, p.AnneeFormation);
};

/**
 * Ouvre le modal en mode création ou édition
 * 
 * En mode édition :
 * - Parse le parcours de l'étudiant (gère différents formats)
 * - Sauvegarde l'ID du parcours original pour détecter les changements
 * - Clone les données de l'étudiant dans le formulaire
 */
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

/**
 * Ferme le modal et réinitialise le formulaire
 * Remet l'étudiant à un état vide et efface l'ID du parcours original
 */
const closeForm = () => {
  isOpen.value = false;
  currentEtudiant.value = new Etudiants(null, null, null, null, null, null);
  originalParcoursId.value = null;
};

// Étudiant à éditer (optionnel, pour mode édition)
const props = defineProps({
  etudiant: {
    type: Object as () => Etudiants | null,
    required: false,
    default: null,
  },
});

// Émissions d'événements vers le composant parent
// - create:etudiant : Émis après création réussie d'un étudiant
// - update:etudiant : Émis après modification réussie d'un étudiant
const emit = defineEmits(['create:etudiant', 'update:etudiant']);

/**
 * Hook onBeforeMount - Initialisation avant le montage du composant
 * 
 * Processus :
 * 1. Si un étudiant est passé en prop, il est chargé dans le formulaire
 * 2. Charge la liste de tous les parcours disponibles pour le sélecteur
 */
onBeforeMount(() => {
  if (props.etudiant) {
    currentEtudiant.value = props.etudiant;
  }
  ParcoursDAO.getInstance().list().then((parcours) => {
    parcoursOptions.value = parcours
  });
});


/**
 * Sauvegarde l'étudiant (création ou modification)
 * 
 * Processus :
 * 1. Vérifie qu'il n'y a pas d'erreurs de validation
 * 2. Active l'indicateur de sauvegarde
 * 3. Si l'étudiant a un ID : mise à jour (UPDATE)
 *    - Passe l'originalParcoursId pour gérer les changements de parcours
 *    Sinon : création (CREATE)
 * 4. Émet l'événement approprié au parent
 * 5. Ferme le modal en cas de succès
 * 6. Affiche un message d'erreur en cas d'échec
 */
const saveEtudiants = () => {
  // Validation avant sauvegarde
  if (formErrors.value.Nom || formErrors.value.Prenom || formErrors.value.Parcours || formErrors.value.NumEtud || formErrors.value.Email) {
    toast.warning('⚠️ Veuillez corriger les erreurs du formulaire', {
      timeout: 3000
    });
    return;
  }
  
  isSaving.value = true;
  
  // Mode ÉDITION : mise à jour d'un étudiant existant
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
    // Mode CRÉATION : nouvel étudiant
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

/**
 * Watcher sur props.etudiant
 * Ouvre automatiquement le formulaire quand un étudiant est passé en prop
 */
watch(() => props.etudiant, (newEtudiant) => { 
    if (newEtudiant) { 
        currentEtudiant.value = newEtudiant; 
        openForm(); 
    } 
});

/**
 * Valide le numéro étudiant en temps réel
 * Règles :
 * - Champ obligatoire
 * - Minimum 3 caractères
 */
watch(() => currentEtudiant.value.NumEtud, () => {
    if (!currentEtudiant.value.NumEtud || currentEtudiant.value.NumEtud.trim() === '') {
        formErrors.value.NumEtud = 'Le numéro étudiant est requis';
    } else if (currentEtudiant.value.NumEtud.length < 3) {
        formErrors.value.NumEtud = 'Le numéro étudiant doit faire au moins 3 caractères';
    } else {
        formErrors.value.NumEtud = null;
    }
});

/**
 * Valide le nom de l'étudiant en temps réel
 * Règles :
 * - Champ obligatoire
 * - Minimum 2 caractères
 */
watch(() => currentEtudiant.value.Nom, () => {
    if (!currentEtudiant.value.Nom || currentEtudiant.value.Nom.trim() === '') {
        formErrors.value.Nom = 'Le nom est requis';
    } else if (currentEtudiant.value.Nom.length < 2) {
        formErrors.value.Nom = 'Le nom doit faire au moins 2 caractères';
    } else {
        formErrors.value.Nom = null;
    }
});

/**
 * Valide le prénom de l'étudiant en temps réel
 * Règles :
 * - Champ obligatoire
 * - Minimum 2 caractères
 */
watch(() => currentEtudiant.value.Prenom, () => {
    if (!currentEtudiant.value.Prenom || currentEtudiant.value.Prenom.trim() === '') {
        formErrors.value.Prenom = 'Le prénom est requis';
    } else if (currentEtudiant.value.Prenom.length < 2) {
        formErrors.value.Prenom = 'Le prénom doit faire au moins 2 caractères';
    } else {
        formErrors.value.Prenom = null;
    }
});

/**
 * Valide l'email de l'étudiant en temps réel
 * Règles :
 * - Champ obligatoire
 * - Format email valide (utilise une regex)
 */
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

// Permet au composant parent d'appeler openForm() et closeForm() via une ref
defineExpose({
  openForm,
  closeForm,
});
</script>

<template>
  <!-- Modal principal contenant le formulaire d'étudiant -->
  <CustomModal :isOpen="isOpen" width="700px">
    <!-- Titre dynamique selon le mode (création/édition) -->
    <template v-slot:title>
      <div class="form-title">
        <i :class="currentEtudiant.Id ? 'bi bi-pencil-square' : 'bi bi-plus-circle'" class="me-2"></i>
        <span v-if="currentEtudiant.Id">Modification de l'Étudiant</span>
        <span v-else>Nouvel Étudiant</span>
      </div>
    </template>

    <!-- Corps du modal : formulaire avec tous les champs de l'étudiant -->
    <template v-slot:body>
      <form @submit.prevent="saveEtudiants" class="etudiant-form">
        <!-- Champ : Numéro étudiant -->
        <CustomInput 
          v-model="currentEtudiant.NumEtud" 
          id="numetud" 
          libelle="Numéro Étudiant" 
          type="text"
          placeholder="Ex: 12345678" 
          :error="formErrors.NumEtud"
          icon="bi bi-hash"
        />

        <!-- Rangée : Nom et Prénom côte à côte -->
        <div class="form-row">
          <!-- Champ : Nom -->
          <CustomInput 
            v-model="currentEtudiant.Nom" 
            id="nom" 
            libelle="Nom" 
            type="text"
            placeholder="Ex: Dupont" 
            :error="formErrors.Nom"
            icon="bi bi-person-fill"
          />

          <!-- Champ : Prénom -->
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

        <!-- Champ : Email avec validation du format -->
        <CustomInput 
          v-model="currentEtudiant.Email" 
          id="email" 
          libelle="Email" 
          type="email"
          placeholder="Ex: marie.dupont@example.com" 
          :error="formErrors.Email"
          icon="bi bi-envelope-fill"
        />

        <!-- Champ : Sélecteur de parcours avec v-select -->
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