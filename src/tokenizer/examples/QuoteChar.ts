import {Token, TokenizerFn} from "../../Tokenizer";

const CharQuotes = [
    "'"
];

export const QuoteCharTokenizer: TokenizerFn = function (code: string, index: Int32Array, tokens: Token[]) {
    const i = index[0];
    if (i < code.length - 3) return false;
    if (!CharQuotes.includes(code[i]) || !CharQuotes.includes(code[i + 2])) return false;
    const char = code[i + 1];
    tokens.push({type: "char", index: i, value: char});
    index[0] += 2;
    return true;
}