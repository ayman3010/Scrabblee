/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_LETTER_TEXT_SIZE, MAXIMUM_LETTER_TEXT_SIZE, MINIMUM_LETTER_TEXT_SIZE } from '@app/classes/constants/board-dimensions';
import { TextSizeButtonComponent } from './text-size-button.component';

describe('TextSizeButtonComponent', () => {
    let component: TextSizeButtonComponent;
    let fixture: ComponentFixture<TextSizeButtonComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [TextSizeButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TextSizeButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('setTextSize should not change or emit the currentTextSize if the new text size is above the maximum letter text size', () => {
        component.currentTextSize = DEFAULT_LETTER_TEXT_SIZE;
        const spy = spyOn(component.resizeText, 'emit');
        component.setTextSize(MAXIMUM_LETTER_TEXT_SIZE + 1);
        expect(component.currentTextSize).toEqual(DEFAULT_LETTER_TEXT_SIZE);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('setTextSize should not change or emit the currentTextSize if the new text size is under the minimum letter text size', () => {
        component.currentTextSize = DEFAULT_LETTER_TEXT_SIZE;
        const spy = spyOn(component.resizeText, 'emit');
        component.setTextSize(MINIMUM_LETTER_TEXT_SIZE - 1);
        expect(component.currentTextSize).toEqual(DEFAULT_LETTER_TEXT_SIZE);
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('setTextSize should change and emit the currentTextSize if the new text size is valid', () => {
        const expected = DEFAULT_LETTER_TEXT_SIZE + 1;
        component.currentTextSize = DEFAULT_LETTER_TEXT_SIZE;
        const spy = spyOn(component.resizeText, 'emit');
        component.setTextSize(expected);
        expect(component.currentTextSize).toEqual(expected);
        expect(spy).toHaveBeenCalledOnceWith(expected);
    });
});
