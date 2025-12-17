import { Ues } from '@/domain/entities/Ues';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { ErrorMessage } from '../utils/ErrorMessage';
import type { Etudiants } from '../entities/Etudiants';

export class EtudiantsDAO implements IDAO<Etudiants> {
  private static instance: EtudiantsDAO; 

  private constructor() {} 

  public static getInstance(): EtudiantsDAO { 
    if (!EtudiantsDAO.instance) { 
      EtudiantsDAO.instance = new EtudiantsDAO(); 
    } 
    return EtudiantsDAO.instance; 
  } 

  public async create(data: Etudiants): Promise<Etudiants> { 
    try { 
      const response = await apiClient.post(`/api/Etudiant`, data.toJSON()); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de créer le nouvel Etudiant')); 
    } 
  } 

  public async get(id: number): Promise<Etudiants> { 
    try { 
      const response = await apiClient.get(`/api/Etudiant/${id}`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de récupérer l\'Etudiant')); 
    } 
  } 
 
  public async update(id: number, data: Etudiants, oldParcoursId: number | null = null): Promise<Etudiants> {
    // Récupère l'ID du nouveau parcours suivi par l'étudiant
    const newParcoursId = data.ParcoursSuivi?.Id || null;
    
    // Permet de gérer le changement de parcours de l'étudiant uniquement si le parcours a changé
    if (newParcoursId !== oldParcoursId) {
        if (oldParcoursId) {
            await this.removeEtudiantFromParcours(oldParcoursId, id);
        }
        if (newParcoursId) {
            await this.addEtudiantToParcours(newParcoursId, id);
        }
    }
    try { 
      const response = await apiClient.put(`/api/Etudiant/${id}`, data.toJSON()); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de mettre à jour l\'Etudiant')); 
    }  
  } 

  public async delete(id: number): Promise<void> {
    try { 
      const response = await apiClient.delete(`/api/Etudiant/${id}`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de supprimer l\'Etudiant')); 
    }   
  } 
 
  public async list(): Promise<Etudiants[]> { 
        try { 
      const response = await apiClient.get(`/api/Etudiant`); 
      return response.data;
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de récupérer les Etudiants')); 
    } 
  } 

  // Ajoute un étudiant à un parcours
  public async addEtudiantToParcours(parcoursId: number, etudiantId: number): Promise<void> {
      try {
          await apiClient.post(`/api/Parcours/${parcoursId}/etudiants/${etudiantId}`);
      } catch (error) {
          throw new Error(ErrorMessage(error, 'Impossible d\'ajouter l\'étudiant au parcours'));
      }
  }

  // Retire un étudiant d'un parcours spécifique
  public async removeEtudiantFromParcours(parcoursId: number, etudiantId: number): Promise<void> {
      try {
          await apiClient.delete(`/api/Parcours/${parcoursId}/etudiants/${etudiantId}`);
      } catch (error) {
          throw new Error(ErrorMessage(error, 'Impossible de retirer l\'étudiant du parcours'));
      }
  }
  
}