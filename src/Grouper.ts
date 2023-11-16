import {GroupToken, Token} from "./Tokenizer";
import {syntaxError} from "./Error";

export const OpenBrackets: Record<string, string> = {
    "open-parenthesis": "close-parenthesis",
    "open-square-bracket": "close-square-bracket",
    "open-curly-brace": "close-curly-brace",
};

export const OpenBracketGroupNames: Record<string, string> = {
    "open-parenthesis": "group-parenthesis",
    "open-square-bracket": "group-square-bracket",
    "open-curly-brace": "group-curly-brace",
};

export function groupTokens(code: string, tokens: Token[]): Token[] {
    const main: GroupToken = {
        type: "group",
        index: 0,
        value: "",
        extra: {opener: <Token>(<unknown>null), children: []}
    };
    let parent: GroupToken = main;
    for (const token of tokens) {
        const closerT = OpenBrackets[token.type];
        if (closerT) {
            parent = {
                type: OpenBracketGroupNames[token.type],
                index: token.index,
                value: token.value,
                extra: {parent: parent === main ? undefined : parent, opener: token, closerT, children: []}
            };
            continue;
        }
        if (token.type === parent.extra.closerT) {
            delete parent.extra.closerT;
            parent.extra.closer = token;
            parent.value = code.substring(parent.extra.opener.index, token.index + token.value.length);
            const bk = parent.extra.parent ?? main;
            bk.extra.children.push(parent);
            parent = bk;
            continue;
        }
        parent.extra.children.push(token);
    }
    if (parent !== main) {
        syntaxError(code, parent.index, "Unfinished bracket.", 1);
    }
    return main.extra.children;
}