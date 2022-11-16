/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { StringManipulationService } from '@app/services/string-manipulation/string-manipulation.service';
import { BOARD_WORD_MARKER } from '@app/services/virtual-player/virtual-player.service';
import { WordValidationService } from '@app/services/word-validation/word-validation.service';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('string manipulation Service Test', () => {
    let stringManipulation: StringManipulationService;
    let mockDictionary: string[];

    const wordValidationMock = {
        inDictionary: (dictionaryId: string, word: string) => {
            return mockDictionary.includes(word);
        },
    };

    before(async () => {
        const wordValidationeMock = wordValidationMock as unknown as WordValidationService;
        stringManipulation = new StringManipulationService(wordValidationeMock);
        mockDictionary = ['a', 'b', 'ab', 'abeille'];
    });

    afterEach(async () => {
        sinon.restore();
    });

    it('permute() calls inDictionary', () => {
        const permutationArray: string[][] = [];
        const word = ['a', 'b'];
        stringManipulation.permute(word, permutationArray, DEFAULT_DICTIONARY_ID);
        expect(sinon.spy(wordValidationMock, 'inDictionary').calledTwice);
    });

    it('permute() returns permutations that are in the dictionary', () => {
        const permutationArray: string[][] = [];
        const word = ['a', 'b'];
        const expectedPermutations = [['a', 'b']];
        stringManipulation.permute(word, permutationArray, DEFAULT_DICTIONARY_ID);
        expect(permutationArray).to.be.eql(expectedPermutations);
    });

    it('permute() returns permutations', () => {
        const permutationArray: string[][] = [];
        const word = ['e', 'e', 'l', 'l'];
        const boardWords = ['ab`', '', 'i`'];
        const expected = [['ab`', 'e', 'i`', 'l', 'l', 'e']];
        stringManipulation.permute(word, permutationArray, DEFAULT_DICTIONARY_ID, boardWords);
        expect(permutationArray).to.eql(expected);
    });

    it('replaceBonus() returns a valid UpperCaseLetter', () => {
        const bonus = stringManipulation.replaceBonus();
        const isLetter = /[a-zA-Z]/.test(bonus);
        expect(isLetter).to.be.true;
    });
    it('splitString() returns a splitted string with the bonus replaced', () => {
        const word = 'a*';
        const expected: string[] = ['a', 'b*'];
        expect(stringManipulation.splitString(word, 'b')).to.be.eql(expected);
    });

    it('splitString() returns a splitted string', () => {
        const word = 'ab';
        const expected: string[] = ['a', 'b'];
        expect(stringManipulation.splitString(word, '')).to.be.eql(expected);
    });

    it('generateBoardCombinations() should return a copy of word if there is no boardWords', () => {
        const word = ['a', 'b'];
        const expected = [['a', 'b']];
        expect(stringManipulation.generateBoardCombinations([], word)).eql(expected);
    });

    it('generateBoardCombinations() should return a copy of word if boardWords starts with space', () => {
        const word = ['a', 'b'];
        const boardWords = ['', 'e'];
        const expected = [['a', 'b']];
        expect(stringManipulation.generateBoardCombinations(boardWords, word)).eql(expected);
    });

    it('generateBoardCombinations() should return an array of combinations with word and boardWords', () => {
        const word = ['a'];
        const firstWord = 'd' + BOARD_WORD_MARKER;
        const boardWords = [firstWord, '', '', 'e'];
        const expectedCombinations: string[][] = [
            [firstWord, 'a'],
            ['a', firstWord],
        ];
        expect(stringManipulation.generateBoardCombinations(boardWords, word)).eql(expectedCombinations);
    });

    it('generateBoardCombinations() should return an array of combinations with word and boardWords', () => {
        const word = ['a', 'b'];
        const firstWord = 'd' + BOARD_WORD_MARKER;
        const boardWords = [firstWord, '', 'e'];
        const expectedCombinations: string[][] = [
            [firstWord, 'a', 'e', 'b'],
            ['a', firstWord, 'b', 'e'],
            ['a', 'b', firstWord],
        ];
        expect(stringManipulation.generateBoardCombinations(boardWords, word)).eql(expectedCombinations);
    });

    it('generateCombinations() should return an array with the rignt number of combinations', () => {
        const word = 'ab';
        const expectedCombinations = ['a', 'ab', 'b'];
        expect(stringManipulation.generateCombinations(word)).to.be.eql(expectedCombinations);
    });

    it('generateCombinations() should return an array with the rignt number of combinations', () => {
        const word = 'aca';
        const expectedCombinations = ['a', 'ac', 'aca', 'c', 'ca'];
        expect(stringManipulation.generateCombinations(word)).to.be.eql(expectedCombinations);
    });

    it('generateCombinations() should return an array with the rignt number of combinations', () => {
        const word = 'abc';
        const expectedNbCombinations = 6;
        expect(stringManipulation.generateCombinations(word).length).to.be.eql(expectedNbCombinations);
    });

    it('joinstring() turns an array of strings to a string', () => {
        const word = ['a', 'b', 'c'];
        expect(stringManipulation.joinString(word)).to.be.eql('abc');
    });

    it('joinstring() turns an array to a string free of board markers and bonus letters markers ', () => {
        const word = ['a`', 'b', 'c*'];
        expect(stringManipulation['joinString'](word)).to.be.eql('abc');
    });
});
