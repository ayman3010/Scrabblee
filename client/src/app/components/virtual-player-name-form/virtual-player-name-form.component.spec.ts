import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Tools } from '@app/classes/tools/tools';
import { VirtualPlayerNameFormComponent } from './virtual-player-name-form.component';

describe('VirtualPlayerNameFormComponent', () => {
    let fixture: ComponentFixture<VirtualPlayerNameFormComponent>;
    let component: VirtualPlayerNameFormComponent;
    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [MatIconModule],
            providers: [FormBuilder],
            declarations: [VirtualPlayerNameFormComponent],
        });

        fixture = TestBed.createComponent(VirtualPlayerNameFormComponent);
        component = fixture.componentInstance;
    });

    it('should be able to create component instance', () => {
        expect(component).toBeDefined();
    });

    it('onSubmit should call playerNameChange.emit.close with gameOptionsForm when the name provided in the form is valid size-wise', () => {
        const submittedName = 'John';
        component.virtualPlayerForm.value.newVirtualPlayerName = submittedName;
        spyOn(Tools, 'playerNameSizeCheck').and.returnValue(true);
        const spy = spyOn(component.playerNameChange, 'emit');
        component.onSubmit();

        expect(spy).toHaveBeenCalled();
    });

    it('onSubmit should call playerNameSizeCheck', () => {
        const spy = spyOn(Tools, 'playerNameSizeCheck');

        component.onSubmit();

        expect(spy).toHaveBeenCalled();
    });

    it('ngOnInit should call focus', () => {
        const spy = spyOn(component.inputField.nativeElement, 'focus');

        component.ngOnInit();

        expect(spy).toHaveBeenCalled();
    });
});
