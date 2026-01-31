import assert from "node:assert/strict";
import { tokenize } from "./tokenizer.js";

function tokensToTuple(tokens) {
  return tokens.map((t) => `${t.type}:${t.value}@${t.start}-${t.end}`);
}

{
  const tokens = tokenize("");
  assert.deepEqual(tokens, []);
}

{
  const tokens = tokenize("Hello, world!");
  assert.deepEqual(tokensToTuple(tokens), [
    "word:Hello@0-5",
    "punct:,@5-6",
    "word:world@7-12",
    "punct:!@12-13",
  ]);
}

{
  const tokens = tokenize("  spaced  out ");
  assert.deepEqual(tokensToTuple(tokens), [
    "word:spaced@2-8",
    "word:out@10-13",
  ]);
}

{
  const tokens = tokenize("A_B test");
  assert.deepEqual(tokensToTuple(tokens), [
    "word:A_B@0-3",
    "word:test@4-8",
  ]);
}

{
  const tokens = tokenize("Wait...what?");
  assert.deepEqual(tokensToTuple(tokens), [
    "word:Wait@0-4",
    "punct:.@4-5",
    "punct:.@5-6",
    "punct:.@6-7",
    "word:what@7-11",
    "punct:?@11-12",
  ]);
}

console.log("tokenizer.test.js: all tests passed");
