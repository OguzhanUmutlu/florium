import {
    buildBasicRepeatingTokenizer,
    buildCommentTokenizer,
    buildIgnorantTokenizer,
    buildRepeatingTokenizer,
    buildSymbolTokenizer,
    CharacterList,
    Tokenizer
} from "../../../src/index";
import SymbolMap from "./symbols";

export const tokenizer = new Tokenizer().add(
    buildCommentTokenizer({
        "//": "\n",
        "/*": "*/"
    }),
    buildSymbolTokenizer(SymbolMap),
    buildRepeatingTokenizer({
        type: "string",
        start: ["'", '"'],
        end: [".start"],
        escape: ["\\"],
        fileEndThrow: true
    }),
    buildRepeatingTokenizer({
        type: "template_string",
        start: ["`"],
        end: ["`"],
        escape: ["\\"],
        injectorStart: ["${"],
        injectorEnd: ["}"],
        fileEndThrow: true
    }),
    buildBasicRepeatingTokenizer("integer", CharacterList.Integer),
    buildBasicRepeatingTokenizer("word", CharacterList.Word, CharacterList.WordAndInteger),
    buildIgnorantTokenizer([
        " ", "\t", "\r"
    ])
);