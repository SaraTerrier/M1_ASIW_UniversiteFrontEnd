export interface IUes {
  ID: number | null;
  NumeroUe: string | null;
  Intitule: string | null;
  EnseigneeDans?: number[] | null;
}
export class Ues implements IUes {
  constructor(
    public ID: number | null,
    public NumeroUe: string | null,
    public Intitule: string | null,
    public EnseigneeDans?: number[] | null,
  ) {}
}