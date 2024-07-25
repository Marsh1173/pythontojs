import { Config } from "./config";
import { InvalidSyntaxError } from "./errors";
import { Delimiters, Operators, type DelimiterType, type OperatorType, type Token } from "./tokens";

const whitespace_chars = " \t";
const identifier_matcher = /\d|[a-zA-Z]|_/;
const numeric_matcher = /\d/;

export const get_tokens = async (): Promise<Token[]> => {
  const input_text: string = await Bun.file("./src/input.txt").text();

  const tokens: Token[] = [];
  let index: number = 0;
  let newline_count: number = 1;

  const paren_stack = "";
  const indentation_stack = [0];

  while (index < input_text.length) {
    // handle indentation
    if (is_preceeded_by_newline(tokens)) {
      [index] = handle_indentation(input_text, index);
    }

    const next_char = input_text.charAt(index);

    if (whitespace_chars.includes(next_char)) {
      // skip whitespace
      index = skip_witespace(input_text, index);
    } else if (next_char === "#") {
      // skip comments
      index = skip_comment_line(input_text, index);
    } else if (next_char === "\\") {
      // skip backslashes
      [index, newline_count] = handle_backslash(input_text, index, newline_count);
    } else if (next_char === "\n") {
      // handle physical newlines
      newline_count++;
      index++;
      handle_newline(tokens, paren_stack);
    } else if (numeric_matcher.test(next_char) || next_char === "-") {
      // grab numeric literal token
      index = grab_numeric_token(tokens, index, input_text);
    } else if ("'\"".includes(next_char)) {
      // grab string literal token
      [index, newline_count] = grab_string_token(tokens, index, newline_count, input_text);
    } else if (identifier_matcher.test(next_char)) {
      // grab identifier token
      [index] = handle_identifier(input_text, tokens, index);
    } else {
      let delimiter_str: DelimiterType | undefined = Delimiters.find((str) =>
        input_text.startsWith(str, index)
      );
      let operator_str: OperatorType | undefined = Operators.find((str) =>
        input_text.startsWith(str, index)
      );

      if (delimiter_str && operator_str) {
        if (delimiter_str.length < operator_str.length) {
          delimiter_str = undefined;
        } else {
          operator_str = undefined;
        }
      }

      if (delimiter_str) {
        tokens.push({
          type: "Delimiter",
          value: delimiter_str,
        });
        index += delimiter_str.length;
      } else if (operator_str) {
        tokens.push({
          type: "Operator",
          value: operator_str,
        });
        index += operator_str.length;
      } else {
        // $ ? and ` are invalid characters
        throw new InvalidSyntaxError(
          "Invalid character at line " + newline_count + ": " + next_char
        );
      }
    }
  }

  return tokens;
};

// starts on hash, returns index of newline
function skip_comment_line(input_text: string, index: number): number {
  // skip comments
  while (input_text.charAt(index) !== "\n" && index < input_text.length) {
    index++;
  }
  return index;
}

// starts on space or tab, returns first index of next token
function skip_witespace(input_text: string, index: number): number {
  // skip whitespace (not indentation)
  while (whitespace_chars.includes(input_text.charAt(index))) {
    index++;
  }
  return index;
}

/**
 * returns true if the latest token is a newline token (returns false for an empty list of tokens)
 */
function is_preceeded_by_newline(tokens: Token[]): boolean {
  return tokens[tokens.length - 1] !== undefined && tokens[tokens.length - 1].type === "NewLine";
}

/**
 * explicit newline skips (should be checked after string literals and comments)
 *
 * returns [new index starting on next line, new newline count]
 */
function handle_backslash(
  input_text: string,
  index: number,
  newline_count: number
): [number, number] {
  if (input_text.charAt(index + 1) === "\n") {
    return [index + 2, newline_count + 1];
  } else {
    throw new InvalidSyntaxError(
      "Error on line " + newline_count + ": '\\' not skipping newline or part of a string literal"
    );
  }
}

/**
 *
 */
function handle_newline(tokens: Token[], paren_stack: string) {
  // identify logical new lines (not physical new lines)
  // anything in braces, parentheses, and square brackets can be separated onto physical new lines without defining the end of a logical new line
  const is_outside_of_parens = paren_stack.length === 0;
  const is_not_preceeded_by_newline = !is_preceeded_by_newline(tokens);

  if (is_outside_of_parens && is_not_preceeded_by_newline) {
    tokens.push({ type: "NewLine" });
  }
}

/**
 * skips whitespace and updates indentation stack. returns the index at the first non-whitespace character
 *
 * returns [new index]
 */
function handle_indentation(input_text: string, index: number): [number] {
  let indentation = 0;
  while (whitespace_chars.includes(input_text.charAt(index))) {
    if (input_text.charAt(index) === " ") {
      indentation++;
    } else if (input_text.charAt(index) === "\t") {
      indentation += Config.spaces_per_tab;
    }
    index++;
  }

  // Once all characters result in an error or token, use indentation stack to add indents or dedents
  return [index];
}

/**
 * Detects keywords and identifiers (distinction is not made at this level) and pushes a token to the list.
 * Returns first index after keyword / identifier
 *
 * returns [new index]
 */
function handle_identifier(input_text: string, tokens: Token[], index: number): [number] {
  let identifier_string = "";
  while (identifier_matcher.test(input_text.charAt(index))) {
    identifier_string += input_text.charAt(index);
    index++;
  }
  tokens.push({
    type: "Identifier",
    name: identifier_string,
  });
  return [index];
}

/**
 * grabs the string literal token, adds it to the tokens
 *
 * returns [first index after the string, new newline count]
 */
function grab_string_token(
  tokens: Token[],
  index: number,
  newline_count: number,
  input_text: string
): [number, number] {
  const ending_quote = input_text.charAt(index);
  index++;
  let str = "";

  while (true) {
    const char = input_text.charAt(index);

    if (index >= input_text.length) {
      throw new InvalidSyntaxError("Unfinished string literal");
    } else if (char === "\n") {
      throw new InvalidSyntaxError("Unfinished string literal on line " + newline_count);
    } else if (char === "\\") {
      index++;
      const next_char = input_text.charAt(index);

      if (next_char === "\n") {
        newline_count++;
      } else if (next_char === "n") {
        str += "\n";
      } else if (next_char === "\\") {
        str += "\\";
      } else if (next_char === "'" || next_char === '"') {
        str += next_char;
      } else if (next_char === "a") {
        str += "a";
      } else if (next_char === "b") {
        str += "\b";
      } else if (next_char === "f") {
        str += "\f";
      } else if (next_char === "r") {
        str += "\r";
      } else if (next_char === "t") {
        str += "\t";
      } else if (next_char === "v") {
        str += "\v";
      } else {
        throw new InvalidSyntaxError(
          "Unknown backslashed character on line " + newline_count + ": " + next_char
        );
      }
    } else if (char === ending_quote) {
      index++;
      break;
    } else {
      str += char;
    }

    index++;
  }

  tokens.push({
    type: "Literal",
    value: {
      type: "String",
      value: str,
    },
  });

  return [index, newline_count];
}

/**
 * grabs the numeric literal token, adds it to the tokens
 *
 * returns first index after the number
 */
function grab_numeric_token(tokens: Token[], index: number, input_text: string): number {
  let str = "";

  while (index < input_text.length) {
    const char = input_text.charAt(index);

    if (char === "-" && str.length === 0) {
      str += "-";
    } else if (char === "." && numeric_matcher.test(input_text.charAt(index + 1))) {
      str += ".";
    } else if (numeric_matcher.test(char)) {
      str += char;
    } else {
      index++;
      break;
    }

    index++;
  }

  tokens.push({
    type: "Literal",
    value: {
      type: "Number",
      value: Number(str),
    },
  });

  return index;
}
