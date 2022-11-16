export enum GameType {
    LOG2990 = 'LOG2990',
    CLASSIC = 'CLASSIC',
}

export enum TitleMenuStep {
    GameTypeOptions = 0,
    PlayerModeOptions = 1,
    GameOptions = 2,
}

export enum Bonus {
    Base = 1,
    TripleLetter = 2,
    DoubleLetter = 3,
    DoubleWord = 4,
    TripleWord = 5,
}
export enum Orientation {
    Horizontal = 1,
    Vertical = 0,
}

export enum GameState {
    GameAccepted,
    GameRefused,
    GuestJoined,
    WaitingForGuest,
    GameAbandoned,
    GameOver,
}

export enum CommandType {
    Pass = '!passer',
    Exchange = '!échanger',
    Place = '!placer',
    Hint = '!indice',
    Reserve = '!réserve',
    Help = '!aide',
    None = '',
}

export enum Direction {
    Right = 1,
    Left = 2,
    Up = 3,
    Down = 4,
}
