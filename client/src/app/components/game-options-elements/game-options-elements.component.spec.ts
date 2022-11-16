/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AvailableGamesComponent } from '@app/components/available-games/available-games.component';
import { GameOptionsFormComponent } from '@app/components/game-options-form/game-options-form.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { FormatTime } from '@app/pipes/format-time/format-time.pipe';
import { GameType } from '@common/enums/enums';
import { GameOptionsElementsComponent } from './game-options-elements.component';

describe('GameOptionsElementsComponent', () => {
    let component: GameOptionsElementsComponent;
    let fixture: ComponentFixture<GameOptionsElementsComponent>;

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

    const data = GameType.CLASSIC;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                AppRoutingModule,
                MatTableModule,
                MatTabsModule,
                BrowserAnimationsModule,
                MatFormFieldModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                MatDialogModule,
                MatRadioModule,
                ReactiveFormsModule,
                FormsModule,
            ],
            declarations: [GameOptionsElementsComponent, AvailableGamesComponent, GameOptionsFormComponent, FormatTime],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                FormBuilder,
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOptionsElementsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call gameOptionsDialog.close() when close() is called', () => {
        const spy = spyOn(component.gameOptionsDialog, 'close');

        component.close();
        expect(spy).toHaveBeenCalled();
    });
});
