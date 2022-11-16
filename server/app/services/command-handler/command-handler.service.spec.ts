/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { CommandType, Orientation } from '@common/enums/enums';
import { Position, WordOnBoard } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CommandHandlerService, FROM_VIRTUAL_PLAYER } from './command-handler.service';

describe('command handler Service Test', () => {
    let commandHandler: CommandHandlerService;
    const validPlaceCommand: PlaceCommand = {
        commandType: CommandType.Place,
        placement: { coordH: 5, coordV: 5 },
        orientation: Orientation.Horizontal,

        lettersToPlace: 'oui',
        senderName: '',
    };

    before(async () => {
        commandHandler = new CommandHandlerService();
    });

    afterEach(async () => {
        sinon.restore();
    });

    it('takeOffBonusStar() takes off the bonus star', () => {
        const lettersToplace = 'P*';
        commandHandler['takeOffBonusStar'](lettersToplace);
        expect(commandHandler['takeOffBonusStar'](lettersToplace)).eql('P');
    });

    it('takeOffBonusStar() returns the same letter when there is no bonus star ', () => {
        const lettersToplace = 'le';
        commandHandler['takeOffBonusStar'](lettersToplace);
        expect(commandHandler['takeOffBonusStar'](lettersToplace)).eql('le');
    });

    it('deepCopyCOmmand() deep copies command', () => {
        const command: PlaceCommand = {
            senderName: '',
            commandType: CommandType.Place,

            lettersToPlace: 's',
            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Horizontal,
        };
        expect(commandHandler.deepCopyCommand(command)).eql(command);
    });

    it('isLegalCommand should call isLegalPosition and isInbound', () => {
        const spyLegal = sinon.spy(commandHandler as any, 'isLegalPosition');
        const spyBound = sinon.spy(commandHandler, 'isInBounds');

        commandHandler.isLegalCommand(validPlaceCommand);
        expect(spyLegal.called).to.be.true;
        expect(spyBound.called).to.be.true;
    });

    it('isInBounds should call isLegalPosition with endPosition of the letters', () => {
        const expectedEndPosition = { coordH: 7, coordV: 5 };
        const spy = sinon.spy(commandHandler as any, 'isLegalPosition');
        commandHandler.isInBounds(validPlaceCommand);
        expect(spy.calledWith(expectedEndPosition)).to.be.true;
    });

    it('isInBounds should call isInBounds with endPosition of the letters', () => {
        const command: PlaceCommand = {
            commandType: CommandType.Place,
            placement: { coordH: 5, coordV: 5 },

            orientation: Orientation.Vertical,
            lettersToPlace: 'oui',
            senderName: '',
        };
        const expectedEndPosition = { coordH: 5, coordV: 7 };
        const spy = sinon.spy(commandHandler as any, 'isLegalPosition');
        commandHandler.isInBounds(command);
        expect(spy.calledWith(expectedEndPosition));
    });

    it('isLegalPosition should return false if out of bounds from the upper side', () => {
        const position = { coordH: 1, coordV: -1 };
        const returnValue = commandHandler['isLegalPosition'](position);
        expect(returnValue).to.be.false;
    });

    it('isLegalPosition should return false if out of bounds from the lower side', () => {
        const position = { coordH: 1, coordV: MAX_BOARD_WIDTH + 1 };
        const returnValue = commandHandler['isLegalPosition'](position);
        expect(returnValue).to.be.false;
    });

    it('isLegalPosition should return false if out of bounds from the left side', () => {
        const position = { coordH: -1, coordV: 1 };
        const returnValue = commandHandler['isLegalPosition'](position);
        expect(returnValue).to.be.false;
    });

    it('isLegalPosition should return false if out of bounds from the lower side', () => {
        const position = { coordH: MAX_BOARD_WIDTH + 1, coordV: 1 };
        const returnValue = commandHandler['isLegalPosition'](position);
        expect(returnValue).of.be.false;
    });

    it('isInBounds should return true if in bounds', () => {
        const position = { coordH: 1, coordV: 1 };
        const returnValue = commandHandler['isLegalPosition'](position);
        expect(returnValue).to.be.true;
    });

    it('converPlaceCommandIntoString() returns a command inline with the right parameters (horizontal)', () => {
        const command: PlaceCommand = {
            senderName: '',
            commandType: CommandType.Place,

            lettersToPlace: 's',
            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Horizontal,
        };

        const commandInline = '!placer h8h s';
        expect(commandHandler.convertPlaceCommandIntoString(command)).eql(commandInline);
    });

    it('converPlaceCommandIntoString() returns a command inline with the right parameters (vertical)', () => {
        const command: PlaceCommand = {
            senderName: FROM_VIRTUAL_PLAYER,
            commandType: CommandType.Place,
            lettersToPlace: 's',

            placement: { coordV: 7, coordH: 7 },
            orientation: Orientation.Vertical,
        };

        const commandInline = '!placer h8v s';
        expect(commandHandler.convertPlaceCommandIntoString(command)).eql(commandInline);
    });

    it('generateCommand() generates the right command from the potential horizontal word ans the word on the board ', () => {
        const potentialWord: string[] = ['word`', 's'];
        const horizontalWord: WordOnBoard = { position: { coordV: 7, coordH: 7 }, word: 'word', orientation: Orientation.Horizontal };
        const expectedCommand: PlaceCommand = {
            senderName: FROM_VIRTUAL_PLAYER,
            commandType: CommandType.Place,
            lettersToPlace: 's',

            placement: { coordV: 7, coordH: 11 },
            orientation: Orientation.Horizontal,
        };
        expect(commandHandler.generatePlaceCommand(horizontalWord, potentialWord)).eql(expectedCommand);
    });

    it('containsBonusLetter() returns false', () => {
        expect(commandHandler.containsBonusLetter('aaaAb')).eql(true);
    });

    it('containsBonusLetter() returns false ', () => {
        expect(commandHandler.containsBonusLetter('aaa')).eql(false);
    });

    it('generateCommand() generates the right command from the potential vertical word ans the word on the board ', () => {
        const potentialWord: string[] = ['word`', 's'];
        const horizontalWord: WordOnBoard = { position: { coordV: 7, coordH: 7 }, word: 'word', orientation: Orientation.Vertical };
        const expectedCommand: PlaceCommand = {
            senderName: FROM_VIRTUAL_PLAYER,
            commandType: CommandType.Place,

            lettersToPlace: 's',
            placement: { coordV: 11, coordH: 7 },
            orientation: Orientation.Vertical,
        };
        expect(commandHandler.generatePlaceCommand(horizontalWord, potentialWord)).eql(expectedCommand);
    });

    it('generateCommand() generates the right command from the potential vertical word ans the word on the board ', () => {
        const potentialWord: string[] = ['w`', 'o', 'rd`', 's'];
        const horizontalWord: WordOnBoard = { position: { coordV: 7, coordH: 7 }, word: 'w', orientation: Orientation.Vertical };
        const expectedCommand: PlaceCommand = {
            senderName: FROM_VIRTUAL_PLAYER,
            commandType: CommandType.Place,
            lettersToPlace: 'os',
            placement: { coordV: 8, coordH: 7 },
            orientation: Orientation.Vertical,
        };
        expect(commandHandler.generatePlaceCommand(horizontalWord, potentialWord)).eql(expectedCommand);
    });

    it('specifyPLacement() modifies the position', () => {
        const position: Position = { coordH: 0, coordV: 0 };
        const previousCoordV = position.coordV;
        commandHandler['specifyPlacement'](0, Orientation.Vertical, position, 2);
        expect(position.coordV).eql(previousCoordV + 2);
        const previousCoordH = position.coordH;
        commandHandler['specifyPlacement'](1, Orientation.Horizontal, position, 2);
        expect(position.coordH).eql(previousCoordH - 1);
    });
});
