import type { Token } from "./tokens";

export const get_tokens = async (): Promise<Token[]> => {
  const input_text: string = await Bun.file("./src/input.txt").text();

  const tokens: Token[] = [];
  let index: number = 0;
  let newline_count: number = 1;
  const paren_stack = "";

  while (index < input_text.length) {
    if (input_text.charAt(index) === "#") {
      // skip comments
      index = skip_comment_line(input_text, index);
    } else if (input_text.charAt(index) === "\\") {
      // explicit newline skips (should be checked after string literals and comments)
      if (input_text.charAt(index + 1) === "\n") {
        newline_count++;
        index++;
      } else {
        throw new Error(
          "Error on line " +
            newline_count +
            ": '\\' not skipping newline or part of a string literal"
        );
      }
    } else if (input_text.charAt(index) === "\n") {
      // identify logical new lines (not physical new lines)
      newline_count++;
      // anything in braces, parentheses, and square brackets can be separated onto physical new lines without defining the end of a logical new line
      const is_outside_of_parens = paren_stack.length === 0;
      const is_not_preceeded_by_newline =
        tokens[tokens.length - 1] === undefined || tokens[tokens.length - 1].type !== "NewLine";

      if (is_outside_of_parens && is_not_preceeded_by_newline) {
        tokens.push({ type: "NewLine" });
      }
    }
    // next up: indentation

    index++;
  }

  return tokens;
};

// starts on hash, returns final index before newline
function skip_comment_line(input_text: string, index: number): number {
  while (input_text.charAt(index + 1) !== "\n") {
    index++;
  }
  return index;
}
