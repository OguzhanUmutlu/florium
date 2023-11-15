import {ASTSyntax} from "../builders/ASTSyntax";

export const CreateVariableSyntax = new ASTSyntax()
    .type("word", o => o.labelAs("variable_name"))
    .type(["set", "set-add", "set-subtract", "set-multiply", "set-divide", "set-modulo"])
    .any(o => o
        .labelAs("value")
        .min(1).max(Infinity)
        .until(ASTSyntax.type("semicolon"))
    )
    .type("semicolon");

// a = 10 + 5 - 6;