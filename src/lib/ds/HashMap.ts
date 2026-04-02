/**
 * Custom HashMap with separate chaining & dynamic resizing
 * Time: O(1) avg get/set/delete | Space: O(n)
 */
class HashNode<V> {
  constructor(
    public key: string,
    public value: V,
    public next: HashNode<V> | null = null
  ) {}
}

export class HashMap<V> {
  private buckets: Array<HashNode<V> | null>;
  private capacity: number;
  private _size: number = 0;
  private readonly LOAD_FACTOR = 0.75;
  private readonly SHRINK_FACTOR = 0.25;

  constructor(initialCapacity = 16) {
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity).fill(null);
  }

  private hash(key: string): number {
    // FNV-1a inspired hash for better distribution
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    return hash % this.capacity;
  }

  set(key: string, value: V): this {
    if (this._size / this.capacity > this.LOAD_FACTOR) this.resize(this.capacity * 2);
    const idx = this.hash(key);
    let node = this.buckets[idx];
    while (node) {
      if (node.key === key) { node.value = value; return this; }
      node = node.next;
    }
    this.buckets[idx] = new HashNode(key, value, this.buckets[idx]);
    this._size++;
    return this;
  }

  get(key: string): V | undefined {
    const idx = this.hash(key);
    let node = this.buckets[idx];
    while (node) {
      if (node.key === key) return node.value;
      node = node.next;
    }
    return undefined;
  }

  has(key: string): boolean { return this.get(key) !== undefined; }

  delete(key: string): boolean {
    const idx = this.hash(key);
    let node = this.buckets[idx];
    let prev: HashNode<V> | null = null;
    while (node) {
      if (node.key === key) {
        if (prev) prev.next = node.next;
        else this.buckets[idx] = node.next;
        this._size--;
        if (this.capacity > 16 && this._size / this.capacity < this.SHRINK_FACTOR) {
          this.resize(Math.max(16, Math.floor(this.capacity / 2)));
        }
        return true;
      }
      prev = node; node = node.next;
    }
    return false;
  }

  values(): V[] {
    const result: V[] = [];
    for (const bucket of this.buckets) {
      let node = bucket;
      while (node) { result.push(node.value); node = node.next; }
    }
    return result;
  }

  entries(): [string, V][] {
    const result: [string, V][] = [];
    for (const bucket of this.buckets) {
      let node = bucket;
      while (node) { result.push([node.key, node.value]); node = node.next; }
    }
    return result;
  }

  keys(): string[] { return this.entries().map(([k]) => k); }

  get size(): number { return this._size; }

  clear(): void {
    this.buckets = new Array(16).fill(null);
    this.capacity = 16;
    this._size = 0;
  }

  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.buckets = new Array(this.capacity).fill(null);
    this._size = 0;
    for (const bucket of oldBuckets) {
      let node = bucket;
      while (node) { this.set(node.key, node.value); node = node.next; }
    }
  }
}
