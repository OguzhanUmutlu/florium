import {Token, tokenize} from "./Tokenizer";
import {syntaxError, throwCliError} from "./Error";
import {ASTSingleSyntax, ASTSyntax, ASTSyntaxMatch, ASTSyntaxMode} from "./ast/builders/ASTSyntax";
import {groupTokens} from "./Grouper";

let astId = 0;
const astMap: Record<number, AST> = {};

export type Statement = Token & Partial<{
    [key: string]: Token | Token[]
}>;

export const ASTErrors = {
    unexpectedToken: "Unexpected token."
};

function checkASTMatches(token: Token, type: ASTSyntaxMode, matches: ASTSyntaxMatch[]) {
    if (type === "some") {
        for (const match of matches) {
            if ((token[match[0]] === match[1]) === match[2]) return true;
        }
        return false;
    } else {
        for (const match of matches) {
            if ((token[match[0]] !== match[1]) === match[2]) return false;
        }
        return true;
    }
}

function checkASTSyntax(
    code: string, tokens: Token[], index: number,
    syntax: ASTSingleSyntax, nextSyntax: ASTSingleSyntax | null
): null | [number, Token[]] {
    const result: Token[] = [];
    if (index >= tokens.length) {
        if (syntax.matches.some(i => i[0] === "_end" && i[2])) return [index, result];
        return null;
    }
    let untilAmount = 0;
    for (; index < tokens.length; index++) {
        const token = tokens[index];
        if (nextSyntax && checkASTMatches(token, nextSyntax.mode, nextSyntax.matches)) {
            untilAmount++;
            if (untilAmount >= nextSyntax.min && result.length >= syntax.min) break;
        } else untilAmount = 0;
        if (!checkASTMatches(token, syntax.mode, syntax.matches)) {
            if (result.length < syntax.min) return null;
            break;
        }
        result.push(token);
        if (syntax.max === result.length) {
            index++;
            break;
        }
    }
    if (syntax.jobId) {
        const ast = astMap[syntax.jobId];
        if (!ast) throwCliError("ASTError", "Invalid AST job id: " + syntax.jobId);
        return [index, result.map(i => {
            if (!i.extra || !i.extra.children) return i;
            return ast.read(code, i.extra.children, false);
        }).flat()];
    }
    if (syntax.jobAllId) { // warning: might cause infinite recursion if the type of the token is a grouped token list.
        const ast = astMap[syntax.jobAllId];
        if (!ast) throwCliError("ASTError", "Invalid AST job-all id: " + syntax.jobId);
        return [index, ast.read(code, result, false)];
    }
    return [index, result];
}

export class AST {
    syntaxes: ASTSyntax[] = [];
    id: number = ++astId;

    constructor() {
        astMap[this.id] = this;
    };

    read(code: string, tokens?: Token[], group: boolean = true) {
        if (!tokens) tokens = tokenize(code);
        if (group) tokens = groupTokens(code, tokens);
        const statements: Statement[] = [];
        for (let index = 0; index < tokens.length; index++) {
            const token = tokens[index];
            let indexFail = true;
            for (const {label, syntaxes} of this.syntaxes) {
                let fail = false;
                let tmpIndex = index;
                const resAst = <Statement>{
                    type: label,
                    index: token.index,
                    value: ""
                };
                for (let i = 0; i < syntaxes.length; i++) {
                    const syntax = syntaxes[i];
                    const res = checkASTSyntax(code, tokens, tmpIndex, syntax, syntaxes[i + 1]);
                    if (res === null) {
                        fail = true;
                        break;
                    }
                    tmpIndex = res[0];
                    if (syntax.label) resAst[syntax.label] = syntax.min === syntax.max && syntax.min === 1 && !syntax.jobId ? res[1][0] : res[1];
                }
                if (fail) continue;
                index = tmpIndex - 1;
                indexFail = false;
                const lastToken = tokens[index];
                resAst.value = code.substring(token.index, lastToken.index + lastToken.value.length);
                statements.push(resAst);
                break;
            }
            if (!indexFail) continue;
            syntaxError(code, token.index, ASTErrors.unexpectedToken, token.value.length);
        }
        return statements;
    };

    static loop(statements: Statement[], handlers: Record<string, Function>, deepness = 0) {
        for (const statement of statements) {
            const handler = handlers[statement.type];
            if (handler) handler(statement, deepness);
            const children = statement.children ?? statement.extra.children;
            if (children) AST.loop(children, handlers, deepness + 1);
        }
    };
}