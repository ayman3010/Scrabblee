/* tslint:disable:no-unused-variable */

import { FormatTime } from './format-time.pipe';

describe('Pipe: FormatTime', () => {
    const pipe = new FormatTime();

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('return properly formatted time with valid input', () => {
        const validTime = 69;
        const result = pipe.transform(validTime);
        const expected = '1:09';
        expect(result).toEqual(expected);
    });

    it('return 0:00 when given a negative time', () => {
        const invalidTime = -69;
        const result = pipe.transform(invalidTime);
        const expected = '0:00';
        expect(result).toEqual(expected);
    });
});
