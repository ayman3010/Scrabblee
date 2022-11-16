/* eslint-disable dot-notation */
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { GameType } from '@common/enums/enums';
import { GameHistoryClient, PlayerHistory } from '@common/interfaces/game-history';
import { GamesHistoryService } from './games-history.service';

describe('GamesHistoryService', () => {
    let httpMock: HttpTestingController;
    let service: GamesHistoryService;
    let baseUrl: string;
    let gamesHistoryUrl: string;

    const gameDuration = 120; // in seconds
    const errorMessage: Message = { title: 'Error', body: 'description' };

    const dateBegin: Date = new Date();
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const dateEnd: Date = new Date();
    dateEnd.setSeconds(dateEnd.getSeconds() + gameDuration);

    const firstPlayer: PlayerHistory = { name: 'John Scrabble', score: 69 };
    const secondPlayer: PlayerHistory = { name: 'Candice Scrabble', score: 420 };

    const testGameHistoryClassic: GameHistoryClient = {
        dateBegin,
        dateEnd,
        gameDuration,
        firstPlayer,
        secondPlayer,
        gameMode: GameType.CLASSIC,
        id: '1',
        wasAbandoned: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        spyOn(Tools, 'buildErrorMessage').and.returnValue(errorMessage);
        service = TestBed.inject(GamesHistoryService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
        gamesHistoryUrl = service['gamesHistoryUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected gamesHistory list (HttpClient called once)', () => {
        const expectedList: GameHistoryClient[] = [testGameHistoryClassic];

        service.getGamesHistory().subscribe((response: GameHistoryClient[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedList);
    });

    it('should handle http error safely on rejected connection', () => {
        service.getGamesHistory().subscribe((response: GameHistoryClient[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should handle http error safely on status 502', () => {
        service.getGamesHistory().subscribe((response: GameHistoryClient[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('should handle http error safely on unexpected status', () => {
        service.getGamesHistory().subscribe((response: GameHistoryClient[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('should return expected gamesHistory list (HttpClient called once)', () => {
        service.deleteGamesHistory().subscribe(() => {
            return;
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('should handle http error safely on rejected connection', () => {
        service.deleteGamesHistory().subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should handle http error safely on status 502', () => {
        service.deleteGamesHistory().subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('should handle http error safely on unexpected status', () => {
        service.deleteGamesHistory().subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${gamesHistoryUrl}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });
});
