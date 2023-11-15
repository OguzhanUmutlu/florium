import {Token, Tokenizer} from "../../Tokenizer";
import {syntaxError} from "../../Error";

const StringQuotes = new Set([
    "'", '"'
]);

const StringEscapeCharacters = new Set([
    "\\"
]);

export const StringTokenizer: Tokenizer = function (code: string, index: Int32Array, tokens: Token[]) {
    const startIndex = index[0];
    const start = code[startIndex];
    if (!StringQuotes.has(start)) return false;
    const len = code.length;
    let result = start;
    let escape = false;
    while (true) {
        const i = ++index[0];

        if (i >= len) {
            syntaxError(
                code, startIndex,
                "Unexpected end of the file. Expected the string ending character (" + start + ").",
                result.length
            );
            break;
        }

        const char = code[i];

        if (char === "\n") {
            syntaxError(
                code, startIndex,
                "Unexpected end of the line. Expected the string ending character (" + start + ").",
                result.length
            );
            break;
        }

        if (char === start && !escape) {
            result += start;
            break;
        }

        if (StringEscapeCharacters.has(char)) escape = !escape;
        else escape = false;

        result += char;
    }
    tokens.push({type: "string", index: startIndex, value: result});
    return true;
}