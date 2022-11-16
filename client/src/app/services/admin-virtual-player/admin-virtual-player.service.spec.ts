/* eslint-disable dot-notation */
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { VirtualPlayer } from '@common/interfaces/admin-virtual-player';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { AdminVirtualPlayerService } from './admin-vitual-player.service';

describe('AdminVirtualPlayerService', () => {
    let httpMock: HttpTestingController;
    let service: AdminVirtualPlayerService;
    let baseUrl: string;
    let virtualPlayerURL: string;

    const beginnerVirtualPlayer: VirtualPlayer = { name: 'John', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
    const expertVirtualPlayer: VirtualPlayer = { name: 'Candice', virtualPlayerDifficulty: AiDifficulty.EXPERT };
    const errorMessage: Message = { title: 'Error', body: 'description' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        spyOn(Tools, 'buildErrorMessage').and.returnValue(errorMessage);
        service = TestBed.inject(AdminVirtualPlayerService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
        virtualPlayerURL = service['virtualPlayerURL'];
        service.addVirtualPlayer(beginnerVirtualPlayer);
        service.addVirtualPlayer(expertVirtualPlayer);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected gamesHistory list (HttpClient called once)', () => {
        const expectedList: VirtualPlayer[] = [{ name: 'John', virtualPlayerDifficulty: AiDifficulty.BEGINNER }];

        service.getVirtualPlayers(AiDifficulty.BEGINNER).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedList);
    });

    it('should handle http error safely on rejected connection', () => {
        service.getVirtualPlayers(AiDifficulty.BEGINNER).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should handle http error safely on status 502', () => {
        service.getVirtualPlayers(AiDifficulty.BEGINNER).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('should handle http error safely on unexpected status', () => {
        service.getVirtualPlayers(AiDifficulty.BEGINNER).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('should handle http error safely on unexpected status', () => {
        const newVirtualPLayer = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };

        service.updateVirtualPlayer(newVirtualPLayer, beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('PUT');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('should return expected virtualPlayer list (HttpClient called once)', () => {
        const newVirtualPLayer = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const expectedList: VirtualPlayer[] = [newVirtualPLayer];

        service.updateVirtualPlayer(newVirtualPLayer, beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('PUT');
    });

    it('should return expected virtualPlayer list (HttpClient called once)', () => {
        const newVirtualPLayer = { name: 'Louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const expectedList: VirtualPlayer[] = [newVirtualPLayer, beginnerVirtualPlayer];

        service.addVirtualPlayer(newVirtualPLayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('POST');
    });

    it('should return expected virtualPlayer list (HttpClient called once)', () => {
        const expectedList: VirtualPlayer[] = [];

        service.deleteVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('should return expected virtualPlayer list (HttpClient called once)', () => {
        const expectedList: VirtualPlayer[] = [];

        service.deleteAllVirtualPlayer().subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('should return expected virtualPlayer list (HttpClient called once)', () => {
        const newVirtualPlayer = { name: 'louis', virtualPlayerDifficulty: AiDifficulty.BEGINNER };
        const expectedList: VirtualPlayer[] = [beginnerVirtualPlayer, newVirtualPlayer];

        service.deleteVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('should handle http error safely on rejected connection', () => {
        service.deleteVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should handle http error safely on rejected connection', () => {
        service.addVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should handle http error safely on status 502', () => {
        service.deleteVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('should handle http error safely on status 502', () => {
        service.addVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('should handle http error safely on unexpected status', () => {
        service.deleteVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('should handle http error safely on unexpected status', () => {
        service.addVirtualPlayer(beginnerVirtualPlayer).subscribe((response: VirtualPlayer[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${virtualPlayerURL}/${AiDifficulty.BEGINNER}`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });
});
