import {Token} from "../../Tokenizer";
import {throwCliError} from "../../Error";

export type ASTSyntaxMatch<T extends keyof Token = keyof Token> = [T, Token[T], boolean];

export type ASTSyntaxMode = "some" | "every";

export type ASTSingleSyntax = {
    label?: null | string,
    matches: ASTSyntaxMatch[],
    min: number,
    max: number,
    mode: ASTSyntaxMode,
    jobId: null | number,
    jobAllId: null | number
};

export type ASTBuilder = {
    data: ASTSingleSyntax,
    labelAs(label: string): ASTBuilder,
    min(min: number): ASTBuilder,
    max(max: number): ASTBuilder,
    mode(mode: ASTSyntaxMode): ASTBuilder
};

export type ASTBuilderFN = null | ((builder: ASTBuilder) => ASTBuilder);

function makeHelper(data: ASTSingleSyntax): ASTBuilder {
    return {
        data,
        labelAs(label: string) {
            this.data.label = label;
            return this;
        },
        min(min: number) {
            this.data.min = min;
            return this;
        },
        max(max: number) {
            this.data.max = max;
            return this;
        },
        mode(mode: ASTSyntaxMode) {
            this.data.mode = mode;
            return this;
        }
    };
}

export class ASTSyntax {
    syntaxes: ASTSingleSyntax[] = [];
    label: string;

    constructor(label: string) {
        this.label = label;
    };

    static fromText(label: string, text: string): ASTSyntax {
        // Note: Do not use non-word characters in token type names.

        // All of these define basic variable definition(example: a = 10;):
        // "type:word value:= type:* value:;"
        // "t:word v:= t:* v:;"
        // "t:word = t:* ;"
        // ":word = t:* ;"

        // Note: If you want to use the value " ", then do "space:" or "s:" (which is a confused face)
        // Note: If you want to use the value ":", then do "colon:" or "d:" (which is a smiley face)
        // Note: If you want to use the value ",", then do "comma:" or "c:" (which is a cute happy face)

        // Setting the mode: "mode:some" or "mode:every"
        // Setting the min: "min:1"
        // Setting the max: "max:1" or "max:inf" or "max:infinity"
        // Setting the label: "label:hello" or "l:hello"

        const astSyntax = new ASTSyntax(label);

        text.split(" ").forEach(i => {
            if (!i) return;
            const spl = i.split(",");
            const k = ASTSyntax.any(null, "some");
            for (const s of spl) {
                const colonSpl = s.split(":");
                const orIsIt = colonSpl[0] === "!" || colonSpl[0][0] !== "!";
                if (colonSpl.length === 1) {
                    k.matches.push(["value", colonSpl[0], true]);
                    continue;
                }
                if (["end", "!"].includes(colonSpl[0])) {
                    k.matches.push(["_end", "", orIsIt]);
                    continue;
                }
                if (["value", "v"].includes(colonSpl[0])) {
                    k.matches.push(["value", colonSpl[1], orIsIt]);
                    continue;
                }
                if (["space", "s"].includes(colonSpl[0])) {
                    k.matches.push(["value", " ", orIsIt]);
                    continue;
                }
                if (["colon", "d"].includes(colonSpl[0])) {
                    k.matches.push(["value", ":", orIsIt]);
                    continue;
                }
                if (["comma", "c"].includes(colonSpl[0])) {
                    k.matches.push(["value", ",", orIsIt]);
                    continue;
                }
                if (colonSpl[0] === "mode") {
                    if (!["some", "every"].includes(colonSpl[1])) throwCliError("ASTError", "Invalid: " + i + " instruction: " + s);
                    k.mode = <ASTSyntaxMode>colonSpl[1];
                    continue;
                }
                if (["min", ">", ">="].includes(colonSpl[0])) {
                    const v = parseInt(colonSpl[1]);
                    if (isNaN(v) || v < 0) throwCliError("ASTError", "Invalid: " + i + " instruction: " + s);
                    k.min = v;
                    continue;
                }
                if (["max", "<", "<="].includes(colonSpl[0])) {
                    const v = ["inf", "infinity"].includes(colonSpl[1].toLowerCase()) ? Infinity : parseInt(colonSpl[1]);
                    if (isNaN(v) || v < 0) throwCliError("ASTError", "Invalid: " + i + " instruction: " + s);
                    k.max = v;
                    continue;
                }
                if (["label", "l"].includes(colonSpl[0])) {
                    k.label = colonSpl[1];
                    continue;
                }
                if (["job", "j"].includes(colonSpl[0])) {
                    const v = ["inf", "infinity"].includes(colonSpl[1].toLowerCase()) ? Infinity : parseInt(colonSpl[1]);
                    if (isNaN(v) || v < 0) throwCliError("ASTError", "Invalid: " + i + " instruction: " + s);
                    k.jobId = v;
                    continue;
                }
                if (["jobAll", "ja"].includes(colonSpl[0])) {
                    const v = ["inf", "infinity"].includes(colonSpl[1].toLowerCase()) ? Infinity : parseInt(colonSpl[1]);
                    if (isNaN(v) || v < 0) throwCliError("ASTError", "Invalid: " + i + " instruction: " + s);
                    k.jobAllId = v;
                    continue;
                }
                if (["type", "t", ""].includes(colonSpl[0])) {
                    if (colonSpl[1] === "*") {
                        k.mode = "every";
                        k.matches = [];
                        continue;
                    }
                    k.matches.push(["type", colonSpl[1], orIsIt]);
                    continue;
                }
                throwCliError("ASTError", "Invalid: " + i + " instruction: " + s);
            }
            astSyntax.syntaxes.push(k);
        });

        return astSyntax;
    };

    static type(types: string | string[], build?: ASTBuilderFN, yes = true): ASTSingleSyntax {
        const helper = makeHelper({
            label: null,
            matches: typeof types === "string" ? [["type", types, yes]] : types.map(type => ["type", type, yes]),
            min: 1,
            max: 1,
            mode: "some",
            jobId: null,
            jobAllId: null
        });
        if (build) build(helper);
        return helper.data;
    };

    static value(values: string | string[], build?: ASTBuilderFN, yes = true): ASTSingleSyntax {
        const helper = makeHelper({
            label: null,
            matches: typeof values === "string" ? [["value", values, yes]] : values.map(value => ["value", value, yes]),
            min: 1,
            max: 1,
            mode: "some",
            jobId: null,
            jobAllId: null
        });
        if (build) build(helper);
        return helper.data;
    };

    static typeValue(values: string | string[], types: string | string[], build?: ASTBuilderFN, yes = true): ASTSingleSyntax {
        const helper = makeHelper({
            label: null,
            matches: <ASTSyntaxMatch[]>[
                ...(typeof values === "string" ? [["value", values, yes]] : values.map(value => ["value", value, yes])),
                ...(typeof types === "string" ? [["type", types, yes]] : types.map(type => ["type", type, yes])),
            ],
            min: 1,
            max: 1,
            mode: "some",
            jobId: null,
            jobAllId: null
        });
        if (build) build(helper);
        return helper.data;
    };

    static any(build?: ASTBuilderFN, mode: ASTSyntaxMode = "every"): ASTSingleSyntax {
        const helper = makeHelper({
            label: null,
            matches: [],
            min: 1,
            max: 1,
            mode,
            jobId: null,
            jobAllId: null
        });
        if (build) build(helper);
        return helper.data;
    };

    type(types: string | string[], build?: ASTBuilderFN) {
        this.syntaxes.push(ASTSyntax.type(types, build));
        return this;
    };

    value(values: string | string[], build?: ASTBuilderFN) {
        this.syntaxes.push(ASTSyntax.value(values, build));
        return this;
    };

    typeValue(values: string | string[], types: string | string[], build?: ASTBuilderFN) {
        this.syntaxes.push(ASTSyntax.typeValue(values, types, build));
        return this;
    };

    any(build?: ASTBuilderFN, mode: ASTSyntaxMode = "every") {
        this.syntaxes.push(ASTSyntax.any(build, mode));
        return this;
    };
}