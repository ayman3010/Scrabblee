/* tslint:disable:no-unused-variable */

import { FormatDatePipe } from './format-date.pipe';

describe('Pipe: FormatDate', () => {
    const pipe = new FormatDatePipe();

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('return properly formatted date with valid input', () => {
        const validDate = '2022-03-27T19:00:03.579+00:00';
        const result = pipe.transform(validDate);
        const expected = '2022-03-27, 2:00:03 p.m.';
        expect(result).toEqual(expected);
    });

    it('return invalid date with invalid input', () => {
        const result = pipe.transform('');
        const expected = 'Invalid Date';
        expect(result).toEqual(expected);
    });
});
