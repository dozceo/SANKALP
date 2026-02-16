
/**
 * Simple In-Memory Firestore Mock
 */

class MockDocumentReference {
  constructor(public path: string, private db: MockFirestore) {}

  async get() {
    const data = this.db.data[this.path];
    return {
      exists: !!data,
      data: () => data,
      id: this.path.split('/').pop(),
    };
  }

  private convertDates(data: any): any {
     if (!data) return data;
     if (data instanceof Date) {
         return {
             toDate: () => data,
             toMillis: () => data.getTime(),
             seconds: Math.floor(data.getTime() / 1000),
             nanoseconds: (data.getTime() % 1000) * 1000000,
         };
     }
     if (Array.isArray(data)) {
         return data.map(i => this.convertDates(i));
     }
     if (typeof data === 'object') {
         const newData: any = {};
         for (const key in data) {
             newData[key] = this.convertDates(data[key]);
         }
         return newData;
     }
     return data;
  }

  async set(data: any) {
    this.db.data[this.path] = this.convertDates(data);
    return { writeTime: new Date() };
  }

  async update(data: any) {
    const existing = this.db.data[this.path] || {};
    this.db.data[this.path] = { ...existing, ...this.convertDates(data) };
    return { writeTime: new Date() };
  }

  async delete() {
    delete this.db.data[this.path];
    return { writeTime: new Date() };
  }
}

class MockQuerySnapshot {
  constructor(public docs: any[]) {}

  get empty() { return this.docs.length === 0; }
  get size() { return this.docs.length; }

  forEach(callback: (doc: any) => void) {
    this.docs.forEach(callback);
  }
}

class MockCollectionReference {
  constructor(public path: string, private db: MockFirestore) {}

  doc(id?: string) {
    const docId = id || `mock_id_${Math.random().toString(36).substr(2, 9)}`;
    return new MockDocumentReference(`${this.path}/${docId}`, this.db);
  }

  async get() {
    // Return all docs in this collection
    const docs = Object.keys(this.db.data)
      .filter(key => key.startsWith(this.path + '/') && key.split('/').length === this.path.split('/').length + 1)
      .map(key => ({
        id: key.split('/').pop(),
        data: () => this.db.data[key],
      }));
    return new MockQuerySnapshot(docs);
  }

  async add(data: any) {
    const doc = this.doc();
    await doc.set(data);
    return doc;
  }

  where(field: string, op: string, value: any) {
      // Return a query that filters
      return new MockQuery(this.path, this.db, [{field, op, value}]);
  }

  orderBy() { return this; }
  limit() { return this; }
}

class MockQuery {
    constructor(public path: string, private db: MockFirestore, public filters: any[]) {}

    where(field: string, op: string, value: any) {
        this.filters.push({field, op, value});
        return this;
    }

    orderBy() { return this; }
    limit() { return this; } // Mock ignores limit for simplicity

    async get() {
        // Filter docs
        let docs = Object.keys(this.db.data)
          .filter(key => key.startsWith(this.path + '/') && key.split('/').length === this.path.split('/').length + 1)
          .map(key => ({
             id: key.split('/').pop(),
             data: this.db.data[key]
          }));

        for (const filter of this.filters) {
            docs = docs.filter(d => {
                const val = d.data[filter.field];
                if (filter.op === '==') return val === filter.value;
                if (filter.op === '>=') return val >= filter.value;
                // ...
                return true;
            });
        }

        return new MockQuerySnapshot(docs.map(d => ({
            id: d.id,
            data: () => d.data,
            exists: true
        })));
    }
}

export class MockFirestore {
  public data: Record<string, any> = {};

  collection(path: string) {
    return new MockCollectionReference(path, this);
  }

  doc(path: string) {
      return new MockDocumentReference(path, this);
  }

  async runTransaction(updateFunction: (t: any) => Promise<any>) {
      // Simple mock transaction: just run the function with a transaction object
      // that delegates to direct DB calls (no real isolation)
      const t = {
          get: (ref: any) => ref.get(),
          set: (ref: any, data: any) => ref.set(data),
          update: (ref: any, data: any) => ref.update(data),
          delete: (ref: any) => ref.delete(),
      };
      return updateFunction(t);
  }

  batch() {
      return {
          set: (ref: any, data: any) => ref.set(data),
          update: (ref: any, data: any) => ref.update(data),
          delete: (ref: any) => ref.delete(),
          commit: async () => {},
      }
  }
}
