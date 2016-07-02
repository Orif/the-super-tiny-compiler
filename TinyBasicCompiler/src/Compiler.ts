import { tokenizer } from "./Tokenizer";
import { parser } from "./Parser";
import { ICstNode, INumberCstNode, IIdentifierCstNode, ICallCstNode, IExpressionCstNode, ICstBody, transformer } from "./Transformer";

function codeGenerator(node: ICstNode): string {
    switch (node.type) {
        case "Program":
            return (node as ICstBody).body.map(codeGenerator).join("\n");

        case "ExpressionStatement":
            return `${codeGenerator((node as IExpressionCstNode).expression)};`; // << (...because we like to code the *correct* way)

        case "CallExpression":
            const callCstNode = (node as ICallCstNode);
            return `${codeGenerator(callCstNode.callee)}(${callCstNode.arguments.map(codeGenerator).join(", ")})`;

        case "Identifier":
            return (node as IIdentifierCstNode).name;

        case "NumberLiteral":
            return (node as INumberCstNode).value;

        default:
            throw new TypeError(node.type);
    }
}

function compiler(input: string): string {
    const tokens = tokenizer(input);
    const ast = parser(tokens);
    const newAst = transformer(ast);
    const output = codeGenerator(newAst);

    return output;
}

export {
    tokenizer,
    parser,
    transformer,
    codeGenerator,
    compiler
}