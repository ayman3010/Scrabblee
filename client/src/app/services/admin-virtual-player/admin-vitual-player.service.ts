import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export const UNKNOWN_ERROR_MESSAGE = 'Raison du problème inconnue';
export const BAD_GATEWAY_ERROR_MESSAGE = 'Connexion impossible à la base de données';
export const NO_RESPONSE_ERROR_MESSAGE = 'Connexion impossible au serveur';

@Injectable({
    providedIn: 'root',
})
export class AdminVirtualPlayerService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly virtualPlayerURL: string = 'api/virtualPlayers';

    constructor(private readonly http: HttpClient) {}

    getVirtualPlayers(aiDifficulty: AiDifficulty): Observable<VirtualPlayer[] | Message> {
        return this.http
            .get<VirtualPlayer[] | Message>(`${this.baseUrl}/${this.virtualPlayerURL}/${aiDifficulty}`)
            .pipe(catchError(this.handleError()));
    }

    deleteVirtualPlayer(virtualPlayer: VirtualPlayer): Observable<Message> {
        return this.http
            .delete<Message>(`${this.baseUrl}/${this.virtualPlayerURL}/${virtualPlayer.virtualPlayerDifficulty}`, { body: virtualPlayer })
            .pipe(catchError(this.handleError()));
    }

    deleteAllVirtualPlayer(): Observable<Message> {
        return this.http.delete<Message>(`${this.baseUrl}/${this.virtualPlayerURL}`).pipe(catchError(this.handleError()));
    }

    addVirtualPlayer(virtualPlayer: VirtualPlayer): Observable<Message> {
        return this.http
            .post<Message>(`${this.baseUrl}/${this.virtualPlayerURL}/${virtualPlayer.virtualPlayerDifficulty}`, {
                virtualPlayer,
            })
            .pipe(catchError(this.handleError()));
    }

    updateVirtualPlayer(newVirtualPlayer: VirtualPlayer, virtualPlayer: VirtualPlayer): Observable<Message> {
        const updateDataList = [newVirtualPlayer, virtualPlayer];
        return this.http
            .put<Message>(`${this.baseUrl}/${this.virtualPlayerURL}/${virtualPlayer.virtualPlayerDifficulty}`, {
                updateDataList,
            })
            .pipe(catchError(this.handleError()));
    }

    private handleError(): (error: Error) => Observable<Message> {
        return (error) => of(Tools.buildErrorMessage(error));
    }
}
