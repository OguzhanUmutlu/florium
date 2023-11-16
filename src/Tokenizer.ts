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
