/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddVirtualPlayerFormComponent } from '@app/components/add-virtual-player-form/add-virtual-player-form.component';
import { AdminVirtualPlayerTabComponent } from '@app/components/admin-virtual-player-tab/admin-virtual-player-tab.component';
import { AdminVirtualPlayerDialogComponent } from './admin-virtual-player-dialog.component';

describe('AdminVirtualPlayerDialogComponent', () => {
    let component: AdminVirtualPlayerDialogComponent;
    let fixture: ComponentFixture<AdminVirtualPlayerDialogComponent>;
    let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;

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
        matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open', 'dismiss']);
        TestBed.configureTestingModule({
            imports: [
                MatTabsModule,
                BrowserAnimationsModule,
                HttpClientModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatIconModule,
                MatTableModule,
                MatProgressSpinnerModule,
            ],
            declarations: [AdminVirtualPlayerDialogComponent, AdminVirtualPlayerTabComponent, AddVirtualPlayerFormComponent],
            providers: [
                FormBuilder,
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: MatSnackBar, useValue: matSnackBarSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminVirtualPlayerDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
