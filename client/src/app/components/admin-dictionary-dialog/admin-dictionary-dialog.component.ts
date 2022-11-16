import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Message } from '@app/classes/message';
import { CONFLICT_ERROR_MESSAGE, Tools } from '@app/classes/tools/tools';
import { DictionariesManagerService } from '@app/services/dictionaries-manager/dictionaries-manager.service';
import { DEFAULT_DICTIONARY_ID, MAX_DESCRIPTION_DICTIONARY_LENGTH, MAX_TITLE_DICTIONARY_LENGTH } from '@common/constants/dictionary-constants';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
export const EMPTY_MESSAGE = { title: '', body: '' };
export const NO_EDITABLE = -1;

@Component({
    selector: 'app-dictionary-dialog',
    templateUrl: 'admin-dictionary-dialog.component.html',
    styleUrls: ['admin-dictionary-dialog.component.scss'],
})
export class AdminDictionaryDialogComponent implements OnInit {
    dictionaryList: DictionaryHeader[];
    ancientDescription: string;
    ancientTitle: string;

    errorMessage: Message = EMPTY_MESSAGE;
    shortLink: string = '';
    isLoading: boolean = false;
    file: File;
    editable: number = NO_EDITABLE;
    displayedColumns: string[] = ['download', 'dictionary', 'edit', 'delete'];
    readonly defaultDictionaryTitle: string = DEFAULT_DICTIONARY_ID;
    readonly maxTitleDictionaryLength: number = MAX_TITLE_DICTIONARY_LENGTH;
    readonly maxDescriptionDictionaryLength: number = MAX_DESCRIPTION_DICTIONARY_LENGTH;

    constructor(
        public adminDictionaryDialog: MatDialogRef<AdminDictionaryDialogComponent>,
        private dictionariesManager: DictionariesManagerService,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.errorMessage = EMPTY_MESSAGE;
        this.isLoading = true;
        this.editable = NO_EDITABLE;
        this.getDictionaries();
    }

    restore(): void {
        if (this.editable === NO_EDITABLE || this.editable >= this.dictionaryList.length) return;

        this.dictionaryList[this.editable].description = this.ancientDescription;
        this.dictionaryList[this.editable].title = this.ancientTitle;
        this.editable = NO_EDITABLE;
    }

    modifyDictionary(id: string, newTitle: string, newDescription: string): void {
        this.dictionariesManager.updateDictionary(id, newTitle, newDescription).subscribe((result: Message) => {
            this.notify(result);
            this.ngOnInit();
        });
    }

    getDictionaries(): void {
        this.dictionariesManager.getDictionariesHeaders().subscribe((result: DictionaryHeader[] | Message) => {
            if (Tools.isListOfType<DictionaryHeader>(result, 'description')) {
                this.dictionaryList = result as DictionaryHeader[];
            } else if (Tools.isTypeOf<Message>(result, 'body')) this.errorMessage = result;
            this.isLoading = false;
        });
    }

    removeDictionary(dictionaryId: string): void {
        this.dictionariesManager.removeDictionary(dictionaryId).subscribe((result: Message) => {
            this.notify(result);
            this.ngOnInit();
        });
    }

    downloadDictionary(dictionaryId: string): void {
        this.dictionariesManager.downloadDictionary(dictionaryId);
    }

    onChange(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        if (target.files) this.file = target.files[0];
    }

    onUpload(): void {
        const reader: FileReader = new FileReader();
        reader.readAsText(this.file, 'UTF-8');

        reader.onload = () => {
            this.dictionariesManager.addDictionary(JSON.parse(reader.result as string)).subscribe((result: Message) => {
                this.notify(result);
                this.ngOnInit();
            });
        };
    }

    get showError(): boolean {
        return !!this.errorMessage.title;
    }

    close(): void {
        this.adminDictionaryDialog.close();
    }

    private notify(message: Message): void {
        this.snackbar.dismiss();
        if (message && message.body === CONFLICT_ERROR_MESSAGE)
            this.snackbar.open(message.title + ' : Un dictionnaire du même nom existe déjà', 'Ok');
        else if (message && message.title) this.snackbar.open(message.title + ' : ' + message.body, 'Ok');
        else this.snackbar.open('Opération effectuée avec succès', 'Ok');
    }
}
