import {Token, TokenizerFn} from "../../Tokenizer";

export function buildCommentTokenizer(characters: Record<string, string>): TokenizerFn {
    return function (code: string, index: Int32Array, _: Token[]) {
        const startIndex = index[0];
        for (const multi in characters) {
            if (code.substring(startIndex, startIndex + multi.length) !== multi) continue;
            index[0] += multi.length - 1;
            const completer = characters[multi];
            const len = code.length;
            let endCompletion = 0;
            while (true) {
                const i = ++index[0];

                if (i >= len) return true;

                const char = code[i];

                if (char === completer[endCompletion]) {
                    if (++endCompletion === completer.length) return true;
                } else endCompletion = 0;
            }
        }
        return false;
    }
}