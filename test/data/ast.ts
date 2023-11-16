import {AST, ASTSyntax} from "../../src/index";

export const statementAST = new AST();
export const expressionAST = new AST();

const si = statementAST.id;
const ei = expressionAST.id;

statementAST.syntaxes.push(
    ASTSyntax.fromText(
        "define_variable",
        `let,const l:name,:word =,+=,-=,*=,/=,%=,++,-- l:value,:*,<:1,>:inf,j:${ei} ;,!:,\n`
    ),
    ASTSyntax.fromText(
        "if_statement",
        `if l:requirement,:group-parenthesis,j:${ei} l:scope,:group-curly-brace,j:${si}`
    )
);

expressionAST.syntaxes.push(
    ASTSyntax.fromText(
        "group",
        `l:children,:group-parenthesis,j:${expressionAST.id}`
    ),
    ASTSyntax.fromText(
        "comma",
        `l:v,c:` // c: is ,
    ),
    ASTSyntax.fromText(
        "operator",
        `+,-,*,/,%,~,|,&,^,||,&&,>,<,>=,<=,!,!=,==`
    ),
    ASTSyntax.fromText(
        "number",
        `:integer . :integer`
    ),
    ASTSyntax.fromText(
        "number",
        `. :integer`
    ),
    ASTSyntax.fromText(
        "number",
        `:integer`
    ),
    ASTSyntax.fromText(
        "set_variable",
        `l:name,:word =,+=,-=,*=,/=,%=,++,-- l:value,:*,<:1,>:inf,j:${ei} !:`
    ),
    ASTSyntax.fromText(
        "variable",
        `l:name,:word`
    ),
    ASTSyntax.fromText(
        "function_call",
        `l:name,:word l:arguments,:group-parenthesis,j:${ei} ;`
    )
);

statementAST.syntaxes.push(...expressionAST.syntaxes);