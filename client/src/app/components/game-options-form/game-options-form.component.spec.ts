/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Tools } from '@app/classes/tools/tools';
import { FormatTime } from '@app/pipes/format-time/format-time.pipe';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import { of } from 'rxjs';
import { GameOptionsFormComponent } from './game-options-form.component';

describe('GameOptionsFormComponent', () => {
    let component: GameOptionsFormComponent;
    let fixture: ComponentFixture<GameOptionsFormComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let dictionariesManagerSpy: jasmine.SpyObj<DictionariesManagerService>;

    class MatDialogMock {
        gameOptionsDialog: MatDialogRefMock;
        open(): MatDialogRefMock {
            return new MatDialogRefMock();
        }
    }
    class MatDialogRefMock {
        close(): void {
            return;
        }
    }

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['connectPlayer', 'createRoom']);
    });

    beforeEach(async () => {
        dictionariesManagerSpy = jasmine.createSpyObj('dictionariesManagerSpy', [
            'getDictionariesHeaders',
            'updateDictionary',
            'getDictionary',
            'removeDictionary',
            'downloadDictionary',
            'addDictionary',
        ]);
        const mockDictionnary: DictionaryHeader[] = [{ id: 'Test', title: 'Test', description: 'testing' }];
        dictionariesManagerSpy.getDictionariesHeaders.and.returnValue(of(mockDictionnary));
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                MatFormFieldModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                MatRadioModule,
                BrowserAnimationsModule,
                MatDialogModule,
                ReactiveFormsModule,
                FormsModule,
            ],
            declarations: [GameOptionsFormComponent, FormatTime],
            providers: [
                FormBuilder,
                { provide: DictionariesManagerService, useValue: dictionariesManagerSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOptionsFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('NgOnInit when tools method returns false', async () => {
        spyOn(Tools, 'isListOfType').and.stub().and.returnValue(false);

        await component.ngOnInit();

        expect(dictionariesManagerSpy.getDictionariesHeaders).toHaveBeenCalled();
    });

    it('NgOnInit when tools method returns true', async () => {
        spyOn(Tools, 'isListOfType').and.stub().and.returnValue(true);

        await component.ngOnInit();
        expect(dictionariesManagerSpy.getDictionariesHeaders).toHaveBeenCalled();
    });

    it('getTurnDurations should call range with the correct parameters', () => {
        const DURATION_MINIMUM = 30;
        const DURATION_MAXIMUM = 300;
        const STEP = 30;
        const spy = spyOn(Tools, 'range').and.stub();

        component.getTurnDurations();
        expect(spy).toHaveBeenCalledOnceWith(DURATION_MINIMUM, DURATION_MAXIMUM, STEP);
    });

    it('getTurnDurations should return the correct array', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const expectedValue = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
        const returnValue = component.getTurnDurations();
        expect(returnValue).toEqual(expectedValue);
    });

    it('onSubmit should call gameOptionsDialog.close with gameOptionsForm when the name provided in the form is valid size-wise', () => {
        const submittedName = 'John Scrabble';
        component.gameOptionsForm.value.name = submittedName;
        const spy = spyOn(component.gameOptionsDialog, 'close');

        component.onSubmit();

        expect(spy).toHaveBeenCalledWith(component.gameOptionsForm);
    });

    it('onSubmit should not call gameOptionsDialog.close when the name provided in the form is invalid', () => {
        const submittedName = '';
        component.gameOptionsForm.value.name = submittedName;
        const spy = spyOn(component.gameOptionsDialog, 'close');

        component.onSubmit();

        expect(spy).not.toHaveBeenCalled();
    });
});
