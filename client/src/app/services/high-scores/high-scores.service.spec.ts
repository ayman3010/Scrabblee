/* eslint-disable dot-notation */
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { GameType } from '@common/enums/enums';
import { HighScoreClient } from '@common/interfaces/high-score';
import { HighScoresService } from './high-scores.service';

describe('HighScoresService', () => {
    let httpMock: HttpTestingController;
    let service: HighScoresService;
    let baseUrl: string;
    let highScoresUrl: string;

    const gameMode: GameType = GameType.CLASSIC;
    const errorMessage: Message = { title: 'Error', body: 'description' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        spyOn(Tools, 'buildErrorMessage').and.returnValue(errorMessage);
        service = TestBed.inject(HighScoresService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
        highScoresUrl = service['highScoresUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected highScores list (HttpClient called once)', () => {
        const expectedList: HighScoreClient[] = [{ names: ['Bob'], score: 4 }];

        service.getHighScores(gameMode).subscribe((response: HighScoreClient[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${highScoresUrl}/${gameMode}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedList);
    });

    it('should handle http error safely on rejected connection', () => {
        service.getHighScores(gameMode).subscribe((response: HighScoreClient[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${highScoresUrl}/${gameMode}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should handle http error safely on status 502', () => {
        service.getHighScores(gameMode).subscribe((response: HighScoreClient[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${highScoresUrl}/${gameMode}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('should handle http error safely on unexpected status', () => {
        service.getHighScores(gameMode).subscribe((response: HighScoreClient[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${highScoresUrl}/${gameMode}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('should return expected virtualPlayer list (HttpClient called once)', () => {
        service.deleteAllHighScores().subscribe(() => {
            return;
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${highScoresUrl}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('should handle http error safely on status 502', () => {
        service.deleteAllHighScores().subscribe((response: HighScoreClient[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${highScoresUrl}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });
});
