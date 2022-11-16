/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { TrieNode } from '@app/classes/trie-node/trie-node';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { Trie } from './trie';

describe('Trie Tests', () => {
    let trie: Trie;

    beforeEach(() => {
        trie = new Trie();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create with a valid root that is a TrieNode with an empty string as a character', () => {
        expect(trie['root'].character).to.equal('');
    });

    it('insert() should insert the word properly in the Trie and increment the wordCount', () => {
        const initialWordCount = trie.wordCount;

        trie.insert('trie');

        const firstLetterNode = trie['root'].children.get('t');
        const secondLetterNode = firstLetterNode?.children.get('r');
        const thirdLetterNode = secondLetterNode?.children.get('i');
        const fourthLetterNode = thirdLetterNode?.children.get('e');

        expect(initialWordCount).to.equal(0);
        expect(trie.wordCount).to.equal(1);
        expect(firstLetterNode?.character).to.equal('t');
        expect(firstLetterNode?.isValidWord).to.equal(false);
        expect(secondLetterNode?.character).to.equal('r');
        expect(secondLetterNode?.isValidWord).to.equal(false);
        expect(thirdLetterNode?.character).to.equal('i');
        expect(thirdLetterNode?.isValidWord).to.equal(false);
        expect(fourthLetterNode?.character).to.equal('e');
        expect(fourthLetterNode?.isValidWord).to.equal(true);
    });

    it('insert() should insert the word properly in the Trie, without being case-sensitive', () => {
        trie.insert('tRiE');

        const firstLetterNode = trie['root'].children.get('t');
        const secondLetterNode = firstLetterNode?.children.get('r');
        const thirdLetterNode = secondLetterNode?.children.get('i');
        const fourthLetterNode = thirdLetterNode?.children.get('e');

        expect(firstLetterNode?.character).to.equal('t');
        expect(firstLetterNode?.isValidWord).to.equal(false);
        expect(secondLetterNode?.character).to.equal('r');
        expect(secondLetterNode?.isValidWord).to.equal(false);
        expect(thirdLetterNode?.character).to.equal('i');
        expect(thirdLetterNode?.isValidWord).to.equal(false);
        expect(fourthLetterNode?.character).to.equal('e');
        expect(fourthLetterNode?.isValidWord).to.equal(true);
    });

    it("insert() should insert the word properly in the Trie, even when there's already another word that's in the trie", () => {
        trie.insert('trie');
        trie.insert('tried');

        const firstLetterNode = trie['root'].children.get('t');
        const secondLetterNode = firstLetterNode?.children.get('r');
        const thirdLetterNode = secondLetterNode?.children.get('i');
        const fourthLetterNode = thirdLetterNode?.children.get('e');
        const fifthLetterNode = fourthLetterNode?.children.get('d');

        expect(firstLetterNode?.character).to.equal('t');
        expect(firstLetterNode?.isValidWord).to.equal(false);
        expect(secondLetterNode?.character).to.equal('r');
        expect(secondLetterNode?.isValidWord).to.equal(false);
        expect(thirdLetterNode?.character).to.equal('i');
        expect(thirdLetterNode?.isValidWord).to.equal(false);
        expect(fourthLetterNode?.character).to.equal('e');
        expect(fourthLetterNode?.isValidWord).to.equal(true);
        expect(fifthLetterNode?.character).to.equal('d');
        expect(fifthLetterNode?.isValidWord).to.equal(true);
    });

    it('search() should call getNode() and return false if the word is not in the trie', () => {
        const getNodeStub = sinon.stub(trie as any, 'getNode').returns(undefined);

        const result = trie.search('trie');

        expect(result).to.equal(false);
        expect(getNodeStub.called).to.equal(true);
    });

    it('search() should call getNode() and return false if the word is contained in the trie, but its final \
node has isValidWord set to false', () => {
        const getNodeStub = sinon.stub(trie as any, 'getNode').returns(new TrieNode('e'));

        const result = trie.search('trie');

        expect(result).to.equal(false);
        expect(getNodeStub.called).to.equal(true);
    });

    it('search() should call getNode() and return true if the word is contained in the trie and its final \
node has isValidWord set to true', () => {
        const finalNode = new TrieNode('e');
        finalNode.isValidWord = true;
        const getNodeStub = sinon.stub(trie as any, 'getNode').returns(finalNode);

        const result = trie.search('trie');

        expect(result).to.equal(true);
        expect(getNodeStub.called).to.equal(true);
    });

    it('getNode() should return undefined if the word is not contained in the trie', () => {
        expect(trie['getNode']('trie')).to.equal(undefined);
    });

    it('getNode() should return the node corresponding to the last letter of a word if it is contained in the trie', () => {
        const fourthLetterNode = new TrieNode('e');
        const thirdLetterNode = new TrieNode('i');
        thirdLetterNode.children.set('e', fourthLetterNode);
        const secondLetterNode = new TrieNode('r');
        secondLetterNode.children.set('i', thirdLetterNode);
        const firstLetterNode = new TrieNode('t');
        firstLetterNode.children.set('r', secondLetterNode);
        trie['root'].children.set('t', firstLetterNode);

        expect(trie['getNode']('trie')).to.equal(fourthLetterNode);
    });

    it('getNode() should return the node corresponding to the last letter of a word if it is contained in the trie while \
being case-insensitive', () => {
        const fourthLetterNode = new TrieNode('e');
        const thirdLetterNode = new TrieNode('i');
        thirdLetterNode.children.set('e', fourthLetterNode);
        const secondLetterNode = new TrieNode('r');
        secondLetterNode.children.set('i', thirdLetterNode);
        const firstLetterNode = new TrieNode('t');
        firstLetterNode.children.set('r', secondLetterNode);
        trie['root'].children.set('t', firstLetterNode);

        expect(trie['getNode']('tRiE')).to.equal(fourthLetterNode);
    });
});
