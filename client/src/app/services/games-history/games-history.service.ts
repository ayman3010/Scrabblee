import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { GameHistoryClient } from '@common/interfaces/game-history';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export const UNKNOWN_ERROR_MESSAGE = 'Raison du problème inconnue';
export const BAD_GATEWAY_ERROR_MESSAGE = 'Connexion impossible à la base de données';
export const NO_RESPONSE_ERROR_MESSAGE = 'Connexion impossible au serveur';

@Injectable({
    providedIn: 'root',
})
export class GamesHistoryService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly gamesHistoryUrl: string = 'api/gamesHistory';

    constructor(private readonly http: HttpClient) {}

    getGamesHistory(): Observable<GameHistoryClient[] | Message> {
        return this.http.get<GameHistoryClient[] | Message>(`${this.baseUrl}/${this.gamesHistoryUrl}`).pipe(catchError(this.handleError()));
    }

    deleteGamesHistory(): Observable<Message> {
        return this.http.delete<Message>(`${this.baseUrl}/${this.gamesHistoryUrl}`).pipe(catchError(this.handleError()));
    }

    private handleError(): (error: Error) => Observable<Message> {
        return (error) => of(Tools.buildErrorMessage(error));
    }
}
