/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '@app/classes/message';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-vitual-player.service';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { Observable, of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    let data: FormGroup | undefined;
    let adminVirtualPlayerServiceSpy: jasmine.SpyObj<AdminVirtualPlayerService>;
    let gamesHistoryServiceSpy: jasmine.SpyObj<GamesHistoryService>;
    let highScoresServiceSpy: jasmine.SpyObj<HighScoresService>;
    let dictionariesManagerServiceSpy: jasmine.SpyObj<DictionariesManagerService>;

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

    class MatDialogMock {
        gameOptionsDialog: MatDialogRefMock;
        open(): MatDialogRefMock {
            return new MatDialogRefMock();
        }
    }

    beforeEach(async () => {
        highScoresServiceSpy = jasmine.createSpyObj('HighScoresService', ['deleteAllHighScores']);
        gamesHistoryServiceSpy = jasmine.createSpyObj('GamesHistoryService', ['getGamesHistory', 'deleteGamesHistory']);
        adminVirtualPlayerServiceSpy = jasmine.createSpyObj('adminVirtualPlayerServiceSpy', [
            'getVirtualPlayers',
            'deleteVirtualPlayer',
            'addVirtualPlayer',
            'updateVirtualPlayer',
            'deleteAllVirtualPlayer',
        ]);
        dictionariesManagerServiceSpy = jasmine.createSpyObj('DictionariesManagerService', ['resetDictionaries']);

        await TestBed.configureTestingModule({
            imports: [MatIconModule],
            declarations: [AdminPageComponent],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: HighScoresService, useValue: highScoresServiceSpy },
                { provide: GamesHistoryService, useValue: gamesHistoryServiceSpy },
                { provide: AdminVirtualPlayerService, useValue: adminVirtualPlayerServiceSpy },
                { provide: DictionariesManagerService, useValue: dictionariesManagerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call open when openDictionaryDialog() is called', () => {
        const spy = spyOn(component.dialog, 'open');
        component.openDictionaryDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should call open when openGameHistoryDialog() is called', () => {
        const spy = spyOn(component.dialog, 'open');
        component.openGameHistoryDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should call open when openVirtualPlayerDialog() is called', () => {
        const spy = spyOn(component.dialog, 'open');
        component.openVirtualPlayerDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should call openGameHistoryDialog()', () => {
        const spy = spyOn(component, 'openGameHistoryDialog');
        component.openGameHistoryDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should call openVirtualPlayerDialog()', () => {
        const spy = spyOn(component, 'openVirtualPlayerDialog');
        component.openVirtualPlayerDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should call openDictionaryDialog()', () => {
        const spy = spyOn(component, 'openDictionaryDialog');
        component.openDictionaryDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should call openDictionaryDialog()', () => {
        const spy = spyOn(component, 'openDictionaryDialog');
        component.openDictionaryDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should call deleteAllVirtualPlayer()', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        adminVirtualPlayerServiceSpy.deleteAllVirtualPlayer.and.returnValue(of(response));
        await component.resetVirtualPlayers();
        expect(adminVirtualPlayerServiceSpy.deleteAllVirtualPlayer).toHaveBeenCalled();
    });

    it('resetGameHistory() should call resetGamesHistory()', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        gamesHistoryServiceSpy.deleteGamesHistory.and.returnValue(of(response));
        await component.resetGameHistory();
        expect(gamesHistoryServiceSpy.deleteGamesHistory).toHaveBeenCalled();
    });

    it('resetHighScores() should call deleteAllHighScores()', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        highScoresServiceSpy.deleteAllHighScores.and.returnValue(of(response));
        await component.resetHighScores();
        expect(highScoresServiceSpy.deleteAllHighScores).toHaveBeenCalled();
    });

    it('resetDictionariess() should call resetDictionaries()', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        dictionariesManagerServiceSpy.resetDictionaries.and.returnValue(of(response));
        await component.resetDictionaries();
        expect(dictionariesManagerServiceSpy.resetDictionaries).toHaveBeenCalled();
    });
});
