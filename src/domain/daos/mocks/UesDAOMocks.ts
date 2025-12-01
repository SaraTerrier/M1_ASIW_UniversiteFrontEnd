import { Ues } from '@/domain/entities/Ues';

export class UesDAOMocks {
    private static instance: UesDAOMocks | null = null;
    private data: Ues[] = [];
    private nextId = 1;

    private constructor() {
        // données fictives initiales
        this.data = [
            new Ues(this.nextId++, '245896' , 'Informatique', [1], [15,16,14]),
            new Ues(this.nextId++,'5464853', 'Compétence transverse', [2], [12,14,13]),
        ];
    }

    public static getInstance(): UesDAOMocks {
        if (!UesDAOMocks.instance) {
            UesDAOMocks.instance = new UesDAOMocks();
        }
        return UesDAOMocks.instance;
    }

    public create(ues: Ues): Promise<Ues> {
        return new Promise((resolve) => {
            const copy = new Ues(this.nextId++, ues.NumeroUe ?? '', ues.Intitule ?? '', ues.EnseigneeDans ?? null, ues.Notes ?? null);
            copy.ID = copy.ID ?? (this.nextId - 1);
            this.data.push(copy);
            // simulate async
            setTimeout(() => resolve(copy), 200);
        });
    }

    public update(ues: Ues): Promise<Ues> {
        return new Promise((resolve, reject) => {
            const idx = this.data.findIndex(p => p.ID === ues.ID);
            if (idx === -1) return reject(new Error('Ues non trouvé'));
            this.data[idx] = { ...ues };
            setTimeout(() => resolve(this.data[idx]), 200);
        });
    }

    public delete(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const idx = this.data.findIndex(p => p.ID === id);
            if (idx === -1) return reject(new Error('Ues non trouvé'));
            this.data.splice(idx, 1);
            setTimeout(() => resolve(), 200);
        });
    }

    public list(): Promise<Ues[]> {
        return Promise.resolve([...this.data]);
    }

    public findById(id: number | null): Promise<Ues | null> {
        if (id === null) return Promise.resolve(null);
        const p = this.data.find(d => d.ID === id) ?? null;
        return Promise.resolve(p ? { ...p } : null);
    }
}