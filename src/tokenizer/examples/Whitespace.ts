import {Token, Tokenizer} from "../../Tokenizer";

const WhitespaceCharacters: Set<string> = new Set([
    " ", "\r", "\t", "\n"
]);

export const WhitespaceTokenizer: Tokenizer = function (code: string, index: Int32Array, _: Token[]) {
    return WhitespaceCharacters.has(code[index[0]]); // just ignores the character if it's a whitespace
}