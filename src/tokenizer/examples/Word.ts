import {buildBasicRepeatingTokenizer} from "../builders/RepeatingTokenizer";

const WordCharacters = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z", "ç", "ğ", "ü", "ş", "ı",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z", "Ç", "Ğ", "Ü", "Ş", "İ",

    "_", "$", "#", "@" // these sometimes count as words too!
];

export const WordTokenizer = buildBasicRepeatingTokenizer("word", WordCharacters);