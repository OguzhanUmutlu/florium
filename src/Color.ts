export function reset(text: string) {
    return `\x1B[0m${text}\x1B[0m`;
}

export function red(text: string) {
    return `\x1B[31m${text}\x1B[39m`;
}

export function blue(text: string) {
    return `\x1B[34m${text}\x1B[39m`;
}