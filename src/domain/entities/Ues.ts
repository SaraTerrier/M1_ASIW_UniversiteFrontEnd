import { Parcours } from './Parcours';

export interface IUE {

  Id: number | null;

  Intitule: string | null;

  NumeroUe: string | null;

  Parcours: Parcours[] | null;
  toJSON(): Object;

}

export class Ues implements IUE {

  constructor(

    public Id: number | null,

    public Intitule: string | null,

    public NumeroUe: string | null,

    public Parcours: Parcours[] | null

  ) { }



  toJSON(): Object {

    return {

      Id: this.Id,

      Intitule: this.Intitule,

      NumeroUe: this.NumeroUe,

      Parcours: this.Parcours?.map((parcours) => parcours.Id)

    };

  }

} 