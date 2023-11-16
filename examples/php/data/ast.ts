import {AST, ASTSyntax} from "../../../src/index";

export const statementAST = new AST();
export const expressionAST = new AST();
export const splitByCommaAST = new AST();
export const splitBySemicolonAST = new AST();

const si = statementAST.id;
const ei = expressionAST.id;
const splCi = splitByCommaAST.id;
const splSi = splitBySemicolonAST.id;

statementAST.syntaxes.push(
    ASTSyntax.fromText(
        "set_variable",
        `l:name,:word =,+=,-=,*=,/=,%= l:expression,:*,>:1,<:inf,j:${ei} ;,!:,\n`
    ),
    ASTSyntax.fromText(
        "if_statement",
        `if l:requirement,:group-parenthesis,j:${ei} l:scope,:group-curly-brace,j:${si}`
    ),
    ASTSyntax.fromText(
        "if_statement",
        `if l:requirement,:group-parenthesis,j:${ei} l:scope,:*,>:1,<:inf,ja:${ei} ;,!:,\n`
    ),
    ASTSyntax.fromText(
        "else_statement",
        `else l:scope,:group-curly-brace,j:${si}`
    ),
    ASTSyntax.fromText(
        "elseif_statement",
        `else if l:requirement,:group-parenthesis,j:${ei} l:scope,:group-curly-brace,j:${si}`
    ),
    ASTSyntax.fromText(
        "for_statement",
        `for l:instructions,:group-parenthesis,j:${splSi} l:scope,:group-curly-brace,j:${si}`
    ),
    ASTSyntax.fromText(
        "while_statement",
        `while l:requirement,:group-parenthesis,j:${ei} l:scope,:group-curly-brace,j:${si}`
    ),
    ASTSyntax.fromText(
        "loop_statement",
        `loop l:scope,:group-curly-brace,j:${si}`
    )/*,
    ASTSyntax.fromText(
        "function_statement",
        `fn l:name,:word l:arguments,:group-parenthesis,j:${splCi} l:scope,:group-curly-brace,j:${si}`
    )*/
);

expressionAST.syntaxes.push(
    ASTSyntax.fromText(
        "semicolon",
        `;`
    ),
    ASTSyntax.fromText(
        "line",
        `\n`
    ),
    ASTSyntax.fromText(
        "comma",
        `l:v,c:` // c: is ,
    ),
    ASTSyntax.fromText(
        "string",
        `:string`
    ),
    ASTSyntax.fromText(
        "group",
        `l:children,:group-parenthesis,j:${expressionAST.id}`
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
        "function_call",
        `l:name,:word l:arguments,:group-parenthesis,j:${splCi}`
    ),
    ASTSyntax.fromText(
        "set_variable",
        `l:name,:word =,+=,-=,*=,/=,%= l:expression,:*,>:1,<:inf,j:${ei} ;,!:,\n`
    ),
    ASTSyntax.fromText(
        "inc_dec_variable",
        `l:name,:word l:changer,++,-- ;,!:,\n`
    ),
    ASTSyntax.fromText(
        "variable",
        `:word`
    )
);

splitByCommaAST.syntaxes.push(
    ASTSyntax.fromText(
        "split",
        `l:expression,:*,>:1,<:inf,ja:${ei} c:,!:`
    )
);

splitBySemicolonAST.syntaxes.push(
    ASTSyntax.fromText(
        "split",
        `l:expression,:*,>:1,<:inf,ja:${si} ;,!:`
    )
);

statementAST.syntaxes.push(...expressionAST.syntaxes);