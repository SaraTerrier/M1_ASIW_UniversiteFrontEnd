export interface INote {
  Id: number | null;
  Valeur: number | null;
  IdEtudiant: number | null;
  IdUe: number | null;
  toJSON(): Object;
}

export class Note implements INote {
  constructor(
    public Id: number | null,
    public Valeur: number | null,
    public IdEtudiant: number | null,
    public IdUe: number | null,
  ) {}

  toJSON(): Object {
    return {
      id: this.Id,
      valeur: this.Valeur,
      etudiantId: this.IdEtudiant,
      ueId: this.IdUe
    };
  }
}
