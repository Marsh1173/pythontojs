export type Token =
  | NewLine
  | Indent
  | Dedent
  | Identifier
  | Keyword
  | Literal
  | Operator
  | Delimiter;

export interface NewLine {
  type: "NewLine";
}
export interface Indent {
  type: "Indent";
}
export interface Dedent {
  type: "Dedent";
}
export interface Identifier {
  type: "Identifier";
  name: string;
}
export interface Keyword {
  type: "Keyword";
  value:
    | "False"
    | "await"
    | "else"
    | "import"
    | "pass"
    | "None"
    | "break"
    | "except"
    | "in"
    | "raise"
    | "True"
    | "class"
    | "finally"
    | "is"
    | "return"
    | "and"
    | "continue"
    | "for"
    | "lambda"
    | "try"
    | "as"
    | "def"
    | "from"
    | "nonlocal"
    | "while"
    | "assert"
    | "del"
    | "global"
    | "not"
    | "with"
    | "async"
    | "elif"
    | "if"
    | "or"
    | "yield";
}

export interface Literal {
  type: "Literal";
  value: { type: "String"; value: string } | { type: "Number"; value: number };
}

export type OperatorType =
  | "+"
  | "-"
  | "*"
  | "**"
  | "/"
  | "//"
  | "%"
  | "@"
  | "<<"
  | ">>"
  | "&"
  | "|"
  | "^"
  | "~"
  | ":="
  | "<"
  | ">"
  | "<="
  | ">="
  | "=="
  | "!=";
export const Operators: OperatorType[] = [
  "+",
  "-",
  "**",
  "*",
  "//",
  "/",
  "%",
  "@",
  "<<",
  ">>",
  "&",
  "|",
  "^",
  "~",
  ":=",
  "<=",
  ">=",
  "<",
  ">",
  "==",
  "!=",
];

export interface Operator {
  type: "Operator";
  value: OperatorType;
}

export type DelimiterType =
  | "("
  | ")"
  | "["
  | "]"
  | "{"
  | "}"
  | ","
  | ":"
  | "."
  | ";"
  | "@"
  | "="
  | "->"
  | "+="
  | "-="
  | "*="
  | "/="
  | "//="
  | "%="
  | "@="
  | "&="
  | "|="
  | "^="
  | ">>="
  | "<<="
  | "**=";
export const Delimiters: DelimiterType[] = [
  ",",
  ":",
  ".",
  ";",
  "@=",
  "@",
  "=",
  "->",
  "+=",
  "-=",
  "*=",
  "/=",
  "//=",
  "%=",
  "&=",
  "|=",
  "^=",
  ">>=",
  "<<=",
  "**=",
];

export interface Delimiter {
  type: "Delimiter";
  value: DelimiterType;
}
