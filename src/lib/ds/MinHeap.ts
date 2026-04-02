/**
 * Generic Min-Heap (Priority Queue)
 * Time: O(log n) insert/extract | O(1) peek | Space: O(n)
 */
export class MinHeap<T> {
  private heap: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  insert(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.sinkDown(0);
    return min;
  }

  peek(): T | undefined { return this.heap[0]; }
  size(): number { return this.heap.length; }
  isEmpty(): boolean { return this.heap.length === 0; }

  // Returns sorted copy without mutating — O(n log n)
  toSortedArray(): T[] {
    const copy = new MinHeap<T>(this.compare);
    copy.heap = [...this.heap];
    const result: T[] = [];
    while (!copy.isEmpty()) result.push(copy.extractMin()!);
    return result;
  }

  // Heapify from array — O(n)
  static fromArray<T>(arr: T[], compare: (a: T, b: T) => number): MinHeap<T> {
    const heap = new MinHeap<T>(compare);
    heap.heap = [...arr];
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      heap.sinkDown(i);
    }
    return heap;
  }

  // Update element in-place — O(n) find + O(log n) fix
  update(predicate: (item: T) => boolean, newItem: T): boolean {
    const idx = this.heap.findIndex(predicate);
    if (idx === -1) return false;
    this.heap[idx] = newItem;
    this.bubbleUp(idx);
    this.sinkDown(idx);
    return true;
  }

  remove(predicate: (item: T) => boolean): boolean {
    const idx = this.heap.findIndex(predicate);
    if (idx === -1) return false;
    const last = this.heap.pop()!;
    if (idx < this.heap.length) {
      this.heap[idx] = last;
      this.bubbleUp(idx);
      this.sinkDown(idx);
    }
    return true;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.heap[i], this.heap[parent]) < 0) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = (i << 1) + 1;
      const r = l + 1;
      if (l < n && this.compare(this.heap[l], this.heap[smallest]) < 0) smallest = l;
      if (r < n && this.compare(this.heap[r], this.heap[smallest]) < 0) smallest = r;
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      } else break;
    }
  }
}
