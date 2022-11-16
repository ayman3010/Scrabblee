/* eslint-disable @typescript-eslint/no-explicit-any */
import { NO_LETTER } from '@app/classes/constants/board-constant';
import { BONUS_LETTER, BONUS_LETTER_INDEX, INITIAL_RESERVE_CONTENT, NO_LETTER_LEFT, RESERVE_CAPACITY } from '@common/constants/reserve-constant';
import { Reserve } from '@common/interfaces/reserve-interface';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ReserveService } from './reserve.service';

describe('Reserve Service Tests ', () => {
    const reserveService = new ReserveService();
    let reserve: Reserve;

    beforeEach(() => {
        reserve = reserveService.createReserve();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('drawing if pool is empty should return no letters', () => {
        reserve.nbOfLetters = NO_LETTER_LEFT;
        const letterDrawn: string = reserveService.drawLetter(reserve);
        expect(letterDrawn).to.equals(NO_LETTER);
    });

    it('drawing if the pool is not empty should return a letter', () => {
        const letterDrawn: string = reserveService.drawLetter(reserve);
        expect(letterDrawn).to.not.equal(NO_LETTER);
    });

    it('add a letter should add it to the reserve', () => {
        reserve.nbOfLetters = 0;
        reserve.content = [
            { letter: 'A', nbOfCopies: 0 },
            { letter: 'B', nbOfCopies: 0 },
            { letter: 'C', nbOfCopies: 0 },
            { letter: 'D', nbOfCopies: 0 },
            { letter: 'E', nbOfCopies: 0 },
            { letter: 'F', nbOfCopies: 0 },
            { letter: 'G', nbOfCopies: 0 },
            { letter: 'H', nbOfCopies: 0 },
            { letter: 'I', nbOfCopies: 0 },
            { letter: 'J', nbOfCopies: 0 },
            { letter: 'K', nbOfCopies: 0 },
            { letter: 'L', nbOfCopies: 0 },
            { letter: 'M', nbOfCopies: 0 },
            { letter: 'N', nbOfCopies: 0 },
            { letter: 'O', nbOfCopies: 0 },
            { letter: 'P', nbOfCopies: 0 },
            { letter: 'Q', nbOfCopies: 0 },
            { letter: 'R', nbOfCopies: 0 },
            { letter: 'S', nbOfCopies: 0 },
            { letter: 'T', nbOfCopies: 0 },
            { letter: 'U', nbOfCopies: 0 },
            { letter: 'V', nbOfCopies: 0 },
            { letter: 'W', nbOfCopies: 0 },
            { letter: 'X', nbOfCopies: 0 },
            { letter: 'Y', nbOfCopies: 0 },
            { letter: 'Z', nbOfCopies: 0 },
            { letter: BONUS_LETTER, nbOfCopies: 0 },
        ];
        reserveService.addToReserve(BONUS_LETTER + 'A', reserve);
        expect(reserve.content[BONUS_LETTER_INDEX].nbOfCopies).to.equals(1);
        expect(reserve.content[0].nbOfCopies).to.equals(1);
        expect(reserve.nbOfLetters).to.equals(2);
    });

    it('if there is only one letter we should draw it and the content becomes empty', () => {
        reserve.nbOfLetters = 1;
        reserve.content = [
            { letter: 'A', nbOfCopies: 0 },
            { letter: 'B', nbOfCopies: 0 },
            { letter: 'C', nbOfCopies: 0 },
            { letter: 'D', nbOfCopies: 0 },
            { letter: 'E', nbOfCopies: 0 },
            { letter: 'F', nbOfCopies: 0 },
            { letter: 'G', nbOfCopies: 0 },
            { letter: 'H', nbOfCopies: 0 },
            { letter: 'I', nbOfCopies: 0 },
            { letter: 'J', nbOfCopies: 0 },
            { letter: 'K', nbOfCopies: 0 },
            { letter: 'L', nbOfCopies: 0 },
            { letter: 'M', nbOfCopies: 0 },
            { letter: 'N', nbOfCopies: 0 },
            { letter: 'O', nbOfCopies: 0 },
            { letter: 'P', nbOfCopies: 0 },
            { letter: 'Q', nbOfCopies: 0 },
            { letter: 'R', nbOfCopies: 0 },
            { letter: 'S', nbOfCopies: 0 },
            { letter: 'T', nbOfCopies: 0 },
            { letter: 'U', nbOfCopies: 0 },
            { letter: 'V', nbOfCopies: 0 },
            { letter: 'W', nbOfCopies: 0 },
            { letter: 'X', nbOfCopies: 0 },
            { letter: 'Y', nbOfCopies: 0 },
            { letter: 'Z', nbOfCopies: 1 },
            { letter: BONUS_LETTER, nbOfCopies: 0 },
        ];
        const letterDrawn: string = reserveService.drawLetter(reserve);
        expect(letterDrawn).to.equals('Z');
        expect(reserve.nbOfLetters).to.equals(0);
    });

    it('drawLetter should draw the correct letter for a specified index', () => {
        const expectedLetter = 'A';
        const expectedLetterIndex = 0;
        const expectedNbOfLetters = 26;
        reserve.nbOfLetters = 27;
        reserve.content = [
            { letter: 'A', nbOfCopies: 1 },
            { letter: 'B', nbOfCopies: 1 },
            { letter: 'C', nbOfCopies: 1 },
            { letter: 'D', nbOfCopies: 1 },
            { letter: 'E', nbOfCopies: 1 },
            { letter: 'F', nbOfCopies: 1 },
            { letter: 'G', nbOfCopies: 1 },
            { letter: 'H', nbOfCopies: 1 },
            { letter: 'I', nbOfCopies: 1 },
            { letter: 'J', nbOfCopies: 1 },
            { letter: 'K', nbOfCopies: 1 },
            { letter: 'L', nbOfCopies: 1 },
            { letter: 'M', nbOfCopies: 1 },
            { letter: 'N', nbOfCopies: 1 },
            { letter: 'O', nbOfCopies: 1 },
            { letter: 'P', nbOfCopies: 1 },
            { letter: 'Q', nbOfCopies: 1 },
            { letter: 'R', nbOfCopies: 1 },
            { letter: 'S', nbOfCopies: 1 },
            { letter: 'R', nbOfCopies: 1 },
            { letter: 'U', nbOfCopies: 1 },
            { letter: 'V', nbOfCopies: 1 },
            { letter: 'W', nbOfCopies: 1 },
            { letter: 'X', nbOfCopies: 1 },
            { letter: 'Y', nbOfCopies: 1 },
            { letter: 'Z', nbOfCopies: 1 },
            { letter: BONUS_LETTER, nbOfCopies: 1 },
        ];
        const noRandom = () => {
            return expectedLetterIndex;
        };
        sinon.stub(reserveService as any, 'generateRandomNumber').callsFake(noRandom);
        const letterDrawn = reserveService.drawLetter(reserve);
        expect(letterDrawn).equal(expectedLetter);
        expect(reserve.nbOfLetters).equal(expectedNbOfLetters);
        expect(reserve.content[0].nbOfCopies).equal(0);
    });

    it('drawLetter should draw the correct letter for a specified index', () => {
        const expectedLetter = 'G';
        const expectedLetterIndex = 6;
        const expectedNbOfLetters = 26;
        reserve.nbOfLetters = 27;
        reserve.content = [
            { letter: 'A', nbOfCopies: 0 },
            { letter: 'B', nbOfCopies: 0 },
            { letter: 'C', nbOfCopies: 0 },
            { letter: 'D', nbOfCopies: 0 },
            { letter: 'E', nbOfCopies: 1 },
            { letter: 'F', nbOfCopies: 5 },
            { letter: 'G', nbOfCopies: 1 },
            { letter: 'H', nbOfCopies: 1 },
            { letter: 'I', nbOfCopies: 1 },
            { letter: 'J', nbOfCopies: 1 },
            { letter: 'K', nbOfCopies: 1 },
            { letter: 'L', nbOfCopies: 1 },
            { letter: 'M', nbOfCopies: 1 },
            { letter: 'N', nbOfCopies: 1 },
            { letter: 'O', nbOfCopies: 1 },
            { letter: 'P', nbOfCopies: 1 },
            { letter: 'Q', nbOfCopies: 1 },
            { letter: 'R', nbOfCopies: 1 },
            { letter: 'S', nbOfCopies: 1 },
            { letter: 'T', nbOfCopies: 1 },
            { letter: 'U', nbOfCopies: 1 },
            { letter: 'V', nbOfCopies: 1 },
            { letter: 'W', nbOfCopies: 1 },
            { letter: 'X', nbOfCopies: 1 },
            { letter: 'Y', nbOfCopies: 1 },
            { letter: 'Z', nbOfCopies: 1 },
            { letter: BONUS_LETTER, nbOfCopies: 1 },
        ];
        const noRandom = () => {
            return expectedLetterIndex;
        };
        sinon.stub(reserveService as any, 'generateRandomNumber').callsFake(noRandom);
        const letterDrawn = reserveService.drawLetter(reserve);
        expect(letterDrawn).equal(expectedLetter);
        expect(reserve.nbOfLetters).equal(expectedNbOfLetters);
        expect(reserve.content[6].nbOfCopies).equal(0);
    });

    it('toString should return the proper string if the reserve contains any amount of letter', () => {
        reserve.content = [
            { letter: 'A', nbOfCopies: 0 },
            { letter: 'B', nbOfCopies: 0 },
            { letter: 'C', nbOfCopies: 0 },
            { letter: 'D', nbOfCopies: 0 },
            { letter: 'E', nbOfCopies: 1 },
            { letter: 'F', nbOfCopies: 5 },
            { letter: 'G', nbOfCopies: 1 },
            { letter: 'H', nbOfCopies: 1 },
            { letter: 'I', nbOfCopies: 1 },
            { letter: 'J', nbOfCopies: 1 },
            { letter: 'K', nbOfCopies: 1 },
            { letter: 'L', nbOfCopies: 1 },
            { letter: 'M', nbOfCopies: 1 },
            { letter: 'N', nbOfCopies: 1 },
            { letter: 'O', nbOfCopies: 1 },
            { letter: 'P', nbOfCopies: 1 },
            { letter: 'Q', nbOfCopies: 1 },
            { letter: 'R', nbOfCopies: 1 },
            { letter: 'S', nbOfCopies: 1 },
            { letter: 'T', nbOfCopies: 1 },
            { letter: 'U', nbOfCopies: 1 },
            { letter: 'V', nbOfCopies: 1 },
            { letter: 'W', nbOfCopies: 1 },
            { letter: 'X', nbOfCopies: 1 },
            { letter: 'Y', nbOfCopies: 1 },
            { letter: 'Z', nbOfCopies: 1 },
            { letter: BONUS_LETTER, nbOfCopies: 1 },
        ];
        const expected = 'EFFFFFGHIJKLMNOPQRSTUVWXYZ*';

        const result = reserveService.toString(reserve);

        expect(result).equal(expected);
    });

    it('toString should return an empty string if the reserve is empty', () => {
        reserve.content = [
            { letter: 'A', nbOfCopies: 0 },
            { letter: 'B', nbOfCopies: 0 },
            { letter: 'C', nbOfCopies: 0 },
            { letter: 'D', nbOfCopies: 0 },
            { letter: 'E', nbOfCopies: 0 },
            { letter: 'F', nbOfCopies: 0 },
            { letter: 'G', nbOfCopies: 0 },
            { letter: 'H', nbOfCopies: 0 },
            { letter: 'I', nbOfCopies: 0 },
            { letter: 'J', nbOfCopies: 0 },
            { letter: 'K', nbOfCopies: 0 },
            { letter: 'L', nbOfCopies: 0 },
            { letter: 'M', nbOfCopies: 0 },
            { letter: 'N', nbOfCopies: 0 },
            { letter: 'O', nbOfCopies: 0 },
            { letter: 'P', nbOfCopies: 0 },
            { letter: 'Q', nbOfCopies: 0 },
            { letter: 'R', nbOfCopies: 0 },
            { letter: 'S', nbOfCopies: 0 },
            { letter: 'T', nbOfCopies: 0 },
            { letter: 'U', nbOfCopies: 0 },
            { letter: 'V', nbOfCopies: 0 },
            { letter: 'W', nbOfCopies: 0 },
            { letter: 'X', nbOfCopies: 0 },
            { letter: 'Y', nbOfCopies: 0 },
            { letter: 'Z', nbOfCopies: 0 },
            { letter: BONUS_LETTER, nbOfCopies: 0 },
        ];
        const expected = '';

        const result = reserveService.toString(reserve);

        expect(result).equal(expected);
    });

    it('removeFromReserve should remove blank letters from the reserve', () => {
        const reserveTest = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };

        // eslint-disable-next-line dot-notation
        reserveService['removeFromReserve'](BONUS_LETTER, reserveTest);
        expect(reserveTest.content[BONUS_LETTER_INDEX].nbOfCopies).equal(1);
    });
});
