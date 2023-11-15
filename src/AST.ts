import {Token, tokenize} from "./Tokenizer";
import {syntaxError} from "./Error";
import {ASTSingleSyntax, ASTSyntax, ASTSyntaxMatch, ASTSyntaxMode} from "./ast/builders/ASTSyntax";

export type Statement = { type: string } & {
    [key: string]: Token | Token[]
};

export const ASTSyntaxes: ASTSyntax[] = [];

export const ASTErrors = {
    unexpectedToken: "Unexpected token."
};

function checkASTMatches(token: Token, type: ASTSyntaxMode, matches: ASTSyntaxMatch[]) {
    if (type === "some") {
        for (const match of matches) {
            if (token[match[0]] === match[1]) return true;
        }
        return false;
    } else {
        for (const match of matches) {
            if (token[match[0]] !== match[1]) return false;
        }
        return true;
    }
}

function checkASTSyntax(tokens: Token[], index: number, syntax: ASTSingleSyntax, nextSyntax: ASTSingleSyntax | null): null | [number, Token[]] {
    const result: Token[] = [];
    let untilAmount = 0;
    for (; index < tokens.length; index++) {
        const token = tokens[index];
        if (nextSyntax && checkASTMatches(token, nextSyntax.mode, nextSyntax.matches)) {
            untilAmount++;
            if (untilAmount >= nextSyntax.min && result.length >= syntax.min) return [index, result];
        } else untilAmount = 0;
        if (!checkASTMatches(token, syntax.mode, syntax.matches)) {
            if (result.length < syntax.min) return null;
            return [index, result];
        }
        result.push(token);
        if (syntax.max === result.length) {
            return [index + 1, result];
        }
    }
    return [tokens.length - 1, result];
}

export function toAST(code: string, tokens?: Token[]) {
    if (!tokens) tokens = tokenize(code);
    const statements: Statement[] = [];
    for (let index = 0; index < tokens.length; index++) {
        let indexFail = true;
        for (const {label, syntaxes} of ASTSyntaxes) {
            let fail = false;
            let tmpIndex = index;
            const resAst = <Statement>{
                type: label
            };
            for (let i = 0; i < syntaxes.length; i++) {
                const syntax = syntaxes[i];
                const res = checkASTSyntax(tokens, tmpIndex, syntax, syntaxes[i + 1]);
                if (res === null) {
                    fail = true;
                    break;
                }
                tmpIndex = res[0];
                if (syntax.label) resAst[syntax.label] = syntax.min === syntax.max && syntax.min === 1 ? res[1][0] : res[1];
            }
            if (fail) continue;
            index = tmpIndex;
            indexFail = false;
            statements.push(resAst);
            break;
        }
        if (!indexFail) continue;
        const token = tokens[index];
        console.log(token)
        syntaxError(code, token.index, ASTErrors.unexpectedToken, token.value.length);
    }
    return statements;
}