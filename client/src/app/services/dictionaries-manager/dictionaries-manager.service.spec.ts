/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Message } from '@app/classes/message';
import { Tools } from '@app/classes/tools/tools';
import { DictionaryHeader } from '@common/interfaces/dictionary-header';
import { DictionariesManagerService } from './dictionaries-manager.service';

describe('DictionariesManagerService', () => {
    let httpMock: HttpTestingController;
    let service: DictionariesManagerService;
    let baseUrl: string;
    let dictionariesUrl: string;
    const dictionaryId = 'test';
    const dictionary = '{"id": "test","title": "TestDico","description": "A valid dictionary", "words": ["couscous","tajine","pastilla"] }';
    const errorMessage: Message = { title: 'Error', body: 'description' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        spyOn(Tools, 'buildErrorMessage').and.returnValue(errorMessage);
        service = TestBed.inject(DictionariesManagerService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
        dictionariesUrl = service['dictionariesManagerUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getDictionariesHeaders should return expected dictionaries titles list (HttpClient called once)', () => {
        const expectedList: DictionaryHeader[] = [
            { id: 'Dictionnaire-francais', title: 'Dictionnaire-francais', description: 'Dictionnaire-francais' },
        ];

        service.getDictionariesHeaders().subscribe((response: DictionaryHeader[] | Message) => {
            expect(response).toEqual(expectedList);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/dictionariesList`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedList);
    });

    it('getDictionariesHeaders should handle http error safely on rejected connection', () => {
        service.getDictionariesHeaders().subscribe((response: DictionaryHeader[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/dictionariesList`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('getDictionariesHeaders should handle http error safely on status 502', () => {
        service.getDictionariesHeaders().subscribe((response: DictionaryHeader[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/dictionariesList`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('getDictionariesHeaders should handle http error safely on unexpected status', () => {
        service.getDictionariesHeaders().subscribe((response: DictionaryHeader[] | Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/dictionariesList`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('removeDictionary should return nothing (HttpClient called once)', () => {
        service.removeDictionary(dictionaryId).subscribe(() => {
            return;
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('removeDictionary should handle http error safely on rejected connection', () => {
        service.removeDictionary(dictionaryId).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('removeDictionary should handle http error safely on status 502', () => {
        service.removeDictionary(dictionaryId).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('removeDictionary should handle http error safely on unexpected status', () => {
        service.removeDictionary(dictionaryId).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('addDictionary should return nothing (HttpClient called once)', () => {
        service.addDictionary(JSON.parse(dictionary)).subscribe(() => {
            return;
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/addDictionary`);
        expect(req.request.method).toBe('POST');
    });

    it('addDictionary should handle http error safely on rejected connection', () => {
        service.addDictionary(JSON.parse(dictionary)).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/addDictionary`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('addDictionary should handle http error safely on status 502', () => {
        service.addDictionary(JSON.parse(dictionary)).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/addDictionary`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('addDictionary should handle http error safely on unexpected status', () => {
        service.addDictionary(JSON.parse(dictionary)).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/addDictionary`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('downloadDictionary should return the proper JSON dictionary file', () => {
        const a = {
            href: '',
            download: '',
            click: jasmine.createSpy('click').and.stub(),
        };
        spyOn(document, 'createElement').and.stub().and.returnValue(a);
        window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.stub().and.returnValue('a');
        service.downloadDictionary(dictionaryId);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('GET');
        req.flush(JSON.parse(dictionary));
    });

    it('downloadDictionary should handle http error safely on rejected connection', () => {
        const a = {
            href: '',
            download: '',
            click: jasmine.createSpy('click').and.stub(),
        };
        spyOn(document, 'createElement').and.stub().and.returnValue(a);
        window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.stub().and.returnValue('a');
        service.downloadDictionary(dictionaryId);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('downloadDictionary should handle http error safely on status 502', () => {
        const a = {
            href: '',
            download: '',
            click: jasmine.createSpy('click').and.stub(),
        };
        spyOn(document, 'createElement').and.stub().and.returnValue(a);
        window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.stub().and.returnValue('a');
        service.downloadDictionary(dictionaryId);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('downloadDictionary should handle http error safely on unexpected status', () => {
        const a = {
            href: '',
            download: '',
            click: jasmine.createSpy('click').and.stub(),
        };
        spyOn(document, 'createElement').and.stub().and.returnValue(a);
        window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.stub().and.returnValue('a');
        service.downloadDictionary(dictionaryId);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/${dictionaryId}`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('updateDictionary should call HTTP client', () => {
        const updatedDictionary: DictionaryHeader = { id: 'updated', title: 'updated', description: 'updated dictionary' };
        service.updateDictionary(updatedDictionary.id, updatedDictionary.title, updatedDictionary.description).subscribe(() => {
            return;
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/modifyDictionary/` + updatedDictionary.id);
        expect(req.request.method).toBe('PATCH');
        req.flush(updatedDictionary);
    });

    it('getDictionariesHeaders should handle http error safely on rejected connection', () => {
        const updatedDictionary: DictionaryHeader = { id: 'updated', title: 'updated', description: 'updated dictionary' };
        service.updateDictionary(updatedDictionary.id, updatedDictionary.title, updatedDictionary.description).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/modifyDictionary/` + updatedDictionary.id);
        expect(req.request.method).toBe('PATCH');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('getDictionariesHeaders should handle http error safely on status 502', () => {
        const updatedDictionary: DictionaryHeader = { id: 'updated', title: 'updated', description: 'updated dictionary' };
        service.updateDictionary(updatedDictionary.id, updatedDictionary.title, updatedDictionary.description).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/modifyDictionary/` + updatedDictionary.id);
        expect(req.request.method).toBe('PATCH');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('getDictionariesHeaders should handle http error safely on unexpected status', () => {
        const updatedDictionary: DictionaryHeader = { id: 'updated', title: 'updated', description: 'updated dictionary' };
        service.updateDictionary(updatedDictionary.id, updatedDictionary.title, updatedDictionary.description).subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}/modifyDictionary/` + updatedDictionary.id);
        expect(req.request.method).toBe('PATCH');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });

    it('resetDictionaries should return nothing (HttpClient called once)', () => {
        service.resetDictionaries().subscribe(() => {
            return;
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}`);
        expect(req.request.method).toBe('DELETE');
    });

    it('resetDictionaries handle http error safely on rejected connection', () => {
        service.resetDictionaries().subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('resetDictionaries should handle http error safely on status 502', () => {
        service.resetDictionaries().subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: HttpStatusCode.BadGateway });
    });

    it('resetDictionaries should handle http error safely on unexpected status', () => {
        service.resetDictionaries().subscribe((response: Message) => {
            expect(response).toEqual(errorMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/${dictionariesUrl}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('Random error occurred'), { status: 1 });
    });
});
