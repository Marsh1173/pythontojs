export type Token = OpenParen | CloseParen | String | Number | CallMethod;

export interface OpenParen {
  type: "OpenParen";
}
export interface CloseParen {
  type: "CloseParen";
}
export interface CallMethod {
  type: "CallMethod";
}
export interface String {
  type: "String";
  value: string;
}
export interface Number {
  type: "Number";
  value: number;
}
