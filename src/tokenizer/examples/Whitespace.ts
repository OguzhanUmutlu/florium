import {Token, TokenizerFn} from "../../Tokenizer";

const WhitespaceCharacters: Set<string> = new Set([
    " ", "\r", "\t", "\n"
]);

export const WhitespaceTokenizer: TokenizerFn = function (code: string, index: Int32Array, _: Token[]) {
    return WhitespaceCharacters.has(code[index[0]]); // just ignores the character if it's a whitespace
}