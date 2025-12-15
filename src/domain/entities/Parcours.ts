export interface IParcours {
  Id: number | null;
  NomParcours: string | null;
  AnneeFormation: number | null;
}

export class Parcours implements IParcours {
  constructor(
    public Id: number | null,
    public NomParcours: string | null,
    public AnneeFormation: number | null
  ) {}
}