import { Parcours } from './Parcours';

export interface IETUDIANT {

  Id: number | null;
  Nom: string | null;
  Prenom: string | null;
  NumEtud: string | null;
  Email: string | null;
  ParcoursSuivi: Parcours | null;
  toJSON(): Object;

}

export class Etudiants implements IETUDIANT {

  constructor(

    public Id: number | null,
    public Nom: string | null,
    public Prenom: string | null,
    public NumEtud: string | null,
    public Email: string | null,

    public  ParcoursSuivi: Parcours | null

  ) { }



  toJSON(): Object {

    return {

      Id: this.Id,
      Nom: this.Nom,
      Prenom: this.Prenom,
      NumEtud: this.NumEtud,
      Email: this.Email,
      ParcoursSuivi: this.ParcoursSuivi ? this.ParcoursSuivi.Id : null

    };

  }

} 