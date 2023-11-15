import {Token, Tokenizer} from "../../Tokenizer";

export function buildIgnorantTokenizer(characters: string[]): Tokenizer {
    return function (code: string, index: Int32Array, _: Token[]) {
        return characters.includes(code[index[0]]);
    };
}