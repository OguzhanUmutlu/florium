import {Token, Tokenizer} from "../../Tokenizer";

 const SymbolCharacters: Record<string, string> = {
    "!": "not",
    ">": "greater",
    "<": "less",
    "!=": "not-equal",
    ">=": "greater-equal",
    "<=": "less-equal",
    "==": "equals",
    "===": "exactly-equals",
    "&&": "and",
    "||": "or",

    "~": "bitwise-not",
    "^": "bitwise-xor",
    "&": "bitwise-and",
    "|": "bitwise-or",

    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
    "%": "modulo",

    "++": "set-add-1",
    "--": "set-subtract-1",

    "+=": "set-add",
    "-=": "set-subtract",
    "*=": "set-multiply",
    "/=": "set-divide",
    "%=": "set-modulo",

    "=": "set",

    "(": "open-parenthesis",
    ")": "close-parenthesis",
    "[": "open-square-bracket",
    "]": "close-square-bracket",
    "{": "open-curly-brace",
    "}": "close-curly-brace",

    ";": "semicolon",
};

const symNames = Object.keys(SymbolCharacters).sort((a, b) => b.length - a.length);

export const SymbolTokenizer: Tokenizer = function (code: string, index: Int32Array, tokens: Token[]) {
    const startIndex = index[0];
    for (const sym of symNames) {
        const rest = code.substring(startIndex, startIndex + sym.length);
        if (rest === sym) {
            index[0] += sym.length - 1;
            tokens.push({type: SymbolCharacters[sym], index: startIndex, value: sym});
            return true;
        }
    }
    return false;
}