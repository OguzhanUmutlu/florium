import {
    buildBasicRepeatingTokenizer,
    buildCommentTokenizer,
    buildIgnorantTokenizer,
    buildRepeatingTokenizer,
    buildSymbolTokenizer,
    Tokenizers
} from "../../../src/index";
import SymbolMap from "./symbols";
import WordCharacters from "./letters";
import CommentMap from "./comment";
import IntegerCharacters from "./integer";
import IgnoredCharacters from "./ignored";

const WordAndIntegerCharacters = [...WordCharacters, ...IntegerCharacters];

export function useTokens() {
    Tokenizers.length = 0;
    Tokenizers.push(
        buildCommentTokenizer(CommentMap),
        buildSymbolTokenizer(SymbolMap),
        buildRepeatingTokenizer({
            type: "string",
            start: ["'"],
            end: ["'"],
            escape: ["\\"],
            fileEndThrow: true
        }),
        buildRepeatingTokenizer({
            type: "string",
            start: ['"'],
            end: ['"'],
            escape: ["\\"],
            injectorStart: ["{"],
            injectorEnd: ["}"],
            fileEndThrow: true
        }),
        buildBasicRepeatingTokenizer("integer", IntegerCharacters, IntegerCharacters),
        buildBasicRepeatingTokenizer("word", WordCharacters, WordAndIntegerCharacters),
        buildIgnorantTokenizer(IgnoredCharacters)
    );
}