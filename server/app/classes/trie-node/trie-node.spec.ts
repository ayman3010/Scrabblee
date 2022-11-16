import { expect } from 'chai';
import { describe } from 'mocha';
import { TrieNode } from './trie-node';

describe('TrieNode Tests', () => {
    it('should be initialized with the given key, set to have isValidWord set to false and it should have an initialized children attribute', () => {
        const node = new TrieNode('a');
        expect(node.character).to.equal('a');
        expect(node.isValidWord).to.equal(false);
        expect(node.children.size).to.equal(0);
    });
});
