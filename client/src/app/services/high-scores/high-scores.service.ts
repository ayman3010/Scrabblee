import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { GameType } from '@common/enums/enums';
import { HighScoreClient } from '@common/interfaces/high-score';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export const UNKNOWN_ERROR_MESSAGE = 'Raison du problème inconnue';
export const BAD_GATEWAY_ERROR_MESSAGE = 'Erreur de routage';
export const NO_RESPONSE_ERROR_MESSAGE = 'Connexion impossible au serveur';

@Injectable({
    providedIn: 'root',
})
export class HighScoresService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly highScoresUrl: string = 'api/highScores';

    constructor(private readonly http: HttpClient) {}

    getHighScores(gameMode: GameType): Observable<HighScoreClient[] | Message> {
        return this.http.get<HighScoreClient[] | Message>(`${this.baseUrl}/${this.highScoresUrl}/${gameMode}`).pipe(catchError(this.handleError()));
    }

    deleteAllHighScores(): Observable<HighScoreClient[] | Message> {
        return this.http.delete<HighScoreClient[] | Message>(`${this.baseUrl}/${this.highScoresUrl}`).pipe(catchError(this.handleError()));
    }

    private handleError(): (error: Error) => Observable<Message> {
        return (error) => of(Tools.buildErrorMessage(error));
    }
}
