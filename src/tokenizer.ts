import type { Token } from "./tokens";

const whitespace_regex = /\s/;
const number_regex = /[0-9]|-|\./;

export const get_tokens = async (): Promise<Token[]> => {
  const input_file = Bun.file("./src/input.txt");
  const input_text = await input_file.text();

  let input_index: number = 0;
  const tokens: Token[] = [];

  while (input_index < input_text.length) {
    const char = input_text.charAt(input_index);

    if (whitespace_regex.test(char)) {
      input_index++;
      continue;
    } else if (number_regex.test(char)) {
      let number_string = "";
      while (number_regex.test(input_text.charAt(input_index))) {
        number_string += input_text.charAt(input_index);
        input_index++;
      }
      tokens.push({ type: "Number", value: Number(number_string) });
      continue;
    } else if (char === `"` || char === `'` || char === `\``) {
      const end_quote = char;
      let string_string = "";
      input_index++;

      while (input_text.charAt(input_index) !== end_quote) {
        string_string += input_text.charAt(input_index);
        input_index++;
      }
      tokens.push({ type: "String", value: string_string });
      input_index++;
      continue;
    } else {
      switch (char) {
        case "(":
          tokens.push({ type: "OpenParen" });
          break;
        case ")":
          tokens.push({ type: "CloseParen" });
          break;
        case ".":
          tokens.push({ type: "CallMethod" });
          break;
      }
    }

    input_index++;
  }

  return tokens;
};

/**
 * Returns [resulting token, final index]
 */
function get_number(input_text: string, index: number): [Token, number] {
  let number_string = "";
  while (number_regex.test(input_text.charAt(index))) {
    number_string += input_text.charAt(index);
    index++;
  }
  return [{ type: "Number", value: Number(number_string) }, index];
}
