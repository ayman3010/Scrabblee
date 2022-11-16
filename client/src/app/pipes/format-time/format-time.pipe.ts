import { Pipe, PipeTransform } from '@angular/core';

/**
 * A simple Pipe to format a time that's a number of seconds into a string of the `m:ss` format.
 */
@Pipe({
    name: 'formatTime',
})
export class FormatTime implements PipeTransform {
    transform(duration: number): string {
        if (duration < 0) return '0:00';
        const secondsInMinute = 60;
        const MINIMUM_DIGITS = 2;
        return `${(duration - (duration % secondsInMinute)) / secondsInMinute}:${(duration % secondsInMinute).toLocaleString('en-US', {
            minimumIntegerDigits: MINIMUM_DIGITS,
        })}`;
    }
}
