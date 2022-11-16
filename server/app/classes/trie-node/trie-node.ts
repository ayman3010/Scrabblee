// This code was largely inspired by the code that can be found here: https://github.com/Daut/trie-js

export class TrieNode {
    isValidWord: boolean;
    character: string;
    children: Map<string, TrieNode>;

    constructor(key: string) {
        this.isValidWord = false;
        this.character = key;
        this.children = new Map<string, TrieNode>();
    }
}
