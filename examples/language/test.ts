import {argv, exit} from "process";
import {existsSync as fileExists, readFileSync as readFile, statSync as fileStat, writeFileSync as writeFile} from "fs";
import {AST, throwCliError} from "../../src/index";
import {transpileToC} from "./data/transpiler/c_transpile";

const file = argv[2];
const outFile = argv[3];

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

if (!outFile) {
    throwCliError("Error", "no output files");
    exit(1);
}

if (fileExists(outFile) && !fileStat(outFile).isFile()) {
    throwCliError("Error", "file format not recognized");
    exit(1);
}

const code = readFile(file, "utf-8");

AST.fromFile("./data/language.syntax");
const cCode = transpileToC(code);

writeFile(outFile, cCode);