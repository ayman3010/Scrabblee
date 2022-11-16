/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JoinGameDialogComponent } from './join-game-dialog.component';

describe('JoinGameDialogComponent', () => {
    let component: JoinGameDialogComponent;
    let fixture: ComponentFixture<JoinGameDialogComponent>;

    class MatDialogMock {
        nameInputDialog: MatDialogRefMock;
    }

    class MatDialogRefMock {
        close(): void {
            return;
        }
    }

    const data = { playerName: '' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatFormFieldModule,
                BrowserAnimationsModule,
                MatInputModule,
                FormsModule,
                MatDialogModule,
                ReactiveFormsModule,
                MatFormFieldModule,
            ],
            declarations: [JoinGameDialogComponent],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        data.playerName = '';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the nameInputDialog when onCancelClick() is called', () => {
        const spy = spyOn(component.nameInputDialog, 'close');
        component.onCancelClick();
        expect(spy).toHaveBeenCalled();
    });

    it('verifyName() should return false if the playerName is empty', () => {
        const expected = false;
        const result = component.verifyName();
        expect(result).toEqual(expected);
    });

    it('verifyName() should return false if the playerName is less than 3 characters long', () => {
        data.playerName = 'no';
        const expected = false;
        const result = component.verifyName();
        expect(result).toEqual(expected);
    });

    it('verifyName() should return false if the playerName is more than 20 characters long', () => {
        data.playerName = 'John Scrabble, inventor of Scrabble';
        const expected = false;
        const result = component.verifyName();
        expect(result).toEqual(expected);
    });

    it('verifyName() should return true if the playerName is between 3 and 20 characters long', () => {
        data.playerName = 'John Scrabble';
        const expected = true;
        const result = component.verifyName();
        expect(result).toEqual(expected);
    });

    it('should not close the nameInputDialog when onConfirmClick() is called while playerName is invalid', () => {
        const spy = spyOn(component.nameInputDialog, 'close');
        component.onConfirmClick();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should close the nameInputDialog when onConfirmClick() is called while playerName is valid', () => {
        data.playerName = 'John Scrabble';
        const spy = spyOn(component.nameInputDialog, 'close');
        component.onConfirmClick();
        expect(spy).toHaveBeenCalled();
    });
});
