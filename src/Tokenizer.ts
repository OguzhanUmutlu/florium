import {syntaxError} from "./Error";

export type GroupToken = {
    type: string,
    index: number,
    value: string,
    extra: {
        parent?: GroupToken,
        opener: Token,
        closer?: Token,
        children: Token[],
        closerT?: any
    },
    _end?: any
};
export type Token = GroupToken | {
    type: string,
    value: string,
    index: number,
    extra?: any,
    _end?: any
};
export type Tokenizer = (code: string, index: Int32Array, tokens: Token[]) => boolean;

export type character = string; // with a length of 1

export const Tokenizers: Tokenizer[] = [];

export const TokenizerErrors = {
    unexpectedToken: "Unexpected token."
};

const IntegerCharacters = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
];
const WordCharacters = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z", "ç", "ğ", "ü", "ş", "ı",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z", "Ç", "Ğ", "Ü", "Ş", "İ"
];

export const CharacterList = {
    Integer: IntegerCharacters,
    Word: WordCharacters,
    WordAndInteger: [...WordCharacters, ...IntegerCharacters]
};

export function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    for (let index = new Int32Array([0]); index[0] < code.length; index[0]++) {
        if (!Tokenizers.some(tokenizer => tokenizer(code, index, tokens))) {
            syntaxError(code, index[0], TokenizerErrors.unexpectedToken);
        }
    }
    return tokens/*.map(i => {
        const index = i.index;
        delete i.index;
        return i;
    })*/;
}
