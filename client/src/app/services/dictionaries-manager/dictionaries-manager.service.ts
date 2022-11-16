import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
export const UNKNOWN_ERROR_MESSAGE = 'Raison du problème inconnue';
export const BAD_GATEWAY_ERROR_MESSAGE = 'Connexion impossible à la base de données';
export const NO_RESPONSE_ERROR_MESSAGE = 'Connexion impossible au serveur';

@Injectable({
    providedIn: 'root',
})
export class DictionariesManagerService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly dictionariesManagerUrl: string = 'api/dictionaries';

    constructor(private readonly http: HttpClient) {}

    getDictionariesHeaders(): Observable<DictionaryHeader[] | Message> {
        return this.http
            .get<DictionaryHeader[] | Message>(`${this.baseUrl}/${this.dictionariesManagerUrl}/dictionariesList`)
            .pipe(catchError(this.handleError()));
    }

    downloadDictionary(dictionaryId: string): void {
        this.getDictionary(dictionaryId).subscribe((resp) => {
            const blob = new Blob([JSON.stringify(resp)], { type: 'json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = dictionaryId + '.json';
            link.click();
        });
    }

    removeDictionary(dictionaryId: string): Observable<Message> {
        return this.http.delete<Message>(`${this.baseUrl}/${this.dictionariesManagerUrl}/${dictionaryId}`).pipe(catchError(this.handleError()));
    }

    resetDictionaries(): Observable<Message> {
        return this.http.delete<Message>(`${this.baseUrl}/${this.dictionariesManagerUrl}`).pipe(catchError(this.handleError()));
    }

    addDictionary(dictionary: JSON): Observable<Message> {
        return this.http
            .post<Message>(`${this.baseUrl}/${this.dictionariesManagerUrl}/addDictionary`, { dictionary })
            .pipe(catchError(this.handleError()));
    }

    updateDictionary(dictionaryId: string, newTitle: string, newDescription: string): Observable<Message> {
        return this.http
            .patch<Message>(`${this.baseUrl}/${this.dictionariesManagerUrl}/modifyDictionary/${dictionaryId}`, {
                title: newTitle,
                description: newDescription,
            })
            .pipe(catchError(this.handleError()));
    }

    private handleError(): (error: Error) => Observable<Message> {
        return (error) => of(Tools.buildErrorMessage(error));
    }

    private getDictionary(dictionaryId: string): Observable<JSON | Message> {
        return this.http.get<Message | JSON>(`${this.baseUrl}/${this.dictionariesManagerUrl}/${dictionaryId}`).pipe(catchError(this.handleError()));
    }
}
