import { IToken } from "./Tokenizer";

export type IAstNodeType = "NumberLiteral" | "CallExpression" | "Program";

export interface IAstNode {
    type: IAstNodeType;
}

export interface INumberAstNode extends IAstNode {
    type: "NumberLiteral";
    value: string;
}

export interface ICallAstNode extends IAstNode {
    type: "CallExpression";
    name?: string;
    params?: Array<IAstNode>;
}

export interface IAstBody extends IAstNode {
    type: "Program";
    body: Array<IAstNode>;
}

export function parser(tokens: Array<IToken>): IAstBody {
    let current = 0;

    function walk(): IAstNode {
        let token = tokens[current];

        if (token.type === "number") {
            current++;

            return <INumberAstNode>{
                type: "NumberLiteral",
                value: token.value
            };
        }

        if (
            token.type === "paren" &&
            token.value === "("
        ) {
            token = tokens[++current];

            const node: ICallAstNode = {
                type: "CallExpression",
                name: token.value,
                params: []
            };

            token = tokens[++current];

            while (
                (token.type !== "paren") ||
                (token.type === "paren" && token.value !== ")")
            ) {
                node.params.push(walk());
                token = tokens[current];
            }

            current++;

            return node;
        }

        throw new TypeError(token.type);
    }

    let ast: IAstBody = {
        type: "Program",
        body: []
    };

    while (current < tokens.length) {
        ast.body.push(walk());
    }

    return ast;
}
