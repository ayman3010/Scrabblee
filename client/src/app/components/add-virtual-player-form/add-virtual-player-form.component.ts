import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Tools } from '@app/classes/tools/tools';

@Component({
    selector: 'app-add-virtual-player-form',
    templateUrl: './add-virtual-player-form.component.html',
    styleUrls: ['./add-virtual-player-form.component.scss'],
})
export class AddVirtualPlayerFormComponent {
    @Input() disabled: boolean = false;
    @Output() addedPlayerNameChange = new EventEmitter<string>();

    @ViewChild('input', { static: true }) inputField: ElementRef;

    addVirtualPlayerForm: FormGroup;
    constructor(private formBuilder: FormBuilder) {
        this.addVirtualPlayerForm = this.formBuilder.group({
            newVirtualPlayerName: '',
        });
    }

    onSubmit(): void {
        if (!Tools.playerNameSizeCheck(this.addVirtualPlayerForm.value.newVirtualPlayerName)) return;
        this.addedPlayerNameChange.emit(this.addVirtualPlayerForm.value.newVirtualPlayerName);
        this.addVirtualPlayerForm.reset();
        this.inputField.nativeElement.focus();
    }
}
