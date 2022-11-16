import { Component, EventEmitter, Output } from '@angular/core';
import { DEFAULT_LETTER_TEXT_SIZE, MAXIMUM_LETTER_TEXT_SIZE, MINIMUM_LETTER_TEXT_SIZE } from '@app/classes/constants/board-dimensions';

const TEXT_SIZE_SMALL = 26;
const TEXT_SIZE_LARGE = 33;

@Component({
    selector: 'app-text-size-button',
    templateUrl: './text-size-button.component.html',
    styleUrls: ['./text-size-button.component.scss'],
})
export class TextSizeButtonComponent {
    @Output() resizeText: EventEmitter<number> = new EventEmitter<number>();

    readonly textSizeSmall: number = TEXT_SIZE_SMALL;
    readonly textSizeDefault: number = DEFAULT_LETTER_TEXT_SIZE;
    readonly textSizeLarge: number = TEXT_SIZE_LARGE;

    currentTextSize: number = DEFAULT_LETTER_TEXT_SIZE;

    setTextSize(newSize: number): void {
        if (newSize > MAXIMUM_LETTER_TEXT_SIZE || newSize < MINIMUM_LETTER_TEXT_SIZE) return;

        this.currentTextSize = newSize;
        this.resizeText.emit(this.currentTextSize);
    }
}
