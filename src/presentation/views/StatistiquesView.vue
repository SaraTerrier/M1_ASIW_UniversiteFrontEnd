<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { EtudiantsDAO } from '@/domain/daos/EtudiantsDAO';
import { UesDAO } from '@/domain/daos/UesDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { NoteDAO } from '@/domain/daos/NoteDAO';
import type { Etudiants } from '@/domain/entities/Etudiants';
import type { Ues } from '@/domain/entities/Ues';
import type { Parcours } from '@/domain/entities/Parcours';
import type { Note } from '@/domain/entities/Note';
import StatCard from '@/presentation/components/charts/StatCard.vue';
import BarChartCard from '@/presentation/components/charts/BarChartCard.vue';
import DoughnutChartCard from '@/presentation/components/charts/DoughnutChartCard.vue';
import LineChartCard from '@/presentation/components/charts/LineChartCard.vue';
import { genererCouleur, genererPaireCouleurs } from '@/domain/utils/ChartColors';
import { barChartOptions, doughnutChartOptions, lineChartOptions } from '@/presentation/config/chartOptions';

// Enregistrer les composants Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// DAOs - Instances singleton pour accéder aux données
const etudiantsDAO = EtudiantsDAO.getInstance();
const uesDAO = UesDAO.getInstance();
const parcoursDAO = ParcoursDAO.getInstance();
const noteDAO = NoteDAO.getInstance();

// État de chargement et données réactives
const loading = ref(true);
const etudiants = ref<Etudiants[]>([]);
const ues = ref<Ues[]>([]);
const parcours = ref<Parcours[]>([]);
const notes = ref<Note[]>([]);

// Compteurs pour les cartes de statistiques
const totalEtudiants = ref(0);
const totalParcours = ref(0);
const totalUes = ref(0);
const totalNotes = ref(0);

// Configuration du graphique : UE avec le plus de parcours (barres)
const ueParcoursData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Nombre de parcours',
    data: [] as number[],
    backgroundColor: [] as string[],
    borderColor: [] as string[],
    borderWidth: 2
  }]
});

// Configuration du graphique : Répartition des étudiants par UE (camembert)
const ueEtudiantsCamembertData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Étudiants par UE',
    data: [] as number[],
    backgroundColor: [] as string[],
    borderColor: [] as string[],
    borderWidth: 2
  }]
});

// Configuration du graphique : Répartition des étudiants par parcours (camembert)
const etudiantsParParcoursData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Étudiants',
    data: [] as number[],
    backgroundColor: [] as string[],
    borderColor: [] as string[],
    borderWidth: 2
  }]
});

// Configuration du graphique : Moyenne des notes par UE (ligne)
const moyenneNotesParUeData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Moyenne (/20)',
    data: [] as number[],
    backgroundColor: '',
    borderColor: '',
    borderWidth: 2,
    tension: 0.4,
    fill: true
  }]
});

// Configuration du graphique : Distribution des notes par tranches (barres)
const distributionNotesData = ref({
  labels: ['0-5', '5-10', '10-12', '12-15', '15-18', '18-20'],
  datasets: [{
    label: 'Nombre de notes',
    data: [] as number[],
    backgroundColor: [] as string[],
    borderColor: [] as string[],
    borderWidth: 2
  }]
});

// Charge toutes les données depuis les DAOs et calcule les statistiques
const chargerDonnees = async () => {
  try {
    loading.value = true;

    // Exécution parallèle pour optimiser les performances
    const [etudiantsData, uesData, parcoursData, notesData] = await Promise.all([
      etudiantsDAO.list(),
      uesDAO.list(),
      parcoursDAO.list(),
      noteDAO.list()
    ]);

    etudiants.value = etudiantsData;
    ues.value = uesData;
    parcours.value = parcoursData;
    notes.value = notesData;

    // Calculer les statistiques
    totalEtudiants.value = etudiants.value.length;
    totalParcours.value = parcours.value.length;
    totalUes.value = ues.value.length;
    totalNotes.value = notes.value.length;

    calculerGraphiques();
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  } finally {
    loading.value = false;
  }
};

// Génère les données pour tous les graphiques avec couleurs aléatoires
const calculerGraphiques = () => {
  // === Graphique 1: UE avec le plus de parcours ===
  const ueParcoursMap = new Map<number, { nom: string; count: number }>();
  
  ues.value.forEach(ue => {
    if (ue.Id !== null && ue.Intitule) {
      const nombreParcours = ue.Parcours?.length || 0;
      ueParcoursMap.set(ue.Id, {
        nom: ue.Intitule,
        count: nombreParcours
      });
    }
  });

  // Trier et limiter aux 10 UE ayant le plus de parcours
  const sortedUeParcours = Array.from(ueParcoursMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  // Appliquer les données et générer des couleurs aléatoires
  ueParcoursData.value.labels = sortedUeParcours.map(([_, data]) => data.nom);
  ueParcoursData.value.datasets[0].data = sortedUeParcours.map(([_, data]) => data.count);
  const couleursParcours = genererPaireCouleurs(sortedUeParcours.length);
  ueParcoursData.value.datasets[0].backgroundColor = couleursParcours.map(c => c.bg);
  ueParcoursData.value.datasets[0].borderColor = couleursParcours.map(c => c.border);

  // === Graphique 2: Répartition des étudiants par UE ===
  const ueEtudiantsMap = new Map<number, Set<number>>();
  
  // Compter les étudiants uniques par UE en analysant les notes
  notes.value.forEach(note => {
    const noteData = note as any;
    const ueId = noteData.UeId || note.IdUe;
    const etudiantId = noteData.EtudiantId || note.IdEtudiant;
    
    if (ueId !== null && etudiantId !== null) {
      if (!ueEtudiantsMap.has(ueId)) {
        ueEtudiantsMap.set(ueId, new Set());
      }
      ueEtudiantsMap.get(ueId)?.add(etudiantId);
    }
  });

  // Créer un tableau avec les noms d'UE et le nombre d'étudiants
  const ueEtudiantsArray: Array<{ nom: string; count: number }> = [];
  
  if (ueEtudiantsMap.size > 0) {
    // Si on a des notes, utiliser les données des notes
    ueEtudiantsMap.forEach((etudiantsSet, ueId) => {
      const ue = ues.value.find(u => u.Id === ueId);
      if (ue) {
        const nomUe = ue.Intitule || `UE ${ueId}`;
        ueEtudiantsArray.push({
          nom: nomUe,
          count: etudiantsSet.size
        });
      }
    });
  } else {
    // Si pas de notes, afficher simplement toutes les UEs disponibles avec 0 étudiants
    // Ou compter les UEs par leur nombre de parcours comme indicateur
    ues.value.forEach(ue => {
      if (ue.Id !== null && ue.Intitule) {
        const nombreParcours = ue.Parcours?.length || 0;
        if (nombreParcours > 0) {
          ueEtudiantsArray.push({
            nom: ue.Intitule,
            count: nombreParcours
          });
        }
      }
    });
  }

  // Trier par nombre d'étudiants décroissant
  ueEtudiantsArray.sort((a, b) => b.count - a.count);

  // Appliquer les données et couleurs au graphique
  ueEtudiantsCamembertData.value.labels = ueEtudiantsArray.map(data => data.nom);
  ueEtudiantsCamembertData.value.datasets[0].data = ueEtudiantsArray.map(data => data.count);
  const couleursUe = genererPaireCouleurs(ueEtudiantsArray.length);
  ueEtudiantsCamembertData.value.datasets[0].backgroundColor = couleursUe.map(c => c.bg);
  ueEtudiantsCamembertData.value.datasets[0].borderColor = couleursUe.map(c => c.border);

  // === Graphique 3: Répartition des étudiants par parcours ===
  const etudiantsParParcours = new Map<number, number>();
  
  // Compter les étudiants par parcours
  etudiants.value.forEach(etudiant => {
    const etudiantData = etudiant as any;
    const parcoursId = etudiantData.ParcoursId || etudiantData.parcoursId || 
                       etudiant.ParcoursSuivi?.Id || etudiantData.ParcoursSuivi;
    
    if (parcoursId !== null && parcoursId !== undefined) {
      etudiantsParParcours.set(parcoursId, (etudiantsParParcours.get(parcoursId) || 0) + 1);
    }
  });

  // Associer les compteurs aux noms de parcours
  etudiantsParParcoursData.value.labels = [];
  etudiantsParParcoursData.value.datasets[0].data = [];

  etudiantsParParcours.forEach((count, parcoursId) => {
    const p = parcours.value.find(par => par.Id === parcoursId);
    if (p) {
      const nomParcours = p.NomParcours || `Parcours ${parcoursId}`;
      etudiantsParParcoursData.value.labels.push(nomParcours);
      etudiantsParParcoursData.value.datasets[0].data.push(count);
    }
  });

  const nombreParcours = etudiantsParParcoursData.value.labels.length;
  if (nombreParcours > 0) {
    const couleursEtudiantsParcours = genererPaireCouleurs(nombreParcours);
    etudiantsParParcoursData.value.datasets[0].backgroundColor = couleursEtudiantsParcours.map(c => c.bg);
    etudiantsParParcoursData.value.datasets[0].borderColor = couleursEtudiantsParcours.map(c => c.border);
  }

  // === Graphique 4: Moyenne des notes par UE ===
  const moyennesParUe = new Map<number, { somme: number, count: number }>();
  // Calculer somme et nombre de notes pour chaque UE
  notes.value.forEach(note => {
    const noteData = note as any;
    const ueId = noteData.UeId || note.IdUe;
    const valeur = noteData.Valeur || note.Valeur;
    
    if (ueId !== null && valeur !== null) {
      const current = moyennesParUe.get(ueId) || { somme: 0, count: 0 };
      current.somme += valeur;
      current.count += 1;
      moyennesParUe.set(ueId, current);
    }
  });

  // Calculer les moyennes et associer aux noms d'UE
  moyenneNotesParUeData.value.labels = [];
  moyenneNotesParUeData.value.datasets[0].data = [];

  moyennesParUe.forEach((stat, ueId) => {
    const ue = ues.value.find(u => u.Id === ueId);
    if (ue && ue.Intitule) {
      moyenneNotesParUeData.value.labels.push(ue.Intitule);
      moyenneNotesParUeData.value.datasets[0].data.push(
        Math.round((stat.somme / stat.count) * 100) / 100
      );
    }
  });

  // Appliquer une couleur aléatoire unique pour ce graphique ligne
  const nombreUes = moyenneNotesParUeData.value.labels.length;
  if (nombreUes > 0) {
    const couleurPrincipale = genererCouleur(1);
    moyenneNotesParUeData.value.datasets[0].backgroundColor = couleurPrincipale.replace('1)', '0.2)');
    moyenneNotesParUeData.value.datasets[0].borderColor = couleurPrincipale;
  }

  // === Graphique 5: Distribution des notes par tranches ===
  const tranches = [0, 0, 0, 0, 0, 0]; // [0-5, 5-10, 10-12, 12-15, 15-18, 18-20]
  // Compter les notes dans chaque tranche
  notes.value.forEach(note => {
    const noteData = note as any;
    const valeur = noteData.Valeur || note.Valeur;
    
    if (valeur !== null) {
      if (valeur < 5) tranches[0]++;
      else if (valeur < 10) tranches[1]++;
      else if (valeur < 12) tranches[2]++;
      else if (valeur < 15) tranches[3]++;
      else if (valeur < 18) tranches[4]++;
      else tranches[5]++;
    }
  });

  // Appliquer les données et couleurs
  distributionNotesData.value.datasets[0].data = tranches;
  const couleursDistribution = genererPaireCouleurs(6);
  distributionNotesData.value.datasets[0].backgroundColor = couleursDistribution.map(c => c.bg);
  distributionNotesData.value.datasets[0].borderColor = couleursDistribution.map(c => c.border);
};

// Charger les données au montage du composant
onMounted(() => {
  chargerDonnees();
});
</script>

<template>
  <div class="statistiques-view">
    <h1 class="page-title">📊 Statistiques</h1>

    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else class="content">
      <!-- Cartes de statistiques générales -->
      <div class="stats-grid">
        <StatCard 
          icon="👨‍🎓" 
          title="Étudiants" 
          :value="totalEtudiants" 
          variant="primary" 
        />
        <StatCard 
          icon="🎯" 
          title="Parcours" 
          :value="totalParcours" 
          variant="secondary" 
        />
        <StatCard 
          icon="📚" 
          title="UEs" 
          :value="totalUes" 
          variant="tertiary" 
        />
        <StatCard 
          icon="📝" 
          title="Notes" 
          :value="totalNotes" 
          variant="quaternary" 
        />
      </div>

      <!-- Graphiques UE et Parcours -->
      <div class="charts-grid-two-columns">
        <BarChartCard 
          title="UE avec le plus de parcours" 
          :chart-data="ueParcoursData" 
          :options="barChartOptions" 
        />

        <DoughnutChartCard 
          title="Répartition des étudiants par parcours" 
          :chart-data="etudiantsParParcoursData" 
          :options="doughnutChartOptions" 
        />
      </div>

      <!-- Autres graphiques -->
      <div class="charts-grid">
        <BarChartCard 
          title="Distribution des notes" 
          :chart-data="distributionNotesData" 
          :options="barChartOptions" 
        />

        <LineChartCard 
          title="Moyenne des notes par UE" 
          :chart-data="moyenneNotesParUeData" 
          :options="lineChartOptions" 
        />
      </div>

      <!-- Graphique camembert pleine largeur -->
      <DoughnutChartCard 
        class="full-width-chart"
        title="Répartition des étudiants par UE" 
        :chart-data="ueEtudiantsCamembertData" 
        :options="doughnutChartOptions" 
      />
    </div>
  </div>
</template>

<style scoped>
.statistiques-view {
  padding: var(--spacing-8);
  max-width: var(--max-width-7xl);
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-8);
  color: var(--color-text-primary);
  text-align: center;
  font-family: var(--font-family-heading);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

/* Cartes de statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
}

/* Graphiques */
.charts-grid-two-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
}

.full-width-chart {
  grid-column: 1 / -1;
}

.full-width-chart .chart-wrapper-large {
  height: 500px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: var(--spacing-8);
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-grid-two-columns {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .statistiques-view {
    padding: var(--spacing-4);
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
