import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Tools } from '@app/classes/tools/tools';
import { AddVirtualPlayerFormComponent } from './add-virtual-player-form.component';

describe('AddVirtualPlayerFormComponent', () => {
    let fixture: ComponentFixture<AddVirtualPlayerFormComponent>;
    let component: AddVirtualPlayerFormComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [ReactiveFormsModule, FormsModule, MatIconModule, MatFormFieldModule],
            providers: [FormBuilder, NgControl],
            declarations: [AddVirtualPlayerFormComponent],
        });

        fixture = TestBed.createComponent(AddVirtualPlayerFormComponent);
        component = fixture.componentInstance;
    });

    it('should be able to create component instance', () => {
        expect(component).toBeDefined();
    });

    it('onSubmit should call gameOptionsDialog.close with gameOptionsForm when the name provided in the form is valid size-wise', () => {
        const submittedName = 'John Scrabble';
        component.addVirtualPlayerForm.value.newVirtualPlayerName = submittedName;
        const spy = spyOn(component.addedPlayerNameChange, 'emit');
        component.onSubmit();

        expect(spy).toHaveBeenCalled();
    });

    it('onSubmit should call gameOptionsDialog.close with gameOptionsForm when the name provided in the form is valid size-wise', () => {
        const spy = spyOn(Tools, 'playerNameSizeCheck');

        component.onSubmit();

        expect(spy).toHaveBeenCalled();
    });
});
