/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Message } from '@app/classes/message';
import { CONFLICT_ERROR_MESSAGE, Tools } from '@app/classes/tools/tools';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import { Observable, of } from 'rxjs';
// eslint-disable-next-line import/no-deprecated
import { AdminDictionaryDialogComponent } from './admin-dictionary-dialog.component';

describe('AdminDictionaryDialogComponent', () => {
    let component: AdminDictionaryDialogComponent;
    let fixture: ComponentFixture<AdminDictionaryDialogComponent>;
    let dictionariesManagerSpy: jasmine.SpyObj<DictionariesManagerService>;
    let data: FormGroup | undefined;
    let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
    const testMessage: Message = { title: 'test', body: 'test message' };
    const errorMessage: Message = { title: 'Erreur', body: 'test message' };
    let testMessageObservable: Observable<Message> = of(testMessage);
    const mockDictionaryList: DictionaryHeader[] = [{ id: ' Test', title: 'Test', description: 'testing' }];

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
        dictionariesManagerSpy = jasmine.createSpyObj('dictionariesManagerSpy', [
            'getDictionariesHeaders',
            'updateDictionary',
            'getDictionary',
            'removeDictionary',
            'downloadDictionary',
            'addDictionary',
        ]);

        matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open', 'dismiss']);

        TestBed.configureTestingModule({
            imports: [
                MatInputModule,
                MatDialogModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                FormsModule,
                BrowserAnimationsModule,
                MatTableModule,
                MatIconModule,
            ],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: DictionariesManagerService, useValue: dictionariesManagerSpy },
                { provide: MatSnackBar, useValue: matSnackBarSpy },
            ],
            declarations: [AdminDictionaryDialogComponent],
        });
        testMessageObservable = of(testMessage);
        dictionariesManagerSpy.addDictionary.and.returnValue(testMessageObservable);
        dictionariesManagerSpy.getDictionariesHeaders.and.returnValue(of(mockDictionaryList));
        fixture = TestBed.createComponent(AdminDictionaryDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('getDictionaries should call getDictionaryHeaders and update the dictionaries list', async () => {
        dictionariesManagerSpy.getDictionariesHeaders.and.returnValue(of(mockDictionaryList));
        spyOn(Tools, 'isListOfType').and.returnValue(true);
        spyOn(Tools, 'isTypeOf').and.returnValue(false);

        component.getDictionaries();
        expect(component.dictionaryList).toEqual(mockDictionaryList);
    });

    it('getDictionaries should not update the dictionaries list', async () => {
        const expectedDictionariesList = component.dictionaryList;
        dictionariesManagerSpy.getDictionariesHeaders.and.returnValue(of(errorMessage));
        spyOn(Tools, 'isListOfType').and.returnValue(false);
        spyOn(Tools, 'isTypeOf').and.returnValue(true);

        component.getDictionaries();
        expect(component.dictionaryList).toEqual(expectedDictionariesList);
    });

    it('getDictionaries should not update the dictionaries list', async () => {
        const expectedDictionariesList = component.dictionaryList;
        dictionariesManagerSpy.getDictionariesHeaders.and.returnValue(of(errorMessage));

        spyOn(Tools, 'isListOfType').and.returnValue(false);
        spyOn(Tools, 'isTypeOf').and.returnValue(false);

        component.getDictionaries();
        expect(component.dictionaryList).toEqual(expectedDictionariesList);
    });

    it('modifyDictionaries should call getDictionaries and updateDictionary update the dictionaries list', async () => {
        const expectedmodifiedDictionary: DictionaryHeader = { id: ' Test', title: 'Test', description: 'testing' };
        dictionariesManagerSpy.updateDictionary.and.returnValue(of(testMessage));

        const onInitSpy = spyOn(component, 'ngOnInit').and.stub();
        component.modifyDictionary(expectedmodifiedDictionary.id, expectedmodifiedDictionary.title, expectedmodifiedDictionary.description);
        expect(onInitSpy).toHaveBeenCalled();
        expect(dictionariesManagerSpy.updateDictionary).toHaveBeenCalled();
    });

    it('downloadDictionary should call downloadDictionary ', async () => {
        const dictionaryId = 'Test';
        dictionariesManagerSpy.downloadDictionary.and.returnValue();
        component.downloadDictionary(dictionaryId);
        expect(dictionariesManagerSpy.downloadDictionary).toHaveBeenCalledWith(dictionaryId);
    });

    it('removeDictionary should call removeDictionary from the dictionaryManagerService', async () => {
        const expectedmodifiedDictionary: DictionaryHeader = { id: ' Test', title: 'Test', description: 'testing' };
        dictionariesManagerSpy.removeDictionary.and.returnValue(of(testMessage));
        const ngOnInitSpy = spyOn(component, 'ngOnInit').and.stub();
        component.removeDictionary(expectedmodifiedDictionary.id);
        expect(ngOnInitSpy).toHaveBeenCalled();
        expect(dictionariesManagerSpy.removeDictionary).toHaveBeenCalled();
    });

    it('removeDictionary should call removeDictionary from the dictionaryManagerService', async () => {
        const expectedmodifiedDictionary: DictionaryHeader = { id: ' Test', title: 'Test', description: 'testing' };
        dictionariesManagerSpy.removeDictionary.and.returnValue(of(errorMessage));
        const ngOnInitSpy = spyOn(component, 'ngOnInit').and.stub();
        component.removeDictionary(expectedmodifiedDictionary.id);
        expect(ngOnInitSpy).toHaveBeenCalled();
        expect(dictionariesManagerSpy.removeDictionary).toHaveBeenCalled();
    });

    it('onUpload should call addDictionary from the dictionaryManagerService, but not getDictionaries if an error message is returned', () => {
        component.file = new File(['{"id":"Test","title":"Test","description":"testing"}'], 'foo.json', {
            type: 'json',
        });

        testMessageObservable = of({ title: 'Erreur', body: 'error message' });
        dictionariesManagerSpy.addDictionary.and.returnValue(testMessageObservable);
        const spy = spyOn(component, 'getDictionaries').and.stub();

        component.onUpload();

        expect(dictionariesManagerSpy.addDictionary).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    it('close should close method of adminDictionaryDialog', async () => {
        const spy = spyOn(component.adminDictionaryDialog, 'close');
        component.close();
        expect(spy).toHaveBeenCalled();
    });

    it('change event should call onChange method', async () => {
        const event = jasmine.createSpyObj(Event, ['target']);
        const target = jasmine.createSpyObj(HTMLInputElement, ['files']);
        target.files = [
            new File(['foo'], 'foo.txt', {
                type: 'json',
            }),
        ];
        event.target = target;
        component.onChange(event);
        expect(component.file).toEqual(target.files[0]);
    });

    it('change event should not modify the component file variable', async () => {
        const expectedFile = component.file;
        const event = jasmine.createSpyObj(Event, ['target']);
        const target = jasmine.createSpyObj(HTMLInputElement, ['files']);
        target.files = undefined;
        event.target = target;
        component.onChange(event);
        expect(component.file).toEqual(expectedFile);
    });

    it('notify should open snackbar with error message', () => {
        component['notify']({ title: 'Erreur', body: 'description' });
        expect(matSnackBarSpy.open).toHaveBeenCalled();
    });

    it('notify should open snackbar with error message', () => {
        component['notify']({ title: 'Erreur', body: CONFLICT_ERROR_MESSAGE });
        expect(matSnackBarSpy.open).toHaveBeenCalled();
    });

    it('notify should open snackbar with error message', () => {
        component['notify']({ title: '', body: '' });
        expect(matSnackBarSpy.open).toHaveBeenCalledWith('Opération effectuée avec succès', 'Ok');
    });

    it('restore should replace current edited dictionary by his ancient values', () => {
        const expected = [{ title: 'Ancient', description: 'Ancient2', id: 'id' }];
        component.ancientTitle = 'Ancient';
        component.ancientDescription = 'Ancient2';
        component.editable = 0;
        component.dictionaryList = [{ title: 'New', description: 'New2', id: 'id' }];
        component.restore();
        expect(component.dictionaryList).toEqual(expected);
    });

    it('restore should not replace current edited dictionary by his ancient values if it is not editable', () => {
        const expected = [{ title: 'New', description: 'New2', id: 'id' }];
        component.ancientTitle = 'Ancient';
        component.ancientDescription = 'Ancient2';
        component.editable = -1;
        component.dictionaryList = [{ title: 'New', description: 'New2', id: 'id' }];
        component.restore();
        expect(component.dictionaryList).toEqual(expected);
    });
});
