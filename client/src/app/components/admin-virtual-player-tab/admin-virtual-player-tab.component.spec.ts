/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { AdminVirtualPlayerService } from '@app/services/admin-virtual-player/admin-vitual-player.service';
import { DEFAULT_VIRTUAL_PLAYERS } from '@common/constants/admin-virtual-player';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Observable, of } from 'rxjs';
import { AdminVirtualPlayerTabComponent, EMPTY_MESSAGE } from './admin-virtual-player-tab.component';

describe('AdminVirtualPlayerTabComponent', () => {
    let fixture: ComponentFixture<AdminVirtualPlayerTabComponent>;
    let component: AdminVirtualPlayerTabComponent;
    let adminVirtualPlayerServiceSpy: jasmine.SpyObj<AdminVirtualPlayerService>;
    let data: FormGroup | undefined;
    let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;

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
        adminVirtualPlayerServiceSpy = jasmine.createSpyObj('adminVirtualPlayerServiceSpy', [
            'getVirtualPlayers',
            'deleteVirtualPlayer',
            'addVirtualPlayer',
            'updateVirtualPlayer',
            'isDefaultVirtualPLayer',
        ]);
        matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open', 'dismiss']);

        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpClientModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: AdminVirtualPlayerService, useValue: adminVirtualPlayerServiceSpy },
                { provide: MatSnackBar, useValue: matSnackBarSpy },
            ],
            declarations: [AdminVirtualPlayerTabComponent],
        });

        fixture = TestBed.createComponent(AdminVirtualPlayerTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be able to create component instance', () => {
        expect(component).toBeDefined();
    });

    it('ngOnInit should call getVirtualPlayers from AdminVirtualPlayerService and display setter with response', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        adminVirtualPlayerServiceSpy.getVirtualPlayers.and.returnValue(of(response));
        const spy = spyOnProperty(component, 'display', 'set').and.stub();
        await component.ngOnInit();
        expect(spy).toHaveBeenCalledWith(response);
    });

    it('removeVirtualPlayer should call from deleteVirtualPlayer and ngOnInit', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        const beginnerVirtualPlayer: VirtualPlayer = { name: 'John', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        adminVirtualPlayerServiceSpy.deleteVirtualPlayer.and.returnValue(of(response));
        const spy = spyOn(component, 'ngOnInit').and.stub();
        spyOn(component as any, 'notify').and.stub();
        await component.removeVirtualPlayer(beginnerVirtualPlayer);
        expect(adminVirtualPlayerServiceSpy.deleteVirtualPlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('removeVirtualPlayer should remove the players in the active list if he is an active player', async () => {
        const beginnerVirtualPlayer: VirtualPlayer = { name: 'Marc', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const copyActiveList = { ...component.activeVirtualPlayers };
        const response: Message = { title: 'Test', body: 'testing' };

        adminVirtualPlayerServiceSpy.deleteVirtualPlayer.and.returnValue(of(response));
        spyOn(component as any, 'notify').and.stub();
        await component.removeVirtualPlayer(beginnerVirtualPlayer);
        expect(copyActiveList).not.toEqual(component.activeVirtualPlayers);
    });

    it('removeVirtualPlayer should  not remove the player remove the players in the active list if he is not an active player', async () => {
        const beginnerVirtualPlayer: VirtualPlayer = { name: 'Quandale Dingle', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const copyActiveList = component.activeVirtualPlayers;
        const response: Message = { title: 'Test', body: 'testing' };

        adminVirtualPlayerServiceSpy.deleteVirtualPlayer.and.returnValue(of(response));
        spyOn(component as any, 'notify').and.stub();
        await component.removeVirtualPlayer(beginnerVirtualPlayer);
        expect(copyActiveList).toEqual(component.activeVirtualPlayers);
    });

    it('removeVirtualPlayer should not call deleteVirtualPlayer if the argument is a default vp', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        adminVirtualPlayerServiceSpy.deleteVirtualPlayer.and.returnValue(of(response));
        spyOn(component, 'isDefaultVirtualPLayer').and.returnValue(true);
        const spy = spyOn(component, 'ngOnInit').and.stub();
        spyOn(component as any, 'notify').and.stub();
        await component.removeVirtualPlayer(DEFAULT_VIRTUAL_PLAYERS[1]);
        expect(adminVirtualPlayerServiceSpy.deleteVirtualPlayer).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('addPlayerEvent should call addVirtualPlayer if the argument is not a default vp and the player is not an active vp', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        const spy = spyOn(component, 'ngOnInit').and.stub();
        const newVirtualPlayer = { name: 'Marcel', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        adminVirtualPlayerServiceSpy.addVirtualPlayer.and.returnValue(of(response));
        spyOn(component as any, 'notify').and.stub();
        await component.addPlayerEvent(newVirtualPlayer.name);
        expect(adminVirtualPlayerServiceSpy.addVirtualPlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('addVirtualPlayer should call updateVirtualPlayer if the argument is not a default vp and if the name is not already used', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        adminVirtualPlayerServiceSpy.addVirtualPlayer.and.returnValue(of(response));
        const spy = spyOn(component, 'ngOnInit').and.stub();
        const newVirtualPlayer = { name: 'Marshall', virtualPlayerDifficulty: AiDifficulty.EXPERT };
        spyOn(component as any, 'notify').and.stub();
        await component.addPlayerEvent(newVirtualPlayer.name);
        expect(adminVirtualPlayerServiceSpy.addVirtualPlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('nameModificationEventHandler should call updateVirtualPlayer if the argument is not a default vp and not an active player', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        component.playerDifficulty = AiDifficulty.EXPERT;
        adminVirtualPlayerServiceSpy.updateVirtualPlayer.and.returnValue(of(response));
        const spy = spyOn(component, 'ngOnInit').and.stub();
        const newVirtualPlayer: VirtualPlayer = { name: 'Josh', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        spyOn(component as any, 'notify').and.stub();
        await component.nameModificationEventHandler('James', newVirtualPlayer);
        expect(adminVirtualPlayerServiceSpy.updateVirtualPlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('nameModificationEventHandler should  call updateVirtualPlayer if the argument is not a default vp', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        component.playerDifficulty = AiDifficulty.BEGINNER;
        adminVirtualPlayerServiceSpy.updateVirtualPlayer.and.returnValue(of(response));
        const spy = spyOn(component, 'ngOnInit').and.stub();
        const newVirtualPlayer: VirtualPlayer = { name: 'Michel', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        spyOn(component as any, 'notify').and.stub();
        await component.nameModificationEventHandler('James', newVirtualPlayer);
        expect(adminVirtualPlayerServiceSpy.updateVirtualPlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('addPlayerEvent should  call addVirtualPlayer if the argument is a not default vp', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        adminVirtualPlayerServiceSpy.addVirtualPlayer.and.returnValue(of(response));
        const spy = spyOn(component, 'ngOnInit').and.stub();
        const newVirtualPlayer = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        spyOn(component as any, 'notify').and.stub();
        await component.addPlayerEvent(newVirtualPlayer.name);
        expect(adminVirtualPlayerServiceSpy.addVirtualPlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('addPlayerEvent should  call addVirtualPlayer if the argument is a not default vp', async () => {
        const response: Message = { title: 'Test', body: 'testing' };
        adminVirtualPlayerServiceSpy.addVirtualPlayer.and.returnValue(of(response));
        const spy = spyOn(component, 'ngOnInit').and.stub();
        const newVirtualPlayer = { name: 'Marc', virtualPlayerDifficulty: AiDifficulty.EXPERT };
        spyOn(component as any, 'notify').and.stub();
        await component.addPlayerEvent(newVirtualPlayer.name);
        expect(adminVirtualPlayerServiceSpy.addVirtualPlayer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnInit should  not call display setter with response', async () => {
        const spy = spyOnProperty(component, 'display', 'set').and.stub();
        await component.ngOnInit();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call adminVpDialog.close when close() is called', () => {
        const spy = spyOn(component.adminVpDialog, 'close');
        component.close();
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnInit should  not call display setter with response', async () => {
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

    it('display setter should set virtualPlayers if display is type of VirtualPlayers[]', () => {
        const display: VirtualPlayer[] = [];
        spyOn(Tools, 'isTypeOf').and.returnValue(false);
        const spy = spyOn(Tools, 'isListOfType').and.returnValue(true);
        component.display = display;
        expect(spy).toHaveBeenCalled();
        expect(component.activeVirtualPlayers).toEqual(display);
    });

    it('display setter should not set anything if display is not an error', () => {
        const display: Message = { title: 'Mistake', body: 'Bio' };
        spyOn(Tools, 'isTypeOf').and.returnValue(false);
        spyOn(Tools, 'isListOfType').and.returnValue(false);
        component.display = display;
        expect(component.activeVirtualPlayers).toEqual(DEFAULT_VIRTUAL_PLAYERS);
        expect(component.errorMessage).toEqual(EMPTY_MESSAGE);
    });

    it('isDefaultVirtualPLayer() should return true if a default virtual name is passed as argument', () => {
        expect(component.isDefaultVirtualPLayer(DEFAULT_VIRTUAL_PLAYERS[0].name)).toEqual(true);
    });

    it('isDefaultVirtualPLayer() should return false if a default virtual name is not passed as argument', () => {
        expect(component.isDefaultVirtualPLayer('Martin')).toEqual(false);
    });

    it('notify should open snackbar with error message', () => {
        component['notify']({ title: 'Erreur', body: 'description' });
        expect(matSnackBarSpy.open).toHaveBeenCalled();
    });

    it('notify should open snackbar with error message', () => {
        component['notify']({ title: '', body: '' });
        expect(matSnackBarSpy.open).toHaveBeenCalledWith('Opération effectuée avec succès', 'Ok');
    });
});
