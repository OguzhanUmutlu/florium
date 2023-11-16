import {argv, exit} from "process";
import {existsSync as fileExists, readFileSync as readFile, statSync as fileStat} from "fs";
import {throwCliError} from "../src/Error";
import {statementAST} from "./data/ast";
import {useTokens} from "./data/tokens";

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

useTokens();
const read = statementAST.read(code);

console.log(read);