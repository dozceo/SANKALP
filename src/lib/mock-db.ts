
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'mock-db.json');

/**
 * Simple In-Memory Firestore Mock with File Persistence
 */

function serialize(data: any): any {
    if (!data) return data;
    if (data instanceof Date) {
        return { __type__: 'Date', value: data.toISOString() };
    }
    // Handle Mock Date Object (from previous read)
    if (data && typeof data === 'object' && typeof data.toDate === 'function') {
        try {
            return { __type__: 'Date', value: data.toDate().toISOString() };
        } catch (e) {
            // In case toDate fails or is not what we expect
        }
    }
    if (Array.isArray(data)) {
        return data.map(i => serialize(i));
    }
    if (typeof data === 'object') {
        const newData: any = {};
        for (const key in data) {
            newData[key] = serialize(data[key]);
        }
        return newData;
    }
    return data;
}

function deserialize(data: any): any {
    if (!data) return data;
    if (typeof data === 'object' && data.__type__ === 'Date') {
        const d = new Date(data.value);
        return {
            toDate: () => d,
            toMillis: () => d.getTime(),
            seconds: Math.floor(d.getTime() / 1000),
            nanoseconds: (d.getTime() % 1000) * 1000000,
        };
    }
    if (Array.isArray(data)) {
        return data.map(i => deserialize(i));
    }
    if (typeof data === 'object') {
        const newData: any = {};
        for (const key in data) {
            newData[key] = deserialize(data[key]);
        }
        return newData;
    }
    return data;
}

class MockDocumentReference {
  constructor(public path: string, private db: MockFirestore) {}

  async get() {
    // Reload data before read to ensure consistency across processes
    this.db.load();
    const rawData = this.db.data[this.path];
    const data = deserialize(rawData);

    return {
      exists: !!rawData,
      data: () => data,
      id: this.path.split('/').pop(),
    };
  }

  async set(data: any) {
    this.db.load();
    this.db.data[this.path] = serialize(data);
    this.db.save();
    return { writeTime: new Date() };
  }

  async update(data: any) {
    this.db.load();
    const existing = this.db.data[this.path] || {};
    // Merge only top level? Firestore update merges.
    // We need to deserialize existing, merge, then serialize back?
    // Or just merge serialized structure?
    // Deep merge is safer if structure is simple.
    // For simplicity, we assume shallow merge of top keys.
    const serializedData = serialize(data);
    this.db.data[this.path] = { ...existing, ...serializedData };
    this.db.save();
    return { writeTime: new Date() };
  }

  async delete() {
    this.db.load();
    delete this.db.data[this.path];
    this.db.save();
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
    this.db.load();
    // Return all docs in this collection
    const docs = Object.keys(this.db.data)
      .filter(key => key.startsWith(this.path + '/') && key.split('/').length === this.path.split('/').length + 1)
      .map(key => ({
        id: key.split('/').pop(),
        data: () => deserialize(this.db.data[key]),
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
    limit() { return this; }

    async get() {
        this.db.load();
        // Filter docs
        let docs = Object.keys(this.db.data)
          .filter(key => key.startsWith(this.path + '/') && key.split('/').length === this.path.split('/').length + 1)
          .map(key => ({
             id: key.split('/').pop(),
             data: deserialize(this.db.data[key])
          }));

        for (const filter of this.filters) {
            docs = docs.filter(d => {
                const val = d.data[filter.field];
                // Handle deserialized dates comparison?
                // If val is object with toDate(), and filter.value is Date...
                // MockQuery logic needs to be smart.
                // But typically we filter by primitives (string, number).
                // If filtering by date, Firestore expects Date object.
                // d.data[field] is { toDate: ... }
                // So comparison fails.

                // Fix: if val has toDate, use it for comparison?
                let actualVal = val;
                if (val && typeof val === 'object' && val.toDate) {
                    actualVal = val.toDate();
                }

                if (filter.op === '==') {
                    if (actualVal instanceof Date && filter.value instanceof Date) {
                        return actualVal.getTime() === filter.value.getTime();
                    }
                    return actualVal === filter.value;
                }
                if (filter.op === '>=') return actualVal >= filter.value;
                if (filter.op === '<=') return actualVal <= filter.value;
                if (filter.op === '>') return actualVal > filter.value;
                if (filter.op === '<') return actualVal < filter.value;
                if (filter.op === 'array-contains') return Array.isArray(actualVal) && actualVal.includes(filter.value);

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

  constructor() {
      this.load();
  }

  load() {
      if (fs.existsSync(DB_FILE)) {
          try {
              const content = fs.readFileSync(DB_FILE, 'utf-8');
              this.data = JSON.parse(content);
          } catch (e) {
              // Ignore read errors (e.g. invalid json)
              this.data = {};
          }
      }
  }

  save() {
      try {
          fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
      } catch (e) {
          console.error('Failed to save mock DB:', e);
      }
  }

  collection(path: string) {
    return new MockCollectionReference(path, this);
  }

  doc(path: string) {
      return new MockDocumentReference(path, this);
  }

  async runTransaction(updateFunction: (t: any) => Promise<any>) {
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
