
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
    // Handle Firestore FieldValue.serverTimestamp() (basic check)
    if (typeof data === 'object' && (data.methodName === 'FieldValue.serverTimestamp' || data._methodName === 'serverTimestamp')) {
         return { __type__: 'Date', value: new Date().toISOString() };
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
            toISOString: () => d.toISOString(),
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

export class MockDocumentReference {
  constructor(public path: string, private db: MockFirestore) {}

  get id() {
      return this.path.split('/').pop() || '';
  }

  async get() {
    // Reload data before read to ensure consistency across processes
    this.db.load();
    const rawData = this.db.data[this.path];
    const data = deserialize(rawData);

    return {
      exists: !!rawData,
      data: () => data,
      id: this.id,
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
    const existingRaw = this.db.data[this.path];

    if (!existingRaw) {
        throw new Error(`Document ${this.path} does not exist for update`);
    }

    const existing = deserialize(existingRaw);
    // Shallow merge for now as per previous implementation logic
    // But we need to handle "FieldValue.delete()" etc in a real impl.
    // Here we just merge.
    const merged = { ...existing, ...data };

    this.db.data[this.path] = serialize(merged);
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

export class MockQuerySnapshot {
  constructor(public docs: any[]) {}

  get empty() { return this.docs.length === 0; }
  get size() { return this.docs.length; }

  forEach(callback: (doc: any) => void) {
    this.docs.forEach(callback);
  }

  map(callback: (doc: any) => any) {
      return this.docs.map(callback);
  }
}

export class MockQuery {
    constructor(public path: string, private db: MockFirestore, public filters: any[] = []) {}

    where(field: string, op: string, value: any) {
        // Return a new query with added filter
        return new MockQuery(this.path, this.db, [...this.filters, {field, op, value}]);
    }

    orderBy() { return this; }
    limit() { return this; }
    select() { return this; }

    async get() {
        this.db.load();
        // Filter docs
        let docs = Object.keys(this.db.data)
          .filter(key => {
              // Check if key is a direct child of path
              // e.g. path="users", key="users/123" -> yes
              // key="users/123/posts/456" -> no
              if (!key.startsWith(this.path + '/')) return false;
              const relative = key.slice(this.path.length + 1);
              return !relative.includes('/');
          })
          .map(key => ({
             id: key.split('/').pop(),
             data: deserialize(this.db.data[key])
          }));

        for (const filter of this.filters) {
            docs = docs.filter(d => {
                const val = d.data[filter.field];

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
                if (filter.op === 'in') return Array.isArray(filter.value) && filter.value.includes(actualVal);
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

export class MockCollectionReference {
  constructor(public path: string, private db: MockFirestore) {}

  doc(id?: string) {
    const docId = id || `mock_id_${Math.random().toString(36).substr(2, 9)}`;
    return new MockDocumentReference(`${this.path}/${docId}`, this.db);
  }

  async get() {
      return new MockQuery(this.path, this.db).get();
  }

  async add(data: any) {
    const doc = this.doc();
    await doc.set(data);
    return doc;
  }

  where(field: string, op: string, value: any) {
      return new MockQuery(this.path, this.db).where(field, op, value);
  }

  orderBy() { return new MockQuery(this.path, this.db); }
  limit() { return new MockQuery(this.path, this.db); }
  select() { return new MockQuery(this.path, this.db); }
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
      const operations: (() => Promise<any>)[] = [];
      return {
          set: (ref: any, data: any) => {
              operations.push(() => ref.set(data));
              return this;
          },
          update: (ref: any, data: any) => {
              operations.push(() => ref.update(data));
              return this;
          },
          delete: (ref: any) => {
              operations.push(() => ref.delete());
              return this;
          },
          commit: async () => {
              for (const op of operations) {
                  await op();
              }
          },
      }
  }
}
