import {Token, Tokenizer} from "../../Tokenizer";

export function buildSymbolTokenizer(characters: Record<string, string>): Tokenizer {
    const symNames = Object.keys(characters).sort((a, b) => b.length - a.length);
    return function (code: string, index: Int32Array, tokens: Token[]) {
        const startIndex = index[0];
        for (const sym of symNames) {
            const rest = code.substring(startIndex, startIndex + sym.length);
            if (rest === sym) {
                index[0] += sym.length - 1;
                tokens.push({type: characters[sym], index: startIndex, value: sym});
                return true;
            }
        }
        return false;
    };
}