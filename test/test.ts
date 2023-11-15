import {argv, exit} from "process";
import {existsSync as fileExists, readFileSync as readFile, statSync as fileStat} from "fs";
import {
    ASTSyntax,
    ASTSyntaxes,
    buildBasicRepeatingTokenizer,
    buildCommentTokenizer,
    buildIgnorantTokenizer,
    buildRepeatingTokenizer,
    buildSymbolTokenizer,
    toAST,
    Tokenizers
} from "../index";
import {throwCliError} from "../src/Error";

const file = argv[2];

if (!file) {
    throwCliError("Error", "no input files");
    exit(1);
}

if (!fileExists(file)) {
    throwCliError("Error", "file not found");
    exit(1);
}

if (!fileStat(file).isFile()) {
    throwCliError("Error", "file format not recognized");
    exit(1);
}

const code = readFile(file, "utf-8");

const IntegerCharacters = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
];
const WordCharacters = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z", "ç", "ğ", "ü", "ş", "ı",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z", "Ç", "Ğ", "Ü", "Ş", "İ",

    "_", "$", "#", "@" // these sometimes count as words too!
];

const SymbolMap = {
    "!": "not",
    ">": "greater",
    "<": "less",
    "!=": "not-equal",
    ">=": "greater-equal",
    "<=": "less-equal",
    "==": "equals",
    "===": "exactly-equals",
    "&&": "and",
    "||": "or",

    "~": "bitwise-not",
    "^": "bitwise-xor",
    "&": "bitwise-and",
    "|": "bitwise-or",

    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
    "%": "modulo",

    "++": "set-add-1",
    "--": "set-subtract-1",

    "+=": "set-add",
    "-=": "set-subtract",
    "*=": "set-multiply",
    "/=": "set-divide",
    "%=": "set-modulo",

    "=": "set",

    "(": "open-parenthesis",
    ")": "close-parenthesis",
    "[": "open-square-bracket",
    "]": "close-square-bracket",
    "{": "open-curly-brace",
    "}": "close-curly-brace",

    ";": "semicolon",
};

const IgnoredCharacters = [
    " ", "\t", "\r", "\n"
];

const CommentMap = {
    "//": "\n",
    "/*": "*/"
};

Tokenizers.push(
    buildCommentTokenizer(CommentMap),
    buildSymbolTokenizer(SymbolMap),
    buildRepeatingTokenizer({
        type: "string",
        start: ["'", '"'],
        end: [".start"],
        escape: ["\\"],
        injectorStart: ["${"],
        injectorEnd: ["}"],
        fileEndThrow: true
    }),
    buildBasicRepeatingTokenizer("integer", IntegerCharacters),
    buildBasicRepeatingTokenizer("word", WordCharacters),
    buildIgnorantTokenizer(IgnoredCharacters)
);

/*ASTSyntaxes.push(
    new ASTSyntax("set_variable")
        .type("word", o => o.labelAs("name"))
        .type("set")
        .any(o => o
            .labelAs("value")
            .min(1).max(Infinity)
        )
        .type("semicolon")
);*/

ASTSyntaxes.push(
    ASTSyntax.fromText(
        "set_variable",
        "label:name,type:word  =  label:value,type:*,min:1,max:infinity  ;"
    )
);

const ast = toAST(code);

console.log(ast);