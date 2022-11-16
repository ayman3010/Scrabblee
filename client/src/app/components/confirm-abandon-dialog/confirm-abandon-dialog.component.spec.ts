import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmAbandonDialogComponent } from './confirm-abandon-dialog.component';

describe('ConfirmAbandonDialogComponent', () => {
    let component: ConfirmAbandonDialogComponent;
    let fixture: ComponentFixture<ConfirmAbandonDialogComponent>;
    class MatDialogRefMock {
        close(): void {
            return;
        }
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmAbandonDialogComponent],
            providers: [{ provide: MatDialogRef, useClass: MatDialogRefMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmAbandonDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onCancelClick should call close on the nameInputDialog with false', () => {
        const spy = spyOn(component.nameInputDialog, 'close').and.stub();

        component.onCancelClick();
        expect(spy).toHaveBeenCalledWith(false);
    });

    it('onConfirmClick should call close on the nameInputDialog with true', () => {
        const spy = spyOn(component.nameInputDialog, 'close').and.stub();

        component.onConfirmClick();
        expect(spy).toHaveBeenCalledWith(true);
    });
});
