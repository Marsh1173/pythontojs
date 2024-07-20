import { get_tokens } from "./src/tokenizer";

const tokens = await get_tokens();

console.log(tokens);
console.log("Done");
