import { tokenize } from "./tokenizer.js";
import { embedToken } from "./embedding.js";
import { computeAttention } from "./attention.js";
import { applyPipeline, getPipelineStages } from "./pipeline.js";

window.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("input");
  const tokenListEl = document.getElementById("token-list");
  const countEl = document.getElementById("token-count");
  const embeddingTitleEl = document.getElementById("embedding-title");
  const embeddingBarsEl = document.getElementById("embedding-bars");
  const attentionListEl = document.getElementById("attention-list");
  const pipelineStageEl = document.getElementById("pipeline-stage");
  const pipelineListEl = document.getElementById("pipeline-list");

  if (
    !inputEl ||
    !tokenListEl ||
    !countEl ||
    !embeddingTitleEl ||
    !embeddingBarsEl ||
    !attentionListEl ||
    !pipelineStageEl ||
    !pipelineListEl
  ) {
    throw new Error("Tokenizer UI: required elements not found.");
  }

  const state = {
    tokens: [],
    embeddings: [],
    attentionWeights: [],
    pipelineOutputs: [],
    selectedStageId: null,
    selectedIndex: null,
  };

  function renderEmbedding() {
    embeddingBarsEl.innerHTML = "";

    if (state.selectedIndex === null || !state.tokens[state.selectedIndex]) {
      embeddingTitleEl.textContent = "Select a token to inspect its features.";
      return;
    }

    const token = state.tokens[state.selectedIndex];
    const embedding = state.embeddings[state.selectedIndex];
    embeddingTitleEl.textContent = `Token: "${token.value}"`;

    embedding.values.forEach((value, index) => {
      const row = document.createElement("div");
      row.className = "embedding-row";

      const label = document.createElement("div");
      label.className = "embedding-label";
      label.textContent = embedding.labels[index];

      const barWrap = document.createElement("div");
      barWrap.className = "embedding-bar-wrap";

      const bar = document.createElement("div");
      bar.className = "embedding-bar";
      bar.style.width = `${Math.round(value * 100)}%`;

      const valueEl = document.createElement("div");
      valueEl.className = "embedding-value";
      valueEl.textContent = value.toFixed(2);

      barWrap.appendChild(bar);
      row.append(label, barWrap, valueEl);
      embeddingBarsEl.appendChild(row);
    });
  }

  function renderTokens(tokens) {
    tokenListEl.innerHTML = "";
    countEl.textContent = String(tokens.length);

    tokens.forEach((token, index) => {
      const row = document.createElement("div");
      row.className = "token-row";
      if (index === state.selectedIndex) {
        row.classList.add("token-selected");
      }
      row.dataset.index = String(index);

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

  function renderAttention() {
    attentionListEl.innerHTML = "";

    if (state.selectedIndex === null || !state.tokens[state.selectedIndex]) {
      return;
    }

    const weights = state.attentionWeights;
    const tokens = state.tokens;
    tokens.forEach((token, index) => {
      const row = document.createElement("div");
      row.className = "attention-row";

      const label = document.createElement("div");
      label.className = "attention-token";
      label.textContent = token.value;

      const barWrap = document.createElement("div");
      barWrap.className = "attention-bar-wrap";

      const bar = document.createElement("div");
      bar.className = "attention-bar";
      bar.style.width = `${Math.round(weights[index] * 100)}%`;

      const valueEl = document.createElement("div");
      valueEl.className = "attention-value";
      valueEl.textContent = weights[index].toFixed(2);

      barWrap.appendChild(bar);
      row.append(label, barWrap, valueEl);
      attentionListEl.appendChild(row);
    });
  }

  function renderPipeline() {
    pipelineListEl.innerHTML = "";
    if (!state.selectedStageId || state.pipelineOutputs.length === 0) {
      return;
    }
    const stage = state.pipelineOutputs.find((item) => item.id === state.selectedStageId);
    if (!stage) {
      return;
    }

    stage.tokens.forEach((token, index) => {
      const row = document.createElement("div");
      row.className = "pipeline-row";

      const indexEl = document.createElement("div");
      indexEl.className = "token-index";
      indexEl.textContent = String(index);

      const typeEl = document.createElement("div");
      typeEl.className = "token-type";
      typeEl.textContent = token.type;

      const valueEl = document.createElement("div");
      valueEl.className = "token-value";
      valueEl.textContent = token.value;

      row.append(indexEl, typeEl, valueEl);
      pipelineListEl.appendChild(row);
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

    state.tokens = tokens;
    state.embeddings = tokens.map((token) => embedToken(token.value));
    const pipeline = applyPipeline(tokens);
    state.pipelineOutputs = pipeline.outputs;
    if (tokens.length === 0) {
      state.selectedIndex = null;
      state.attentionWeights = [];
      state.selectedStageId = null;
    } else if (state.selectedIndex === null || !tokens[state.selectedIndex]) {
      state.selectedIndex = 0;
      state.attentionWeights = computeAttention(tokens, 0);
      state.selectedStageId = pipeline.outputs[pipeline.outputs.length - 1].id;
    } else {
      state.attentionWeights = computeAttention(tokens, state.selectedIndex);
      if (!state.selectedStageId) {
        state.selectedStageId = pipeline.outputs[pipeline.outputs.length - 1].id;
      }
    }

    renderTokens(tokens);
    renderEmbedding();
    renderAttention();
    renderPipeline();
  }

  tokenListEl.addEventListener("click", (event) => {
    const target = event.target.closest(".token-row");
    if (!target) {
      return;
    }
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    state.selectedIndex = index;
    state.attentionWeights =
      state.tokens.length > 0 ? computeAttention(state.tokens, index) : [];
    renderTokens(state.tokens);
    renderEmbedding();
    renderAttention();
  });

  inputEl.addEventListener("input", update);
  inputEl.addEventListener("change", update);
  inputEl.addEventListener("keyup", update);

  const stages = getPipelineStages();
  pipelineStageEl.innerHTML = "";
  stages.forEach((stage) => {
    const option = document.createElement("option");
    option.value = stage.id;
    option.textContent = stage.name;
    pipelineStageEl.appendChild(option);
  });

  pipelineStageEl.addEventListener("change", () => {
    state.selectedStageId = pipelineStageEl.value;
    renderPipeline();
  });

  inputEl.value = "Hello, world!\nTokenize this: A_B test.";
  update();

  if (state.selectedStageId) {
    pipelineStageEl.value = state.selectedStageId;
  }
});
