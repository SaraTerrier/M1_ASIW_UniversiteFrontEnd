import { Ues } from '@/domain/entities/Ues';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { ErrorMessage } from '../utils/ErrorMessage';

export class UesDAO implements IDAO<Ues> {
      private static instance: UesDAO; 

  private constructor() {} 

  public static getInstance(): UesDAO { 
    if (!UesDAO.instance) { 
      UesDAO.instance = new UesDAO(); 
    } 
    return UesDAO.instance; 
  } 

  public async create(data: Ues): Promise<Ues> { 
    try { 
      const response = await apiClient.post(`/api/Ue`, data.toJSON()); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de créer la nouvelle Ue')); 
    } 
  } 

  public async get(id: number): Promise<Ues> { 
    try { 
      const response = await apiClient.get(`/api/Ue/${id}`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de récupérer l\'Ue')); 
    } 
  } 
 
  public async update(id: number, data: Ues): Promise<Ues> { 
    try { 
      const response = await apiClient.put(`/api/Ue/${id}`, data.toJSON()); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de mettre à jour l\'Ue')); 
    }  
  } 

  public async delete(id: number): Promise<void> {
    try { 
      const response = await apiClient.delete(`/api/Ue/${id}`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de supprimer l\'Ue')); 
    }   
  } 
 
  public async list(): Promise<Ues[]> { 
        try { 
      const response = await apiClient.get(`/api/Ue`); 
      return response.data; 
    } catch (error) { 
      throw new Error(ErrorMessage(error,'Impossible de récupérer les Ues')); 
    } 
  } 
  
}