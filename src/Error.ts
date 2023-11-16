import {exit} from "process";
import {blue, red} from "./Color";

export function throwCliError(type: string, error: string) {
    console.error(red(type + ": " + error));
    exit(1);
}

export function throwError(code: string, index: number, type: string, error: string, length: number = 1) {
    const lines = code.split("\n");
    let line = 0;
    let key = 0;
    for (let i = 0; i <= index; i++) {
        key++;
        if (code[i] === "\n") {
            line++;
            key = 0;
        }
    }
    for (let i = -2; i <= 2; i++) {
        const l = line + i;
        if (!(l in lines)) continue;
        if (i === 0) {
            console.error(red("> ") + blue((l + 1) + " | " + lines[l].substring(0, key - 1)) + red(lines[l].substring(key - 1, key - 1 + length) ?? "") + blue(lines[l].substring(key - 1 + length)));
            console.error(" ".repeat(key + l.toString().length + 4) + red("^".repeat(length)));
            // handle the case where the length of the error text gets to a \n, make the new lines red too
        } else {
            console.error(blue("  " + (l + 1) + " | " + lines[l]));
        }
    }
    console.error("\n" + red(type + ": " + error));
    exit(1);
}

export function syntaxError(code: string, index: number, error: string, length: number = 1) {
    throwError(code, index, "SyntaxError", error, length);
}

export function typeError(code: string, index: number, error: string, length: number = 1) {
    throwError(code, index, "TypeError", error, length);
}

export function referenceError(code: string, index: number, error: string, length: number = 1) {
    throwError(code, index, "ReferenceError", error, length);
}

export function runtimeError(code: string, index: number, error: string, length: number = 1) {
    throwError(code, index, "RuntimeError", error, length);
}

export function compileError(code: string, index: number, error: string, length: number = 1) {
    throwError(code, index, "CompileError", error, length);
}

export function assumptionError(code: string, index: number, error: string, length: number = 1) {
    throwError(code, index, "AssumptionError", error, length);
}