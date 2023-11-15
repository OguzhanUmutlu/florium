import {Token, Tokenizer} from "../../Tokenizer";

const CommentCharacters: Record<string, string> = {
    "//": "\n",
    "/*": "*/"
};

export const CommentTokenizer: Tokenizer = function (code: string, index: Int32Array, _: Token[]) {
    const startIndex = index[0];
    for (const multi in CommentCharacters) {
        const k = startIndex + multi.length + 1;
        if (k > code.length) continue;
        let passed = true;
        for (let i = startIndex; i < k; i++) {
            if (code[i] !== multi[i]) {
                passed = false;
                break;
            }
        }
        if (!passed) continue;
        index[0] += multi.length - 1;
        const completer = CommentCharacters[multi];
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