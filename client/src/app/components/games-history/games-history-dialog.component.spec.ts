/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* tslint:disable:no-unused-variable */
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { GameHistoryClient } from '@common/interfaces/game-history';
import { Observable, of } from 'rxjs';
import { EMPTY_MESSAGE, GamesHistoryDialogComponent } from './games-history-dialog.component';

describe('GamesHistoryComponent', () => {
    let component: GamesHistoryDialogComponent;
    let fixture: ComponentFixture<GamesHistoryDialogComponent>;
    let gamesHistoryServiceSpy: jasmine.SpyObj<GamesHistoryService>;

    let data: FormGroup | undefined;

    class MatDialogRefMock {
        close(): void {
            return;
        }

        afterClosed(): Observable<FormGroup> {
            return new Observable((observer) => {
                observer.next(data);
                observer.complete();
            });
        }
    }

    beforeEach(() => {
        gamesHistoryServiceSpy = jasmine.createSpyObj('GamesHistoryService', ['getGamesHistory', 'deleteGamesHistory']);

        TestBed.configureTestingModule({
            imports: [MatTabsModule, BrowserAnimationsModule, HttpClientModule, MatProgressSpinnerModule],
            declarations: [GamesHistoryDialogComponent],
            providers: [
                { provide: GamesHistoryService, useValue: gamesHistoryServiceSpy },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamesHistoryDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call getGamesHistory from gamesHistoryService and display setter with response', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        gamesHistoryServiceSpy.getGamesHistory.and.returnValue(of(response));
        const spy = spyOnProperty(component, 'display', 'set').and.stub();
        await component.ngOnInit();
        expect(spy).toHaveBeenCalledWith(response);
    });

    it('deleteAll should call deleteGamesHistory from gamesHistoryService and ngOnInit', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        gamesHistoryServiceSpy.deleteGamesHistory.and.returnValue(of(response));
        const spy = spyOn(component, 'ngOnInit').and.stub();
        await component.deleteAll();
        expect(gamesHistoryServiceSpy.deleteGamesHistory).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('deleteAll should call deleteGamesHistory from gamesHistoryService and ngOnInit', async () => {
        const spy = spyOn(component.gameHistoryDialog, 'close').and.stub();
        component.close();
        expect(spy).toHaveBeenCalled();
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

    it('display setter should set gamesHistory if display is type of GameHistoryClient[]', () => {
        const display: GameHistoryClient[] = [];
        spyOn(Tools, 'isTypeOf').and.returnValue(false);
        const spy = spyOn(Tools, 'isListOfType').and.returnValue(true);
        component.display = display;
        expect(spy).toHaveBeenCalled();
        expect(component.gamesHistory).toEqual(display);
    });

    it('display setter should not set anything if display is not an error', () => {
        const display: Message = { title: 'Mistake', body: 'Bio' };
        spyOn(Tools, 'isTypeOf').and.returnValue(false);
        spyOn(Tools, 'isListOfType').and.returnValue(false);
        component.display = display;
        expect(component.gamesHistory).toEqual([]);
        expect(component.errorMessage).toEqual(EMPTY_MESSAGE);
    });
});
