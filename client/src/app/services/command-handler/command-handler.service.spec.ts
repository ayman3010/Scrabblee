/* eslint-disable dot-notation */
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { CommandType, Orientation } from '@common/enums/enums';
import { Command, ExchangeCommand, PlaceCommand } from '@common/interfaces/command-interface';
import { BOARD_LENGTH, CommandHandlerService, VALID_COMMANDS_TYPE, VALID_ORIENTATIONS } from './command-handler.service';

describe('CommandHandlerService', () => {
    let service: CommandHandlerService;
    const validSenderName = 'John Scrabble';
    const validPlaceCommand: PlaceCommand = {
        commandType: CommandType.Place,
        placement: { coordH: 5, coordV: 5 },
        orientation: Orientation.Horizontal,
        lettersToPlace: 'oui',
        senderName: validSenderName,
    };

    const validPassCommand: Command = {
        commandType: CommandType.Pass,
        senderName: validSenderName,
    };

    const validExchangeCommand: ExchangeCommand = {
        commandType: CommandType.Exchange,
        letters: 'oui',
        senderName: validSenderName,
    };

    const validHintCommand: Command = {
        commandType: CommandType.Hint,
        senderName: validSenderName,
    };
    const validHelpCommand: Command = {
        commandType: CommandType.Help,
        senderName: validSenderName,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommandHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isCommand should return false if message does not starts with !', () => {
        const message = 'win';
        const returnValue = service.isCommand(message);
        expect(returnValue).toBeFalsy();
    });

    it('isCommand should return true if message starts with !', () => {
        const message = '!win';
        const returnValue = service.isCommand(message);
        expect(returnValue).toBeTruthy();
    });

    it('isValidCommandSyntax should return false if message is not a valid command', () => {
        const message = '!win';
        const returnValue = service.isValidCommandSyntax(message);
        expect(returnValue).toBeFalsy();
    });

    it('isValidCommandSyntax should return true if message is a valid command', () => {
        for (const command of VALID_COMMANDS_TYPE) {
            const returnValue = service.isValidCommandSyntax(command);
            expect(returnValue).toBeTruthy();
        }
    });

    it('validateOrientationSyntax should return false if message is not a valid command', () => {
        const orientation = 'z';
        const returnValue = service.validateOrientationSyntax(orientation);
        expect(returnValue).toBeFalsy();
    });

    it('isValidCommandSyntax should return true if message is a valid command', () => {
        for (const orientation of VALID_ORIENTATIONS) {
            const returnValue = service.validateOrientationSyntax(orientation);
            expect(returnValue).toBeTruthy();
        }
    });

    it('isStringNumber should return false if string is empty', () => {
        const stringInput = '';
        const returnValue = service.isStringNumber(stringInput);
        expect(returnValue).toBeFalsy();
    });

    it('isStringNumber should return false if string contains non numbers characters', () => {
        const stringInput = '69nice';
        const returnValue = service.isStringNumber(stringInput);
        expect(returnValue).toBeFalsy();
    });

    it('isStringNumber should return true if string contains only numbers characters', () => {
        const stringInput = '69';
        const returnValue = service.isStringNumber(stringInput);
        expect(returnValue).toBeTruthy();
    });

    it('isStringWord should return false if string is empty', () => {
        const stringInput = '';
        const returnValue = service.isStringWord(stringInput);
        expect(returnValue).toBeFalsy();
    });

    it('isStringWord should return false if string contains non letters characters', () => {
        const stringInput = '69nice';
        const returnValue = service.isStringWord(stringInput);
        expect(returnValue).toBeFalsy();
    });

    it('isStringWord should return true if string contains only letters characters', () => {
        const stringInput = 'nice';
        const returnValue = service.isStringWord(stringInput);
        expect(returnValue).toBeTruthy();
    });

    it('turnOrientationToEnum should return orientation horizontal if direction is h', () => {
        const direction = 'h';
        const expected = Orientation.Horizontal;
        const returnValue = service.turnOrientationToEnum(direction);
        expect(returnValue).toEqual(expected);
    });

    it('turnOrientationToEnum should return orientation vertical if direction is v', () => {
        const direction = 'v';
        const expected = Orientation.Vertical;
        const returnValue = service.turnOrientationToEnum(direction);
        expect(returnValue).toEqual(expected);
    });

    it('turnOrientationToEnum should return orientation vertical if direction is neither h or v', () => {
        const direction = '';
        const expected = Orientation.Vertical;
        const returnValue = service.turnOrientationToEnum(direction);
        expect(returnValue).toEqual(expected);
    });

    it('populateCommandObject should call getCommandType', () => {
        const commandArguments = [CommandType.Place, 'a11h', 'oui'];
        const spy = spyOn(service, 'getCommandType');
        service.populateCommandObject(commandArguments, validSenderName);
        expect(spy).toHaveBeenCalledWith(commandArguments[0]);
    });

    it('populateCommandObject should call getCommandPlace', () => {
        const commandArguments = [CommandType.Place, '', ''];
        const spy = spyOn(service, 'getCommandPlace').and.stub();
        service.populateCommandObject(commandArguments, validSenderName);
        expect(spy).toHaveBeenCalledWith(commandArguments, validSenderName);
    });

    it('populateCommandObject should call getCommandExchange', () => {
        const commandArguments = [CommandType.Exchange, ''];
        const spy = spyOn(service, 'getCommandExchange').and.stub();
        service.populateCommandObject(commandArguments, validSenderName);
        expect(spy).toHaveBeenCalledWith(commandArguments, validSenderName);
    });

    it('populateCommandObject should call getOneArgumentCommand', () => {
        const commandArguments = [CommandType.Pass];
        const spy = spyOn(service, 'getOneArgumentCommand').and.stub();
        service.populateCommandObject(commandArguments, validSenderName);
        expect(spy).toHaveBeenCalledWith(commandArguments, validSenderName);
    });

    it('populateCommandObject should call getOneArgumentCommand', () => {
        const commandArguments = [CommandType.Hint];
        const spy = spyOn(service, 'getOneArgumentCommand').and.stub();
        service.populateCommandObject(commandArguments, validSenderName);
        expect(spy).toHaveBeenCalledWith(commandArguments, validSenderName);
    });
    it('populateCommandObject should call getOneArgumentCommand', () => {
        const commandArguments = [CommandType.Help];
        const spy = spyOn(service, 'getOneArgumentCommand').and.stub();
        service.populateCommandObject(commandArguments, validSenderName);
        expect(spy).toHaveBeenCalledWith(commandArguments, validSenderName);
    });

    it('populateCommandObject should throw if number of arguments invalid for !placer', () => {
        const commandArguments = [CommandType.Place, ''];

        const spy = spyOn(service, 'isEnoughArguments').and.returnValue(false);
        const populateCommandObject = () => {
            service.populateCommandObject(commandArguments, validSenderName);
        };
        expect(populateCommandObject).toThrow();
        expect(spy).toHaveBeenCalledWith(commandArguments, 3);
    });

    it('populateCommandObject should throw if number of arguments invalid for !échanger', () => {
        const commandArguments = [CommandType.Exchange, '', ''];

        const spy = spyOn(service, 'isEnoughArguments').and.returnValue(false);
        const populateCommandObject = () => {
            service.populateCommandObject(commandArguments, validSenderName);
        };
        expect(populateCommandObject).toThrow();
        expect(spy).toHaveBeenCalledWith(commandArguments, 2);
    });

    it('populateCommandObject should throw if number of arguments invalid for !passer', () => {
        const commandArguments = [CommandType.Pass, ''];

        const spy = spyOn(service, 'isEnoughArguments').and.returnValue(false);
        const populateCommandObject = () => {
            service.populateCommandObject(commandArguments, validSenderName);
        };
        expect(populateCommandObject).toThrow();
        expect(spy).toHaveBeenCalledWith(commandArguments, 1);
    });

    it('populateCommandObject should throw if number of arguments invalid for !indice', () => {
        const commandArguments = [CommandType.Hint, ''];

        const spy = spyOn(service, 'isEnoughArguments').and.returnValue(false);
        const populateCommandObject = () => {
            service.populateCommandObject(commandArguments, validSenderName);
        };
        expect(populateCommandObject).toThrow();
        expect(spy).toHaveBeenCalledWith(commandArguments, 1);
    });

    it('getCommandType should throw an error if commandTypeInput is invalid', () => {
        const commandTypeInput = '!gagner';
        const getCommandType = () => {
            service.getCommandType(commandTypeInput);
        };
        expect(getCommandType).toThrow();
    });

    it('getCommandType should return commandType if commandTypeInput is valid', () => {
        const commandTypeInput = CommandType.Pass;
        const returnValue = service.getCommandType(commandTypeInput);
        expect(returnValue).toEqual(commandTypeInput);
    });

    it('getCommandType should call isValidCommandSyntax with commandInputType', () => {
        const commandTypeInput = CommandType.Pass;
        const spy = spyOn(service, 'isValidCommandSyntax').and.returnValue(true);
        service.getCommandType(commandTypeInput);
        expect(spy).toHaveBeenCalledWith(commandTypeInput);
    });

    it('getCommandPlace should throw an error if placement is illegal', () => {
        const commandArguments = [CommandType.Place, 'a15h', 'oui'];
        const getCommandPlace = () => {
            service.getCommandPlace(commandArguments, validSenderName);
        };
        expect(getCommandPlace).toThrow();
    });

    it('getCommandPlace should return command if placement is legal', () => {
        const commandArguments = [CommandType.Place, 'f6h', 'oui'];
        const returnValue = service.getCommandPlace(commandArguments, validSenderName);
        expect(returnValue).toEqual(validPlaceCommand);
    });

    it('getCommandPlace should call getOptionalOrientationString if word is a single letter', () => {
        const commandArguments = [CommandType.Place, 'f6h', 'o'];
        const spy = spyOn(service, 'getOptionalCoordinatesString').and.returnValue('f6h');
        service.getCommandPlace(commandArguments, validSenderName);
        expect(spy).toHaveBeenCalledWith('f6h');
    });

    it('getCommandPlace should call ...', () => {
        const commandArguments = [CommandType.Place, 'f6h', 'oui'];
        const getOrientationSpy = spyOn(service, 'getOrientation');
        const getPositionSpy = spyOn(service, 'getPosition');
        const getWordSpy = spyOn(service, 'getWord').and.returnValue('oui');
        const isLegalPlacementSpy = spyOn(service, 'isLegalPlacement').and.returnValue(true);
        service.getCommandPlace(commandArguments, validSenderName);
        expect(getOrientationSpy).toHaveBeenCalledWith('h');
        expect(getPositionSpy).toHaveBeenCalledWith('f6');
        expect(getWordSpy).toHaveBeenCalledWith('oui');
        expect(isLegalPlacementSpy).toHaveBeenCalled();
    });

    it('getCommandPlace should throw a SyntaxError if the word extracted from the command is over 7 characters long', () => {
        const commandArguments = [CommandType.Place, 'f6h', 'scrabble'];
        const getCommandPlace = () => {
            service.getCommandPlace(commandArguments, validSenderName);
        };
        expect(getCommandPlace).toThrow();
    });

    it('getOneArgumentCommand should return command with correct attributes', () => {
        const commandArguments = [CommandType.Pass];
        const returnValue = service.getOneArgumentCommand(commandArguments, validSenderName);
        expect(returnValue).toEqual(validPassCommand);
    });

    it('getOneArgumentCommand should return command with correct attributes', () => {
        const commandArguments = [CommandType.Help];
        const returnValue = service.getOneArgumentCommand(commandArguments, validSenderName);
        expect(returnValue).toEqual(validHelpCommand);
    });

    it('getOptionalOrientationString should return word with space at the end if last character is not a word', () => {
        const coordinatesInput = 'f6';
        const returnValue = service.getOptionalCoordinatesString(coordinatesInput);
        expect(returnValue).toEqual('f6 ');
    });

    it('getOptionalOrientationString should return word', () => {
        const coordinatesInput = 'f6h';
        const returnValue = service.getOptionalCoordinatesString(coordinatesInput);
        expect(returnValue).toEqual('f6h');
    });

    it('getOptionalOrientationString should call isStringWord', () => {
        const coordinatesInput = 'f6h';
        const spy = spyOn(service, 'isStringWord').and.returnValue(true);
        service.getOptionalCoordinatesString(coordinatesInput);
        expect(spy).toHaveBeenCalledWith('h');
    });

    it('getCommandExchange should return command with correct attributes', () => {
        const commandArguments = [CommandType.Exchange, 'oui'];
        const returnValue = service.getCommandExchange(commandArguments, validSenderName);
        expect(returnValue).toEqual(validExchangeCommand);
    });

    it('getOneArgumentCommand should return command with correct attributes', () => {
        const commandArguments = [CommandType.Hint];
        const returnValue = service.getOneArgumentCommand(commandArguments, validSenderName);
        expect(returnValue).toEqual(validHintCommand);
    });

    it('isLegalPlacement should call isLegalPlacement with endPosition of the letters', () => {
        const expectedEndPosition = { coordH: 7, coordV: 5 };
        const spy = spyOn(service, 'isInBounds').and.stub();
        service.isLegalPlacement(validPlaceCommand);
        expect(spy).toHaveBeenCalledWith(expectedEndPosition);
    });

    it('isLegalPlacement should call isLegalPlacement with endPosition of the letters', () => {
        const command: PlaceCommand = {
            commandType: CommandType.Place,
            placement: { coordH: 5, coordV: 5 },
            orientation: Orientation.Vertical,
            lettersToPlace: 'oui',
            senderName: validSenderName,
        };
        const expectedEndPosition = { coordH: 5, coordV: 7 };
        const spy = spyOn(service, 'isInBounds').and.stub();
        service.isLegalPlacement(command);
        expect(spy).toHaveBeenCalledWith(expectedEndPosition);
    });

    it('isInBounds should return false if out of bounds from the upper side', () => {
        const placement = { coordH: 1, coordV: -1 };
        const returnValue = service.isInBounds(placement);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return false if out of bounds from the lower side', () => {
        const placement = { coordH: 1, coordV: BOARD_LENGTH };
        const returnValue = service.isInBounds(placement);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return false if out of bounds from the left side', () => {
        const placement = { coordH: -1, coordV: 1 };
        const returnValue = service.isInBounds(placement);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return false if out of bounds from the lower side', () => {
        const placement = { coordH: BOARD_LENGTH, coordV: 1 };
        const returnValue = service.isInBounds(placement);
        expect(returnValue).toBeFalsy();
    });

    it('isInBounds should return true if in bounds', () => {
        const placement = { coordH: 1, coordV: 1 };
        const returnValue = service.isInBounds(placement);
        expect(returnValue).toBeTruthy();
    });

    it('isEnoughArguments should return false if command has not the correct number of arguments', () => {
        const commandArguments = ['', '', ''];
        const expectedNumberArguments = 2;
        const returnValue = service.isEnoughArguments(commandArguments, expectedNumberArguments);
        expect(returnValue).toBeFalsy();
    });

    it('isEnoughArguments should return true if command has the correct number of arguments', () => {
        const commandArguments = ['', ''];
        const expectedNumberArguments = 2;
        const returnValue = service.isEnoughArguments(commandArguments, expectedNumberArguments);
        expect(returnValue).toBeTruthy();
    });

    it('getPosition should throw an error if placement is illegal', () => {
        const positionInput = 'a369';
        const getPosition = () => {
            service.getPosition(positionInput);
        };
        expect(getPosition).toThrow();
    });

    it('getPosition should call getCoordH and getCoordV with correct parameters', () => {
        const positionInput = 'a12';
        const expectedPosition = { coordH: 12, coordV: 1 };
        const getCoordHSpy = spyOn(service, 'getCoordH').and.returnValue(expectedPosition.coordH);
        const getCoordVSpy = spyOn(service, 'getCoordV').and.returnValue(expectedPosition.coordV);
        const isInBoundsSpy = spyOn(service, 'isInBounds').and.returnValue(true);
        service.getPosition(positionInput);
        expect(getCoordHSpy).toHaveBeenCalledWith('12');
        expect(getCoordVSpy).toHaveBeenCalledWith('a');
        expect(isInBoundsSpy).toHaveBeenCalledWith(expectedPosition);
    });

    it('getOrientation should throw an error if orientationInput is invalid', () => {
        const orientationInput = 'z';
        const getOrientation = () => {
            service.getOrientation(orientationInput);
        };
        expect(getOrientation).toThrow();
    });

    it('getOrientation should call turnOrientationToEnum and validateOrientationSyntax', () => {
        const orientationInput = 'h';
        const turnOrientationToEnumSpy = spyOn(service, 'turnOrientationToEnum');
        const validateOrientationSyntaxSpy = spyOn(service, 'validateOrientationSyntax').and.returnValue(true);
        service.getOrientation(orientationInput);
        expect(turnOrientationToEnumSpy).toHaveBeenCalledWith(orientationInput);
        expect(validateOrientationSyntaxSpy).toHaveBeenCalledWith(orientationInput);
    });

    it('getCoordH should throw an error if coordHInput is invalid', () => {
        const coordHInput = '69nice';
        const getCoordH = () => {
            service.getCoordH(coordHInput);
        };
        expect(getCoordH).toThrow();
    });

    it('getCoordH should call isStringNumber', () => {
        const coordHInput = '1';
        const isStringNumberSpy = spyOn(service, 'isStringNumber').and.returnValue(true);
        service.getCoordH(coordHInput);
        expect(isStringNumberSpy).toHaveBeenCalledWith(coordHInput);
    });

    it('getCoordH should return the coordH as an index number', () => {
        const coordHInput = '1';
        const returnValue = service.getCoordH(coordHInput);
        expect(returnValue).toEqual(0);
    });

    it('getCoordV should throw an error if coordVInput is invalid', () => {
        const coordVInput = '69nice';
        const getCoordV = () => {
            service.getCoordV(coordVInput);
        };
        expect(getCoordV).toThrow();
    });

    it('getCoordV should call isStringWord', () => {
        const coordVInput = 'a';
        const isStringWordSpy = spyOn(service, 'isStringWord').and.returnValue(true);
        service.getCoordV(coordVInput);
        expect(isStringWordSpy).toHaveBeenCalledWith(coordVInput.toUpperCase());
    });

    it('getCoordV should return the coordV as an index number', () => {
        const coordVInput = 'a';
        const returnValue = service.getCoordV(coordVInput);
        expect(returnValue).toEqual(0);
    });

    it('getWord should throw an error if wordInput is invalid', () => {
        const wordInput = '69nice';
        const getWord = () => {
            service.getWord(wordInput);
        };
        expect(getWord).toThrow();
    });

    it('getWord should call isStringWord', () => {
        const wordInput = 'nIcE';
        const isStringWordSpy = spyOn(service, 'isStringWord').and.returnValue(true);
        service.getWord(wordInput);
        expect(isStringWordSpy).toHaveBeenCalledWith(wordInput);
    });

    it('commandStringToEnum() should return Place command type when it receives a !placer entry', () => {
        const commandType = '!placer';
        expect(service['commandStringToEnum'](commandType)).toEqual(CommandType.Place);
    });

    it('commandStringToEnum() should return Pass command type when it receives a !passer entry', () => {
        const commandType = '!passer';
        expect(service['commandStringToEnum'](commandType)).toEqual(CommandType.Pass);
    });

    it('commandStringToEnum() should return Exchange command type when it receives a !échanger entry', () => {
        const commandType = '!échanger';
        expect(service['commandStringToEnum'](commandType)).toEqual(CommandType.Exchange);
    });

    it('commandStringToEnum() should return default command type when it receives an empty entry', () => {
        const commandType = '';
        expect(service['commandStringToEnum'](commandType)).toEqual(CommandType.None);
    });
});
