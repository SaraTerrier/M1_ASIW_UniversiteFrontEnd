import { Note } from '@/domain/entities/Note';
import type { IDAO } from './IDAO';
import apiClient from '../config/axiosConfig';
import { ErrorMessage } from '../utils/ErrorMessage';

export class NoteDAO implements IDAO<Note> {
  private static instance: NoteDAO;

  private constructor() {}

  public static getInstance(): NoteDAO {
    if (!NoteDAO.instance) {
      NoteDAO.instance = new NoteDAO();
    }
    return NoteDAO.instance;
  }

  public async create(data: Note): Promise<Note> {
    try {
      const response = await apiClient.post(`/api/Note`, data.toJSON());
      return response.data;
    } catch (error) {
      throw new Error(ErrorMessage(error, 'Impossible de créer la note'));
    }
  }

  public async get(id: number): Promise<Note> {
    try {
      const response = await apiClient.get(`/api/Note/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(ErrorMessage(error, 'Impossible de récupérer la note'));
    }
  }

  public async update(id: number, data: Note): Promise<Note> {
    try {
      const response = await apiClient.put(`/api/Note/${id}`, data.toJSON());
      return response.data;
    } catch (error) {
      throw new Error(ErrorMessage(error, 'Impossible de mettre à jour la note'));
    }
  }

  // Mettre à jour une note par étudiant et UE
  public async updateByEtudiantAndUe(idEtudiant: number, idUe: number, valeur: number): Promise<Note> {
    try {
      const noteData = { IdEtudiant: idEtudiant, IdUe: idUe, Valeur: valeur };
      const response = await apiClient.put(`/api/Note/etudiant/${idEtudiant}/ue/${idUe}`, noteData);
      return response.data;
    } catch (error) {
      throw new Error(ErrorMessage(error, 'Impossible de mettre à jour la note'));
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/Note/${id}`);
    } catch (error) {
      throw new Error(ErrorMessage(error, 'Impossible de supprimer la note'));
    }
  }

  // Supprimer une note par étudiant et UE
  public async deleteByEtudiantAndUe(idEtudiant: number, idUe: number): Promise<void> {
    try {
      await apiClient.delete(`/api/Note/etudiant/${idEtudiant}/ue/${idUe}`);
    } catch (error) {
      throw new Error(ErrorMessage(error, 'Impossible de supprimer la note'));
    }
  }

  public async list(): Promise<Note[]> {
    try {
      const response = await apiClient.get(`/api/Note`);
      return response.data;
    } catch (error) {
      throw new Error(ErrorMessage(error, 'Impossible de récupérer les notes'));
    }
  }

  // Récupérer la note d'un étudiant pour une UE spécifique
  public async getNoteByEtudiantAndUe(idEtudiant: number, idUe: number): Promise<Note | null> {
    try {
      const response = await apiClient.get(`/api/Note/etudiant/${idEtudiant}/ue/${idUe}`);
      // L'API retourne un tableau, on récupère le premier élément
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      return data || null;
    } catch (error) {
      // Si la note n'existe pas, retourner null au lieu de lever une erreur
      return null;
    }
  }
}
