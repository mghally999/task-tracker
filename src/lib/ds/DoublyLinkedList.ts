/**
 * Doubly Linked List with ID-indexed node map
 * Time: O(1) insert/delete/update by ID | Space: O(n)
 */
export class DLLNode<T> {
  constructor(
    public data: T,
    public prev: DLLNode<T> | null = null,
    public next: DLLNode<T> | null = null
  ) {}
}

export class DoublyLinkedList<T> {
  private head: DLLNode<T> | null = null;
  private tail: DLLNode<T> | null = null;
  private nodeMap: Map<string, DLLNode<T>> = new Map(); // O(1) access
  private _size = 0;

  constructor(private getId: (item: T) => string) {}

  // O(1) - prepend to front (most recent first)
  prepend(data: T): DLLNode<T> {
    const node = new DLLNode(data, null, this.head);
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.nodeMap.set(this.getId(data), node);
    this._size++;
    return node;
  }

  // O(1) - append to back
  append(data: T): DLLNode<T> {
    const node = new DLLNode(data, this.tail, null);
    if (this.tail) this.tail.next = node;
    this.tail = node;
    if (!this.head) this.head = node;
    this.nodeMap.set(this.getId(data), node);
    this._size++;
    return node;
  }

  // O(1) - delete by ID
  delete(id: string): boolean {
    const node = this.nodeMap.get(id);
    if (!node) return false;
    if (node.prev) node.prev.next = node.next; else this.head = node.next;
    if (node.next) node.next.prev = node.prev; else this.tail = node.prev;
    this.nodeMap.delete(id);
    this._size--;
    return true;
  }

  // O(1) - update by ID
  update(id: string, data: T): boolean {
    const node = this.nodeMap.get(id);
    if (!node) return false;
    node.data = data;
    return true;
  }

  // O(1) - get by ID
  get(id: string): T | undefined {
    return this.nodeMap.get(id)?.data;
  }

  has(id: string): boolean { return this.nodeMap.has(id); }

  // O(n) - to array (preserves order)
  toArray(): T[] {
    const result: T[] = [];
    let node = this.head;
    while (node) { result.push(node.data); node = node.next; }
    return result;
  }

  // O(n) - iterate with callback
  forEach(cb: (item: T, idx: number) => void): void {
    let node = this.head;
    let idx = 0;
    while (node) { cb(node.data, idx++); node = node.next; }
  }

  // O(n) - filter
  filter(pred: (item: T) => boolean): T[] {
    const result: T[] = [];
    let node = this.head;
    while (node) { if (pred(node.data)) result.push(node.data); node = node.next; }
    return result;
  }

  get size(): number { return this._size; }
  isEmpty(): boolean { return this._size === 0; }
  clear(): void { this.head = null; this.tail = null; this.nodeMap.clear(); this._size = 0; }
}
