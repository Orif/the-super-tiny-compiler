import { IAstNodeType, IAstNode, INumberAstNode, ICallAstNode, IAstBody, parser } from "./Parser";

type ICstNodeType = "NumberLiteral" | "Identifier" | "CallExpression" | "ExpressionStatement" | "Program";

export interface ICstNode {
    type: ICstNodeType;
    _context?: Array<ICstNode>;
}

export interface INumberCstNode extends ICstNode {
    type: "NumberLiteral";
    value: string;
}

export interface IIdentifierCstNode extends ICstNode {
    type: "Identifier";
    name: string;
}

export interface ICallCstNode extends ICstNode {
    type: "CallExpression";
    callee: ICstNode;
    arguments: Array<ICstNode>;
}

export interface IExpressionCstNode extends ICstNode {
    type: "ExpressionStatement";
    expression: ICallCstNode;
}

export interface ICstBody extends ICstNode {
    type: "Program";
    body: Array<ICstNode>;
}

interface IAstVisitor {
    NumberLiteral(node: INumberAstNode, parent: IAstNode): void;
    CallExpression(node: ICallAstNode, parent: IAstNode): void;
}

function traverser(ast: IAstNode, visitor: IAstVisitor): void {

    function traverseArray(array: Array<IAstNode>, parent: IAstNode) {
        array.forEach((child) => {
            traverseNode(child, parent);
        });
    }

    function traverseNode(node: IAstNode, parent: IAstNode): void {
        var method: ((node: IAstNode, parent: IAstNode) => void) = (visitor as any)[node.type];

        if (method) {
            method(node, parent);
        }

        switch (node.type) {
            case "Program":
                traverseArray((node as IAstBody).body, node);
                break;

            case "CallExpression":
                traverseArray((node as ICallAstNode).params, node);
                break;

            case "NumberLiteral":
                break;

            default:
                throw new TypeError(node.type);
        }
    }

    traverseNode(ast, null);
}

export function transformer(ast: IAstBody): ICstBody {
    const newAst: ICstBody = {
        type: "Program",
        body: []
    };

    (ast as ICstNode)._context = newAst.body;

    traverser(ast, <IAstVisitor>{
        NumberLiteral: function (node: INumberAstNode, parent: IAstNode) {
            (parent as ICstNode)._context.push(<INumberCstNode>{
                type: "NumberLiteral",
                value: node.value
            });
        },

        CallExpression: function (node: ICallAstNode, parent: IAstNode) {
            let expression: ICstNode = <ICallCstNode>{
                type: "CallExpression",
                callee: <IIdentifierCstNode>{
                    type: "Identifier",
                    name: node.name
                },
                arguments: []
            };

            (node as ICstNode)._context = (expression as ICallCstNode).arguments;

            if (parent.type !== "CallExpression") {
                expression = <IExpressionCstNode>{
                    type: "ExpressionStatement",
                    expression: expression
                };
            }

            (parent as ICstNode)._context.push(expression);
        }
    });

    return newAst;
}
