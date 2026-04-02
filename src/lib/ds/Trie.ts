/**
 * Trie (Prefix Tree) for fast search & autocomplete
 * Time: O(k) insert/search where k = query length | Space: O(ALPHABET * n * k)
 */
class TrieNode {
  children = new Map<string, TrieNode>();
  taskIds = new Set<string>();
  isEnd = false;
}

export class Trie {
  private root = new TrieNode();

  // O(k) - insert word linked to a task ID
  insert(word: string, taskId: string): void {
    if (!word || word.length < 2) return;
    const lower = word.toLowerCase();
    let node = this.root;
    for (const char of lower) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode());
      node = node.children.get(char)!;
      node.taskIds.add(taskId);
    }
    node.isEnd = true;
  }

  // O(k) - remove word for task ID
  delete(word: string, taskId: string): void {
    if (!word || word.length < 2) return;
    const lower = word.toLowerCase();
    let node = this.root;
    for (const char of lower) {
      if (!node.children.has(char)) return;
      node = node.children.get(char)!;
      node.taskIds.delete(taskId);
    }
  }

  // O(k) - get all task IDs matching prefix
  search(prefix: string): Set<string> {
    if (!prefix || prefix.length < 1) return new Set();
    const lower = prefix.toLowerCase().trim();
    let node = this.root;
    for (const char of lower) {
      if (!node.children.has(char)) return new Set();
      node = node.children.get(char)!;
    }
    return new Set(node.taskIds);
  }

  // O(k*w) - search multiple words, return intersection for AND logic
  searchMultiple(query: string): Set<string> {
    const words = query.trim().split(/\s+/).filter(w => w.length >= 2);
    if (words.length === 0) return new Set();
    
    const sets = words.map(w => this.search(w));
    if (sets.length === 1) return sets[0];

    // Intersection of all sets (AND logic)
    let result = sets[0];
    for (let i = 1; i < sets.length; i++) {
      const intersection = new Set<string>();
      for (const id of result) {
        if (sets[i].has(id)) intersection.add(id);
      }
      result = intersection;
    }
    return result;
  }

  // Insert all searchable fields for a task
  indexTask(task: { id: string; name: string; owner: string; notes: string; category: string }): void {
    const text = `${task.name} ${task.owner} ${task.notes} ${task.category}`;
    const words = text.split(/\s+/).filter(w => w.length >= 2);
    for (const word of words) this.insert(word.replace(/[^a-z0-9]/gi, ''), task.id);
  }

  // Remove all searchable fields for a task
  deindexTask(task: { id: string; name: string; owner: string; notes: string; category: string }): void {
    const text = `${task.name} ${task.owner} ${task.notes} ${task.category}`;
    const words = text.split(/\s+/).filter(w => w.length >= 2);
    for (const word of words) this.delete(word.replace(/[^a-z0-9]/gi, ''), task.id);
  }
}
