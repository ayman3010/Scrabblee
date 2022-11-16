/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* tslint:disable:no-unused-variable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { HighScoreClient } from '@common/interfaces/high-score';
import { of } from 'rxjs';
import { HighScoresCategoryComponent, MEDALS } from './high-scores-category.component';

describe('HighScoresCategoryComponent', () => {
    let component: HighScoresCategoryComponent;
    let fixture: ComponentFixture<HighScoresCategoryComponent>;
    let highScoresServiceSpy: jasmine.SpyObj<HighScoresService>;

    beforeEach(() => {
        highScoresServiceSpy = jasmine.createSpyObj('HighScoresService', ['getHighScores']);

        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatTableModule, MatProgressSpinnerModule],
            declarations: [HighScoresCategoryComponent],
            providers: [{ provide: HighScoresService, useValue: highScoresServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HighScoresCategoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call getHighScores from highScoresService and display setter with response', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        highScoresServiceSpy.getHighScores.and.returnValue(of(response));
        const spy = spyOnProperty(component, 'display', 'set').and.stub();
        await component.ngOnInit();
        expect(spy).toHaveBeenCalledWith(response);
    });

    it('ngOnInit should not call display setter with response if it is undefined', async () => {
        const spy = spyOnProperty(component, 'display', 'set').and.stub();
        await component.ngOnInit();
        expect(spy).not.toHaveBeenCalled();
    });

    it('display setter should set errorMessage if display is type of Message with title Erreur', () => {
        const display: Message = { title: 'Erreur', body: 'Problem' };
        const spy = spyOn(Tools, 'isTypeOf').and.returnValue(true);
        spyOn(Tools, 'isListOfType').and.returnValue(false);
        component.display = display;
        expect(spy).toHaveBeenCalled();
        expect(component.errorMessage).toEqual(display);
    });

    it('display setter should set highScores if display is type of HighScoreClient[]', () => {
        const display: HighScoreClient[] = [];
        spyOn(Tools, 'isTypeOf').and.returnValue(false);
        const spy = spyOn(Tools, 'isListOfType').and.returnValue(true);
        component.display = display;
        expect(spy).toHaveBeenCalled();
        expect(component.highScores).toEqual(display);
    });

    it('display setter should not set anything if display is not an error', () => {
        const display: Message = { title: 'Mistake', body: 'Bio' };
        spyOn(Tools, 'isTypeOf').and.returnValue(false);
        spyOn(Tools, 'isListOfType').and.returnValue(false);
        component.display = display;
        expect(component.highScores).not.toBeDefined();
        expect(component.errorMessage).not.toBeDefined();
    });

    it('getMedal should return a medal if in the first three', () => {
        expect(component.getMedal(0)).toEqual(MEDALS[0]);
    });

    it('getMedal should return a empty string if not in the first three', () => {
        expect(component.getMedal(3)).toEqual('');
    });
});
