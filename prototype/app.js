import { tokenize } from "./tokenizer.js";

const inputEl = document.getElementById("input");
const tokenListEl = document.getElementById("token-list");
const countEl = document.getElementById("token-count");

function renderTokens(tokens) {
  tokenListEl.innerHTML = "";
  countEl.textContent = String(tokens.length);

  tokens.forEach((token, index) => {
    const row = document.createElement("div");
    row.className = "token-row";

    const indexEl = document.createElement("div");
    indexEl.className = "token-index";
    indexEl.textContent = String(index);

    const typeEl = document.createElement("div");
    typeEl.className = "token-type";
    typeEl.textContent = token.type;

    const valueEl = document.createElement("div");
    valueEl.className = "token-value";
    valueEl.textContent = token.value;

    const rangeEl = document.createElement("div");
    rangeEl.className = "token-range";
    rangeEl.textContent = `[${token.start}, ${token.end})`;

    row.append(indexEl, typeEl, valueEl, rangeEl);
    tokenListEl.appendChild(row);
  });
}

function update() {
  const input = inputEl.value;
  let tokens = [];
  try {
    tokens = tokenize(input);
  } catch (err) {
    tokenListEl.innerHTML = "";
    countEl.textContent = "0";
    const row = document.createElement("div");
    row.className = "token-row token-error";
    row.textContent = err.message;
    tokenListEl.appendChild(row);
    return;
  }

  renderTokens(tokens);
}

inputEl.addEventListener("input", update);

inputEl.value = "Hello, world!\nTokenize this: A_B test.";
update();
