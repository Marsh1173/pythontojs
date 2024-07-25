import { InvalidSyntaxError } from "./src/errors";
import { get_tokens } from "./src/tokenizer";

try {
  const tokens = await get_tokens();
  console.log(tokens);
  console.log("Finished lexing");
} catch (e) {
  if (e instanceof InvalidSyntaxError) {
    console.error("Invalid syntax:");
    console.error(e.message);
  } else {
    throw e;
  }
}
