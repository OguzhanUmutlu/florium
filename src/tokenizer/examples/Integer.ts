import {buildBasicRepeatingTokenizer} from "../builders/RepeatingTokenizer";

const IntegerCharacters = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
];

export const IntegerTokenizer = buildBasicRepeatingTokenizer("integer", IntegerCharacters);