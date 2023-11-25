import {Token, TokenizerFn} from "../../Tokenizer";

export function buildIgnorantTokenizer(characters: string[]): TokenizerFn {
    return function (code: string, index: Int32Array, _: Token[]) {
        return characters.includes(code[index[0]]);
    };
}