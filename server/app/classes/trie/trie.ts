import { TrieNode } from '@app/classes/trie-node/trie-node';

export interface TrieInterface {
    wordCount: number;
}

// This code was largely inspired by the code that can be found here: https://github.com/Daut/trie-js

export class Trie implements TrieInterface {
    wordCount: number;
    private root: TrieNode;

    constructor() {
        this.wordCount = 0;
        this.root = new TrieNode('');
    }

    /**
     * Insert a word in the Trie.
     *
     * @param word `string` - The word to insert. Not case-sensitive.
     */
    insert(word: string): void {
        word = word.toLowerCase();
        let children = this.root.children;
        let level = 0;

        for (const letter of word) {
            let node = children.get(letter);
            if (!node) {
                node = new TrieNode(letter);
                children.set(letter, node);
            }

            children = node.children;

            if (level++ === word.length - 1) {
                node.isValidWord = true;
                this.wordCount++;
            }
        }
    }

    /**
     * Search to see if a word is contained in the Trie.
     *
     * @param word `string` - The word to search in the Trie. Not case-sensitive.
     * @returns `boolean` - Whether the word is contained in the Trie or not.
     */
    search(word: string): boolean {
        const node = this.getNode(word);
        return !!node?.isValidWord;
    }

    /**
     * Get the final TrieNode of a word in a Trie, returns undefined if the word is not contained in the Trie.
     *
     * @param word `string` - The word to find in the Trie. Not case-sensitive.
     * @returns `TrieNode | undefined` - The TrieNode that marks the end of the searched word, if the word is contained in the Trie,
     * and undefined if it was not found in the Trie.
     */
    private getNode(word: string): TrieNode | undefined {
        word = word.toLowerCase();
        let node;
        let currentNodeChildren = this.root.children;

        for (const letter of word) {
            node = currentNodeChildren.get(letter);
            if (!node) return node;
            currentNodeChildren = node.children;
        }

        return node;
    }
}
