import { Parcours } from '@/domain/entities/Parcours';

export class ParcoursDAOMock {
    private static instance: ParcoursDAOMock | null = null;
    private data: Parcours[] = [];
    private nextId = 1;

    private constructor() {
        // données fictives initiales
        this.data = [
            new Parcours(this.nextId++, 'Licence Informatique', 2023),
            new Parcours(this.nextId++, 'Master MIAGE', 2024),
        ];
    }

    public static getInstance(): ParcoursDAOMock {
        if (!ParcoursDAOMock.instance) {
            ParcoursDAOMock.instance = new ParcoursDAOMock();
        }
        return ParcoursDAOMock.instance;
    }

    public create(parcours: Parcours): Promise<Parcours> {
        return new Promise((resolve) => {
            const copy = new Parcours(this.nextId++, parcours.NomParcours ?? '', parcours.AnneeFormation ?? null);
            copy.ID = copy.ID ?? (this.nextId - 1);
            this.data.push(copy);
            // simulate async
            setTimeout(() => resolve(copy), 200);
        });
    }

    public update(parcours: Parcours): Promise<Parcours> {
        return new Promise((resolve, reject) => {
            const idx = this.data.findIndex(p => p.ID === parcours.ID);
            if (idx === -1) return reject(new Error('Parcours non trouvé'));
            this.data[idx] = { ...parcours };
            setTimeout(() => resolve(this.data[idx]), 200);
        });
    }

    public delete(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const idx = this.data.findIndex(p => p.ID === id);
            if (idx === -1) return reject(new Error('Parcours non trouvé'));
            this.data.splice(idx, 1);
            setTimeout(() => resolve(), 200);
        });
    }

    public list(): Promise<Parcours[]> {
        return Promise.resolve([...this.data]);
    }

    public findById(id: number | null): Promise<Parcours | null> {
        if (id === null) return Promise.resolve(null);
        const p = this.data.find(d => d.ID === id) ?? null;
        return Promise.resolve(p ? { ...p } : null);
    }
}