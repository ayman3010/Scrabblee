export interface ReserveLetter {
    letter: string;
    nbOfCopies: number;
}
export interface Reserve {
    nbOfLetters: number;
    content: ReserveLetter[];
}
