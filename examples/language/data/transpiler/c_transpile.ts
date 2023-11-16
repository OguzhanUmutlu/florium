import {referenceError, Statement, syntaxError, throwCliError, Token} from "../../../../src/index";
import {statementAST} from "../ast";

const varId: Record<string, number> = {};
const funcId: Record<string, number> = {};
const DefaultIgnore = ["line", "semicolon", "variable", "operator", "number"];

type VariableHolder = {
    name: string,
    id: number
};

type FunctionHolder = {
    name: string,
    id: number,
    variables: string[]
};

type Scope = {
    parent?: Scope,
    variables: Record<string, VariableHolder>,
    functions: Record<string, FunctionHolder>
};

function idToName(id: number, n: string) {
    return (id === 0 ? "" : id + "_") + n;
}

function findVariable(name: string, scope: Scope) {
    let parent = scope;
    while (true) {
        if (parent.variables[name]) return parent;
        if (!parent.parent) return null;
        parent = parent.parent;
    }
}

function findFunction(name: string, scope: Scope) {
    let parent = scope;
    while (true) {
        if (parent.functions[name]) return parent;
        if (!parent.parent) return null;
        parent = parent.parent;
    }
}

function backtraceVariables(scope: Scope) {
    let parent = scope;
    const vars: string[] = [];
    while (true) {
        vars.push(...Object.values(parent.variables).map(i => "v" + idToName(i.id, i.name)));
        if (!parent.parent) return vars;
        parent = parent.parent;
    }
}

export function transpileToC(actualCode: string, statements?: Statement[]) {
    const stList = statements ?? statementAST.read(actualCode);
    const functionS: string[] = [];
    const transpiled = transpileToCSub(actualCode, stList, functionS).map(i => "   " + i).join("\n");
    return `#include <stdio.h>
#define true 1
#define false 0
${functionS.map(i => "\n" + i + "\n").join("")}
int main() {
${transpiled}
   return 0;
}`;
}

export function transpileToCSub(actualCode: string, statements: Statement[], functionS: string[], parent: Scope = {
    variables: {},
    functions: {}
}, ignore = DefaultIgnore) {
    const scope: Scope = {
        parent, variables: {}, functions: {}
    };
    let code: string[] = [];

    function getVariableName(name: string) {
        const definedScope = findVariable(name, scope);
        if (!definedScope) {
            if (!(name in varId)) varId[name] = -1;
            const id = ++varId[name];
            scope.variables[name] = {name, id};
            return ["v" + idToName(id, name), false];
        }
        const id = definedScope.variables[name].id;
        return ["v" + idToName(id, name), true];
    }

    function getFunctionName(name: string) {
        const definedScope = findFunction(name, scope);
        if (!definedScope) return null;
        const id = definedScope.functions[name].id;
        return "f" + idToName(id, name);
    }

    const Expressions: Record<string, Function> = {
        set_variable(statement: Statement & { name: Token, expression: Token[] }) {
            const [varName, isDefined] = getVariableName(statement.name.value);
            return `${isDefined ? "" : "int "}${varName} = ${statement.expression.map(i => i.value).join(" ")}`;
        },
        inc_dec_variable(statement: Statement & { name: Token, changer: Token }) {
            return `${getVariableName(statement.name.value)[0]}${statement.changer.value}`;
        },
        function_call(statement: Statement & { name: Token, arguments: Token[] }) {
            const argS = statement.arguments.map(i => i.value).join(" ");
            const name = statement.name.value;
            if (name === "print" || name === "println") {
                let format = [];
                const args = <(Token & Record<any, any>)[]>statement.arguments;
                for (const arg of args) {
                    if (arg.expression.length === 1 && arg.expression[0].type === "string") {
                        format.push("%s");
                    } else format.push("%d");
                }
                return `printf("${format.join(" ")}${name === "println" ? "\\n" : ""}", ${argS})`;
            }
            const fnName = getFunctionName(name);
            if (!fnName) {
                referenceError(actualCode, statement.index, name + " is not defined");
            }
            return `${fnName}(${argS})`;
        },
    };

    const Statements: Record<string, Function> = {
        set_variable(statement: Statement & { name: Token, expression: Token[] }) {
            code.push(Expressions.set_variable(statement) + ";");
        },
        inc_dec_variable(statement: Statement & { name: Token, changer: Token }) {
            code.push(Expressions.inc_dec_variable(statement) + ";");
        },
        function_call(statement: Statement & { name: Token, arguments: Token[] }) {
            code.push(Expressions.function_call(statement) + ";");
        },
        if_statement(statement: Statement & { requirement: Token[], scope: Statement[] }) {
            code.push(`if (${statement.requirement.map(i => i.value).join(" ")}) {`);
            code.push(...transpileToCSub(actualCode, statement.scope, functionS, scope).map(i => "   " + i));
            code.push(`}`);
        },
        for_statement(statement: Statement & { instructions: Statement[], scope: Statement[] }) {
            const instructions: string[] = [];
            const def = <(Statement & Record<any, any>)[]>statement.instructions;
            let l = 0;
            instructions[0] = "";
            for (let i = 0; i < def.length; i++) {
                const t = def[i];
                for (let j = 0; j < t.expression.length; j++) {
                    const st = t.expression[j];
                    if (st.type === "set_variable") {
                        instructions[l] += Expressions.set_variable(st);
                        break;
                    }
                    if (st.type === "inc_dec_variable") {
                        instructions[l] += Expressions.inc_dec_variable(st);
                        break;
                    }
                    if (st.type === "function_call") {
                        instructions[l] += Expressions.function_call(st);
                        continue;
                    }
                    instructions[l] += st.value + (j === t.expression.length - 1 ? "" : " ");
                }
                l++;
                if (i !== def.length - 1) instructions[l] = "";
            }
            code.push(`for (${instructions.join("; ")}) {`);
            code.push(...transpileToCSub(actualCode, statement.scope, functionS, scope).map(i => "   " + i));
            code.push(`}`);
        },
        while_statement(statement: Statement & { requirement: Statement[], scope: Statement[] }) {
            code.push(`while (${statement.requirement.map(i => i.value).join("; ")}) {`);
            code.push(...transpileToCSub(actualCode, statement.scope, functionS, scope).map(i => "   " + i));
            code.push(`}`);
        },
        loop_statement(statement: Statement & { scope: Statement[] }) {
            code.push(`do {`);
            code.push(...transpileToCSub(actualCode, statement.scope, functionS, scope).map(i => "   " + i));
            code.push(`} while (1);`);
        },
        function_statement(statement: Statement & { name: Token, arguments: Token[], scope: Statement[] }) {
            const name = statement.name.value;
            if (scope.functions[name]) syntaxError(actualCode, statement.index, name + " has already been declared in the current scope", statement.value.length);
            if (!(name in funcId)) funcId[name] = -1;
            const id = ++funcId[name];
            const variables = backtraceVariables(scope);
            functionS.push(
                [
                    `int f${idToName(id, name)}(${variables.map(i => `int ${i}`).join(", ")}) {`,
                    ...transpileToCSub(actualCode, statement.scope, functionS, scope).map(i => "   " + i),
                    `}`
                ].join("\n")
            );
            scope.functions[name] = {
                name,
                id,
                variables
            };
        }
    };

    for (const st of statements) {
        if (ignore.includes(st.type)) continue;
        const fn = Statements[st.type];
        if (!fn) throwCliError("TranspileError", "Unexpected statement type: " + st.type);
        fn(st);
    }

    return code;
}