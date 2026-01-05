import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../presentation/views/HomeView.vue';
import ParcoursListView from '@/presentation/views/ParcoursListView.vue';
import UesListView from '@/presentation/views/UesListView.vue';
import UeDetailView from '@/presentation/views/UeDetailView.vue';
import EtudiantListView from '@/presentation/views/EtudiantListView.vue';
import StatistiquesView from '@/presentation/views/StatistiquesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    { 
      path: '/parcours', 
      name: 'parcours', 
      component: ParcoursListView 
    },
    {
      path: '/ues',
      name: 'ues',
      component: UesListView
    },
    {
      path: '/ues/:id',
      name: 'ue-detail',
      component: UeDetailView
    },
    {
      path: '/etudiants',
      name: 'etudiants',
      component: EtudiantListView
    },
    {
      path: '/statistiques',
      name: 'statistiques',
      component: StatistiquesView
    },
  ]
});

export default router;
