import {character, Token, Tokenizer, Tokenizers} from "../../Tokenizer";
import {syntaxError} from "../../Error";

type RepeatingTokenizerOptions = {
    type: string,
    start: string[],
    allowed?: null | (".start" | string)[],
    disallowed?: null | (".start" | character)[],
    end?: null | (".start" | string)[],
    escape?: null | (".start" | character)[],
    injectorStart?: null | (".start" | string)[],
    injectorEnd?: null | (".start" | ".injectorStart" | string)[],
    maxLength?: number,
    ignore?: boolean,

    allowThrow?: null | true | string,
    disallowThrow?: null | true | string
    fileEndThrow?: null | true | string,
    fileEndInjectorThrow?: null | true | string,
    maxLengthThrow?: null | true | string,
};

const DEFAULT_ERRORS = {
    allow: "Unexpected disallowed token.",
    disallow: "Unexpected disallowed token.",
    fileEnd: "Unexpected end of file.",
    fileEndInjector: "Unexpected end of file after an open injector token.",
    maxLength: "The group size limit has been reached." // you should totally put the number in it if you use this
};

function checkSubstrHelper(code: string, i: number, list: string[]): [number, string] | null {
    for (const c of list) {
        if (code.substring(i, i + c.length) === c) {
            return [i + c.length - 1, c];
        }
    }
    return null;
}

export function buildRepeatingTokenizer(gotOptions: RepeatingTokenizerOptions): Tokenizer {
    const options = JSON.parse(JSON.stringify(gotOptions));

    if (!("maxLength" in options) || options.maxLength === null) options.maxLength = Infinity;

    const allowThrow = options.allowThrow === true ? DEFAULT_ERRORS.allow : options.allowThrow;
    const disallowThrow = options.disallowThrow === true ? DEFAULT_ERRORS.disallow : options.disallowThrow;
    const fileEndThrow = options.fileEndThrow === true ? DEFAULT_ERRORS.fileEnd : options.fileEndThrow;
    const fileEndInjectorThrow = (!("fileEndInjectorThrow" in options) || options.fileEndInjectorThrow === true) ?
        DEFAULT_ERRORS.fileEndInjector :
        options.fileEndInjectorThrow;
    const maxLengthThrow = options.maxLengthThrow === true ? DEFAULT_ERRORS.maxLength : options.maxLengthThrow;

    let allowHasStart = false;
    let disallowHasStart = false;
    let endHasStart = false;
    let escapeHasStart = false;
    let injectStartHasStart = false;
    let injectEndHasStart = false;
    let injectEndHasInjectorStart = false;

    if (options.allowed) {
        allowHasStart = options.allowed.includes(".start");
        options.allowed = options.allowed.filter((i: string) => i !== ".start");
        if (allowHasStart) options.allowed.splice(0, 0, ".start");
    }

    if (options.disallowed) {
        disallowHasStart = options.disallowed.includes(".start");
        options.disallowed = options.disallowed.filter((i: string) => i !== ".start");
        if (disallowHasStart) options.disallowed.splice(0, 0, ".start");
    }

    if (options.end) {
        endHasStart = options.end.includes(".start");
        options.end = options.end.filter((i: string) => i !== ".start");
        if (endHasStart) options.end.splice(0, 0, ".start");
    }

    if (options.escape) {
        escapeHasStart = options.escape.includes(".start");
        options.escape = options.escape.filter((i: string) => i !== ".start");
        if (escapeHasStart) options.escape.splice(0, 0, ".start");
    }

    if (options.injectorStart) {
        injectStartHasStart = options.injectorStart.includes(".start");
        options.injectorStart = options.injectorStart.filter((i: string) => i !== ".start");
        if (injectStartHasStart) options.injectorStart.splice(0, 0, ".start");
    }

    if (options.injectorEnd) {
        injectEndHasStart = options.injectorEnd.includes(".start");
        injectEndHasInjectorStart = options.injectorEnd.includes(".injectorStart");
        options.injectorEnd = options.injectorEnd.filter((i: string) => i !== ".start" && i !== ".injectorStart");
        if (injectEndHasInjectorStart) options.injectorEnd.splice(0, 0, ".injectorStart");
        if (injectEndHasStart) options.injectorEnd.splice(0, 0, ".start");
    }

    const hasAllow = options.allowed && options.allowed.length;
    const hasDisallow = options.disallowed && options.disallowed.length;
    const hasEnd = options.end && options.end.length;
    const hasEscape = options.escape && options.escape.length;
    const hasInjectorStart = options.injectorStart && options.injectorStart.length;
    const hasInjectorEnd = options.injectorEnd && options.injectorEnd.length;

    return function (code: string, index: Int32Array, tokens: Token[]) {
        const startIndex = index[0];
        const startChar = code[startIndex];

        let startFound = false;
        for (const st of options.start) {
            if (code.substring(startIndex, startIndex + st.length) === st) {
                startFound = true;
                index[0] += st.length - 1;
                break;
            }
        }
        if (!startFound) return false;

        if (allowHasStart) options.allowed[0] = startChar;
        if (disallowHasStart) options.disallowed[0] = startChar;
        if (endHasStart) options.end[0] = startChar;
        if (escapeHasStart) options.escape[0] = startChar;
        if (injectStartHasStart) options.injectorStart[0] = startChar;
        if (injectEndHasStart) options.injectorStart[0] = startChar;

        const len = code.length;
        let result = startChar;
        let escape = false;
        let pushStartIndex = startIndex;

        while (true) {
            const i = ++index[0];

            if (i >= len) {
                if (fileEndThrow) {
                    syntaxError(
                        code, startIndex,
                        fileEndThrow,
                        index[0] - startIndex
                    );
                }
                break;
            }

            const char = code[i];

            if (hasEnd && options.end.includes(char) && !escape) {
                result += char;
                break;
            }

            if (hasAllow) {
                const m = checkSubstrHelper(code, i, options.allowed);
                if (!m) {
                    if (allowThrow) syntaxError(
                        code, startIndex,
                        allowThrow,
                        index[0] - startIndex
                    );
                    index[0]--;
                    break;
                } else {
                    index[0] = m[0];
                    result += m[1];
                    continue;
                }
            }

            if (hasDisallow) {
                const m = checkSubstrHelper(code, i, options.disallowed);
                if (m) {
                    if (disallowThrow) syntaxError(
                        code, startIndex,
                        disallowThrow,
                        index[0] - startIndex
                    );
                    index[0]--;
                    break;
                }
            }

            if (result.length === options.maxLength) {
                if (maxLengthThrow) syntaxError(
                    code, startIndex,
                    maxLengthThrow,
                    index[0] - startIndex
                );
                index[0]--;
                break;
            }

            if (hasInjectorStart) {
                const m = checkSubstrHelper(code, i, options.injectorStart);
                if (m) {
                    index[0] = m[0];
                    result += m[1];
                    tokens.push({type: options.type, index: pushStartIndex, value: result});
                    while (true) {
                        const j = ++index[0];

                        if (j >= len) {
                            if (fileEndInjectorThrow) {
                                syntaxError(
                                    code, startIndex,
                                    fileEndInjectorThrow,
                                    index[0] - startIndex
                                );
                            }
                            return true;
                        }

                        const char = code[j];

                        if (hasInjectorEnd) {
                            let checks = false;
                            for (const c of options.injectorEnd) {
                                if (code.substring(j, j + c.length) === c) {
                                    checks = true;
                                    break;
                                }
                            }
                            if (checks) {
                                result = char;
                                pushStartIndex = j;
                                break;
                            }
                        }

                        if (!Tokenizers.some(tokenizer => tokenizer(code, index, tokens))) {
                            syntaxError(code, index[0], "Unexpected token: " + code[index[0]]);
                        }
                    }
                    continue;
                }
            }

            if (hasEscape) {
                const m = checkSubstrHelper(code, i, options.escape);
                if (m) {
                    index[0] = m[0];
                    escape = !escape;
                    result += m[1];
                    continue;
                } else escape = false;
            } else escape = false;

            result += char;
        }
        if (!options.ignore) tokens.push({type: options.type, index: pushStartIndex, value: result});
        return true;
    };
}

export function buildBasicRepeatingTokenizer(type: string, start: string[], step: string[]): Tokenizer {
    return function (code: string, index: Int32Array, tokens: Token[]) {
        const startIndex = index[0];
        const startChar = code[startIndex];
        if (!start.includes(startChar)) return false;
        const len = code.length;
        let result = startChar;
        while (true) {
            const i = ++index[0];

            if (i >= len) {
                break;
            }

            const char = code[i];

            if (!step.includes(char)) {
                index[0]--;
                break;
            }

            result += char;
        }
        tokens.push({type, index: startIndex, value: result});
        return true;
    };
}