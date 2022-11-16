import { Component, Input } from '@angular/core';
import { Letter } from '@common/interfaces/board-interface';

export const DEFAULT_LETTER: Letter = { letter: '*', value: 0 };

@Component({
    selector: 'app-letter',
    templateUrl: './letter.component.html',
    styleUrls: ['./letter.component.scss'],
})
export class LetterComponent {
    @Input() letter: Letter = DEFAULT_LETTER;
}
