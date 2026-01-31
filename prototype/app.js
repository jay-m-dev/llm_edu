import { tokenize } from "./tokenizer.js";
import { embedToken } from "./embedding.js";
import { computeAttention } from "./attention.js";
import { applyPipeline, getPipelineStages } from "./pipeline.js";
import { applyContextWindow } from "./context_window.js";
import { buildDistribution, sampleFromDistribution } from "./sampling.js";

window.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("input");
  const tokenListEl = document.getElementById("token-list");
  const countEl = document.getElementById("token-count");
  const embeddingTitleEl = document.getElementById("embedding-title");
  const embeddingBarsEl = document.getElementById("embedding-bars");
  const attentionListEl = document.getElementById("attention-list");
  const pipelineStageEl = document.getElementById("pipeline-stage");
  const pipelineListEl = document.getElementById("pipeline-list");
  const contextSizeEl = document.getElementById("context-size");
  const contextActiveEl = document.getElementById("context-active");
  const contextDroppedEl = document.getElementById("context-dropped");
  const samplingSeedEl = document.getElementById("sampling-seed");
  const samplingTempEl = document.getElementById("sampling-temp");
  const samplingRandomEl = document.getElementById("sampling-random");
  const samplingRunEl = document.getElementById("sampling-run");
  const samplingListEl = document.getElementById("sampling-list");
  const samplingResultEl = document.getElementById("sampling-result");
  const runSaveEl = document.getElementById("run-save");
  const runReplayEl = document.getElementById("run-replay");
  const replayIndicatorEl = document.getElementById("replay-indicator");
  const generationPlayEl = document.getElementById("generation-play");
  const generationPauseEl = document.getElementById("generation-pause");
  const generationStepEl = document.getElementById("generation-step-btn");
  const generationOutputEl = document.getElementById("generation-output");
  const generationStepCountEl = document.getElementById("generation-step");
  const generationCurrentEl = document.getElementById("generation-current");

  if (
    !inputEl ||
    !tokenListEl ||
    !countEl ||
    !embeddingTitleEl ||
    !embeddingBarsEl ||
    !attentionListEl ||
    !pipelineStageEl ||
    !pipelineListEl ||
    !contextSizeEl ||
    !contextActiveEl ||
    !contextDroppedEl ||
    !samplingSeedEl ||
    !samplingTempEl ||
    !samplingRandomEl ||
    !samplingRunEl ||
    !samplingListEl ||
    !samplingResultEl ||
    !runSaveEl ||
    !runReplayEl ||
    !replayIndicatorEl ||
    !generationPlayEl ||
    !generationPauseEl ||
    !generationStepEl ||
    !generationOutputEl ||
    !generationStepCountEl ||
    !generationCurrentEl
  ) {
    throw new Error("Tokenizer UI: required elements not found.");
  }

  const state = {
    tokens: [],
    embeddings: [],
    attentionWeights: [],
    pipelineOutputs: [],
    contextActive: [],
    contextDropped: [],
    contextSize: 12,
    samplingSeed: 12345,
    samplingTemp: 1,
    samplingRandom: 0.2,
    samplingDistribution: [],
    samplingSelectedIndex: null,
    selectedStageId: null,
    selectedIndex: null,
    replayMode: false,
    generationIndex: 0,
    generatedTokens: [],
    generationTimer: null,
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

  function renderContextWindow() {
    contextActiveEl.innerHTML = "";
    contextDroppedEl.innerHTML = "";

    state.contextActive.forEach((item) => {
      const row = document.createElement("div");
      row.className = "context-chip";
      row.textContent = `${item.index}: ${item.token.value}`;
      contextActiveEl.appendChild(row);
    });

    state.contextDropped.forEach((item) => {
      const row = document.createElement("div");
      row.className = "context-chip";
      row.textContent = `${item.index}: ${item.token.value}`;
      contextDroppedEl.appendChild(row);
    });
  }

  function renderSampling() {
    samplingListEl.innerHTML = "";

    if (state.tokens.length === 0) {
      samplingResultEl.textContent = "No tokens to sample.";
      return;
    }

    samplingResultEl.textContent =
      state.samplingSelectedIndex === null
        ? "No sample yet."
        : `Selected: ${state.tokens[state.samplingSelectedIndex].value}`;
    replayIndicatorEl.textContent = state.replayMode ? "Replay: on" : "Replay: off";

    state.tokens.forEach((token, index) => {
      const row = document.createElement("div");
      row.className = "sampling-row";
      if (index === state.samplingSelectedIndex) {
        row.classList.add("selected");
      }

      const label = document.createElement("div");
      label.textContent = token.value;

      const barWrap = document.createElement("div");
      barWrap.className = "sampling-bar-wrap";

      const bar = document.createElement("div");
      bar.className = "sampling-bar";
      bar.style.width = `${Math.round(state.samplingDistribution[index] * 100)}%`;

      const valueEl = document.createElement("div");
      valueEl.className = "sampling-value";
      valueEl.textContent = state.samplingDistribution[index].toFixed(2);

      barWrap.appendChild(bar);
      row.append(label, barWrap, valueEl);
      samplingListEl.appendChild(row);
    });
  }

  function renderGeneration() {
    generationOutputEl.innerHTML = "";
    state.generatedTokens.forEach((token) => {
      const chip = document.createElement("div");
      chip.className = "generation-token";
      chip.textContent = token.value;
      generationOutputEl.appendChild(chip);
    });
    generationStepCountEl.textContent = String(state.generatedTokens.length);
    const currentToken =
      state.generatedTokens.length > 0
        ? state.generatedTokens[state.generatedTokens.length - 1].value
        : "-";
    generationCurrentEl.textContent = currentToken;
  }

  function stopGeneration() {
    if (state.generationTimer) {
      clearInterval(state.generationTimer);
      state.generationTimer = null;
    }
  }

  function resetGeneration() {
    stopGeneration();
    state.generationIndex = 0;
    state.generatedTokens = [];
    renderGeneration();
  }

  function stepGeneration() {
    if (state.generationIndex >= state.tokens.length) {
      stopGeneration();
      return;
    }
    const token = state.tokens[state.generationIndex];
    state.generatedTokens.push(token);
    state.generationIndex += 1;
    renderGeneration();
  }

  function updateSamplingDistribution() {
    state.samplingDistribution = buildDistribution(state.tokens, {
      seed: state.samplingSeed,
      temperature: state.samplingTemp,
      randomness: state.samplingRandom,
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
    const context = applyContextWindow(tokens, state.contextSize);
    state.contextActive = context.activeTokens;
    state.contextDropped = context.droppedTokens;
    updateSamplingDistribution();
    if (tokens.length === 0) {
      state.selectedIndex = null;
      state.attentionWeights = [];
      state.selectedStageId = null;
      state.samplingSelectedIndex = null;
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
    renderContextWindow();
    renderSampling();
    resetGeneration();
  }

  function buildRunSnapshot() {
    return {
      input: inputEl.value,
      contextSize: state.contextSize,
      samplingSeed: state.samplingSeed,
      samplingTemp: state.samplingTemp,
      samplingRandom: state.samplingRandom,
      selectedIndex: state.selectedIndex,
      selectedStageId: state.selectedStageId,
      tokens: state.tokens,
      embeddings: state.embeddings,
      attentionWeights: state.attentionWeights,
      pipelineOutputs: state.pipelineOutputs,
      contextActive: state.contextActive,
      contextDropped: state.contextDropped,
      samplingDistribution: state.samplingDistribution,
      samplingSelectedIndex: state.samplingSelectedIndex,
    };
  }

  function applyRunSnapshot(snapshot) {
    inputEl.value = snapshot.input;
    contextSizeEl.value = String(snapshot.contextSize);
    samplingSeedEl.value = String(snapshot.samplingSeed);
    samplingTempEl.value = String(snapshot.samplingTemp);
    samplingRandomEl.value = String(snapshot.samplingRandom);

    state.contextSize = snapshot.contextSize;
    state.samplingSeed = snapshot.samplingSeed;
    state.samplingTemp = snapshot.samplingTemp;
    state.samplingRandom = snapshot.samplingRandom;
    state.selectedIndex = snapshot.selectedIndex;
    state.selectedStageId = snapshot.selectedStageId;
    state.tokens = snapshot.tokens;
    state.embeddings = snapshot.embeddings;
    state.attentionWeights = snapshot.attentionWeights;
    state.pipelineOutputs = snapshot.pipelineOutputs;
    state.contextActive = snapshot.contextActive;
    state.contextDropped = snapshot.contextDropped;
    state.samplingDistribution = snapshot.samplingDistribution;
    state.samplingSelectedIndex = snapshot.samplingSelectedIndex;

    if (state.selectedStageId) {
      pipelineStageEl.value = state.selectedStageId;
    }

    renderTokens(state.tokens);
    renderEmbedding();
    renderAttention();
    renderPipeline();
    renderContextWindow();
    renderSampling();
  }

  function saveRun() {
    const snapshot = buildRunSnapshot();
    localStorage.setItem("llm-edu:lastRun", JSON.stringify(snapshot));
  }

  function replayRun() {
    const raw = localStorage.getItem("llm-edu:lastRun");
    if (!raw) {
      samplingResultEl.textContent = "No recorded run found.";
      return;
    }
    let snapshot;
    try {
      snapshot = JSON.parse(raw);
    } catch (err) {
      samplingResultEl.textContent = "Recorded run is invalid.";
      return;
    }
    state.replayMode = true;
    applyRunSnapshot(snapshot);
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

  contextSizeEl.addEventListener("input", () => {
    const parsed = Number.parseInt(contextSizeEl.value, 10);
    state.contextSize = Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
    update();
  });

  samplingSeedEl.addEventListener("input", () => {
    const parsed = Number.parseInt(samplingSeedEl.value, 10);
    state.samplingSeed = Number.isNaN(parsed) ? 0 : parsed;
    updateSamplingDistribution();
    renderSampling();
  });

  samplingTempEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(samplingTempEl.value);
    state.samplingTemp = Number.isNaN(parsed) ? 1 : parsed;
    updateSamplingDistribution();
    renderSampling();
  });

  samplingRandomEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(samplingRandomEl.value);
    state.samplingRandom = Number.isNaN(parsed) ? 0 : parsed;
    updateSamplingDistribution();
    renderSampling();
  });

  samplingRunEl.addEventListener("click", () => {
    const result = sampleFromDistribution(state.tokens, {
      seed: state.samplingSeed,
      temperature: state.samplingTemp,
      randomness: state.samplingRandom,
    });
    state.samplingDistribution = result.distribution;
    state.samplingSelectedIndex = result.selectedIndex;
    renderSampling();
  });

  runSaveEl.addEventListener("click", () => {
    state.replayMode = false;
    saveRun();
    renderSampling();
  });

  runReplayEl.addEventListener("click", () => {
    replayRun();
  });

  generationPlayEl.addEventListener("click", () => {
    if (state.generationTimer) {
      return;
    }
    state.generationTimer = setInterval(() => {
      stepGeneration();
    }, 300);
  });

  generationPauseEl.addEventListener("click", () => {
    stopGeneration();
  });

  generationStepEl.addEventListener("click", () => {
    stepGeneration();
  });

  inputEl.value = "Hello, world!\nTokenize this: A_B test.";
  contextSizeEl.value = String(state.contextSize);
  samplingSeedEl.value = String(state.samplingSeed);
  samplingTempEl.value = String(state.samplingTemp);
  samplingRandomEl.value = String(state.samplingRandom);
  update();

  if (state.selectedStageId) {
    pipelineStageEl.value = state.selectedStageId;
  }
});
