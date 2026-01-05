import type { Parcours } from '../entities/Parcours'; 
import type { IDAO } from './IDAO'; 
import apiClient from '../config/axiosConfig';
import { ErrorMessage } from '../utils/ErrorMessage';

export class ParcoursDAO implements IDAO<Parcours> { 
  private static instance: ParcoursDAO; 

  private constructor() {} 

  public static getInstance(): ParcoursDAO { 
    if (!ParcoursDAO.instance) { 
      ParcoursDAO.instance = new ParcoursDAO(); 
    } 
    return ParcoursDAO.instance; 
  } 

  public async create(data: Parcours): Promise<Parcours> { 
    try { 
      const response = await apiClient.post(`/api/Parcours`, data); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error, 'Impossible de créer le nouveau parcours')); 
    } 
  } 

  public async get(id: number): Promise<Parcours> { 
    try { 
      const response = await apiClient.get(`/api/Parcours/${id}`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de récupérer le parcours')); 
    } 
  } 
 
  public async update(id: number, data: Parcours): Promise<Parcours> { 
    try { 
      const response = await apiClient.put(`/api/Parcours/${id}`, data); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de mettre à jour le parcours')); 
    } 
  } 

  public async delete(id: number): Promise<void> { 
    try { 
      const response = await apiClient.delete(`/api/Parcours/${id}`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de mettre à jour le parcours')); 
    } 
  } 
 
  public async list(): Promise<Parcours[]> { 
        try { 
      const response = await apiClient.get(`/api/Parcours`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de récupérer les parcours')); 
    } 
  } 

  // Ajouter une UE à un parcours
  public async addUEToParcours(parcoursId: number, ueId: number): Promise<void> { 
    try { 
      await apiClient.post(`/api/Parcours/${parcoursId}/Ues/${ueId}`); 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible d\'ajouter l\'UE au parcours')); 
    }
  }

  // Retirer une UE d'un parcours
  public async removeUEFromParcours(parcoursId: number, ueId: number): Promise<void> { 
    try { 
      await apiClient.delete(`/api/Parcours/${parcoursId}/Ues/${ueId}`); 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de retirer l\'UE du parcours')); 
    }
  }
  
} 