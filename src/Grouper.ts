import {GroupToken, Token} from "./Tokenizer";
import {syntaxError} from "./Error";

export const OpenBrackets = {
    "open-parenthesis": "close-parenthesis",
    "open-square-bracket": "close-square-bracket",
    "open-curly-brace": "close-curly-brace",
};

export function groupTokens(code: string, tokens: Token[]): Token[] {
    const main: GroupToken = {type: "group", index: 0, value: "", extra: {opener: null, children: []}};
    let parent: GroupToken = main;
    for (const token of tokens) {
        const closerT = OpenBrackets[token.type];
        if (closerT) {
            parent = {
                type: "group",
                index: token.index,
                value: token.value,
                extra: {parent: parent === main ? undefined : parent, opener: token, closerT, children: []}
            };
            continue;
        }
        if (token.type === parent.extra.closerT) {
            delete parent.extra.closerT;
            parent.extra.closer = token;
            parent.value += token.value;
            const bk = parent.extra.parent ?? main;
            bk.extra.children.push(parent);
            parent = bk;
            continue;
        }
        parent.value += token.value;
        parent.extra.children.push(token);
    }
    if (parent !== main) {
        syntaxError(code, parent.index, "Unfinished bracket.", 1);
    }
    return main.extra.children;
}