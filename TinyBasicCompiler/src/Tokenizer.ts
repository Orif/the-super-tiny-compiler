type ITokenType = "paren" | "number" | "name";

interface IToken {
    type: ITokenType;
    value: string;
}

const WHITESPACE = /\s/;
const NUMBERS = /[0-9]/;
const LETTERS = /[a-z]/i;

function tokenizer(input: string): Array<IToken> {
    let current: number = 0;
    let tokens: Array<IToken> = [];

    while (current < input.length) {
        let char = input[current];

        if (char === "(") {
            tokens.push({
                type: "paren",
                value: "("
            });

            current++;

            continue;
        }

        if (char === ")") {
            tokens.push({
                type: "paren",
                value: ")"
            });
            current++;
            continue;
        }

        if (WHITESPACE.test(char)) {
            current++;
            continue;
        }

        // (add 123 456)
        //      ^^^ ^^^
        if (NUMBERS.test(char)) {
            let value = "";

            while (NUMBERS.test(char)) {
                value += char;
                char = input[++current];
            }

            tokens.push({
                type: "number",
                value: value
            });

            continue;
        }

        // (add 2 4)
        //  ^^^
        if (LETTERS.test(char)) {
            let value = "";

            while (LETTERS.test(char)) {
                value += char;
                char = input[++current];
            }

            tokens.push({
                type: "name",
                value: value
            });

            continue;
        }

        throw new TypeError("I dont know what this character is: " + char);
    }

    return tokens;
}

export { IToken, tokenizer };