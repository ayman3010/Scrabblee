import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Tools } from '@app/classes/tools/tools';

@Component({
    selector: 'app-vp-name-form',
    templateUrl: './virtual-player-name-form.component.html',
    styleUrls: ['./virtual-player-name-form.component.scss'],
})
export class VirtualPlayerNameFormComponent implements OnInit {
    @Input() defaultName: string = '';
    @Output() playerNameChange = new EventEmitter<string>();
    @Output() cancel = new EventEmitter<void>();

    @ViewChild('input', { static: true }) inputField: ElementRef;

    virtualPlayerForm: FormGroup;
    constructor(private formBuilder: FormBuilder) {
        this.virtualPlayerForm = this.formBuilder.group({
            virtualPlayerName: this.defaultName,
        });
    }

    ngOnInit() {
        this.inputField.nativeElement.focus();
    }

    onSubmit(): void {
        if (Tools.playerNameSizeCheck(this.virtualPlayerForm.value.virtualPlayerName))
            this.playerNameChange.emit(this.virtualPlayerForm.value.virtualPlayerName);
    }
}
