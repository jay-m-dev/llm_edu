import { tokenize } from "./tokenizer.js";
import { embedToken } from "./embedding.js";
import { computeAttention } from "./attention.js";
import { applyPipeline, getPipelineStages } from "./pipeline.js";
import { applyContextWindow } from "./context_window.js";
import { buildDistribution, sampleFromDistribution } from "./sampling.js";
import { buildStepDistribution } from "./generation_probabilities.js";
import { evaluateObjectives, getObjectives } from "./objectives.js";
import { detectFailures } from "./failures.js";
import { scoreRun } from "./scoring.js";
import { applyUnlocks, defaultUnlocks } from "./unlocks.js";
import { detectHallucinations } from "./hallucination.js";
import { explanations } from "./explanations.js";
import { findScenario, scenarios } from "./scenario.js";
import { defaultPresets, hydratePresets } from "./presets.js";
import { createClock } from "./clock.js";
import { logEvent } from "./instrumentation.js";
import { examplePrompts } from "./prompts.js";

window.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("input");
  const tokenListEl = document.getElementById("token-list");
  const countEl = document.getElementById("token-count");
  const tokenExampleEl = document.getElementById("token-example");
  const tokenExampleListEl = document.getElementById("token-example-list");
  const embeddingTitleEl = document.getElementById("embedding-title");
  const embeddingBarsEl = document.getElementById("embedding-bars");
  const attentionListEl = document.getElementById("attention-list");
  const pipelineStageEl = document.getElementById("pipeline-stage");
  const pipelineListEl = document.getElementById("pipeline-list");
  const contextSizeEl = document.getElementById("context-size");
  const contextSizeSliderEl = document.getElementById("context-size-slider");
  const contextSizeValueEl = document.getElementById("context-size-value");
  const contextActiveEl = document.getElementById("context-active");
  const contextDroppedEl = document.getElementById("context-dropped");
  const samplingSeedEl = document.getElementById("sampling-seed");
  const samplingTempEl = document.getElementById("sampling-temp");
  const samplingTempSliderEl = document.getElementById("sampling-temp-slider");
  const samplingTempValueEl = document.getElementById("sampling-temp-value");
  const samplingRandomEl = document.getElementById("sampling-random");
  const samplingRandomSliderEl = document.getElementById("sampling-random-slider");
  const samplingRandomValueEl = document.getElementById("sampling-random-value");
  const samplingRunEl = document.getElementById("sampling-run");
  const samplingListEl = document.getElementById("sampling-list");
  const samplingResultEl = document.getElementById("sampling-result");
  const runSaveEl = document.getElementById("run-save");
  const runReplayEl = document.getElementById("run-replay");
  const replayIndicatorEl = document.getElementById("replay-indicator");
  const generationPlayEl = document.getElementById("generation-play");
  const generationPauseEl = document.getElementById("generation-pause");
  const generationStepEl = document.getElementById("generation-step-btn");
  const generationSpeedEl = document.getElementById("generation-speed");
  const hallucinationToggleEl = document.getElementById("hallucination-toggle");
  const generationOutputEl = document.getElementById("generation-output");
  const generationStepCountEl = document.getElementById("generation-step");
  const generationCurrentEl = document.getElementById("generation-current");
  const generationProbListEl = document.getElementById("generation-prob-list");
  const generationAttentionListEl = document.getElementById("generation-attention-list");
  const attentionHeatmapEl = document.getElementById("attention-heatmap");
  const attentionHeatmapLabelsEl = document.getElementById("attention-heatmap-labels");
  const explainPanelEl = document.getElementById("explain-panel");
  const explainToggleEl = document.getElementById("explain-toggle");
  const explainContentEl = document.getElementById("explain-content");
  const replayStatusEl = document.getElementById("replay-status");
  const replayPlayEl = document.getElementById("replay-play");
  const replayPauseEl = document.getElementById("replay-pause");
  const replayStepEl = document.getElementById("replay-step");
  const replaySpeedEl = document.getElementById("replay-speed");
  const replayExitEl = document.getElementById("replay-exit");
  const replayOutputEl = document.getElementById("replay-output");
  const objectivesListEl = document.getElementById("objectives-list");
  const objectivesEvaluateEl = document.getElementById("objectives-evaluate");
  const diagnosticsListEl = document.getElementById("diagnostics-list");
  const diagnosticsEvaluateEl = document.getElementById("diagnostics-evaluate");
  const scoresListEl = document.getElementById("scores-list");
  const scoresEvaluateEl = document.getElementById("scores-evaluate");
  const savesListEl = document.getElementById("saves-list");
  const saveRunEl = document.getElementById("save-run");
  const savesMessageEl = document.getElementById("saves-message");
  const onboardingEl = document.getElementById("onboarding");
  const onboardingStepEl = document.getElementById("onboarding-step");
  const onboardingBodyEl = document.getElementById("onboarding-body");
  const onboardingSkipEl = document.getElementById("onboarding-skip");
  const onboardingNextEl = document.getElementById("onboarding-next");
  const errorScreenEl = document.getElementById("error-screen");
  const errorMessageEl = document.getElementById("error-message");
  const errorResetEl = document.getElementById("error-reset");
  const scenarioSelectEl = document.getElementById("scenario-select");
  const scenarioResetEl = document.getElementById("scenario-reset");
  const scenarioToggleEl = document.getElementById("scenario-toggle");
  const promptToggleEl = document.getElementById("prompt-toggle");
  const scenarioSummaryEl = document.getElementById("scenario-summary");
  const scenarioIntroEl = document.getElementById("scenario-intro");
  const scenarioObjectiveEl = document.getElementById("scenario-objective");
  const scenarioFailureEl = document.getElementById("scenario-failure");
  const tutorialPanelEl = document.getElementById("tutorial-panel");
  const tutorialProgressEl = document.getElementById("tutorial-progress");
  const tutorialCompleteEl = document.getElementById("tutorial-complete");
  const presetsListEl = document.getElementById("presets-list");
  const presetSaveEl = document.getElementById("preset-save");
  const settingsHintsEl = document.getElementById("settings-hints");
  const settingsAnimEl = document.getElementById("settings-anim");
  const settingsSoundEl = document.getElementById("settings-sound");
  const settingsLogsEl = document.getElementById("settings-logs");
  const logsListEl = document.getElementById("logs-list");
  const logsClearEl = document.getElementById("logs-clear");
  const promptListEl = document.getElementById("prompt-list");
  const promptTryEl = document.getElementById("prompt-try");
  const ctaButtonEl = document.getElementById("cta-button");
  const ctaHelperEl = document.getElementById("cta-helper");
  const unlockToastEl = document.getElementById("unlock-toast");
  const failureBannerEl = document.getElementById("failure-banner");
  const failureTitleEl = document.querySelector(".failure-title");
  const failureCauseEl = document.querySelector(".failure-cause");
  const failureHintEl = document.querySelector(".failure-hint");
  const failureRetryEl = document.getElementById("failure-retry");
  const lockContextBadgeEl = document.getElementById("lock-context-size");
  const lockTempBadgeEl = document.getElementById("lock-sampling-temp");
  const lockRandomBadgeEl = document.getElementById("lock-sampling-random");
  const sandboxToggleEl = document.getElementById("sandbox-mode");
  const sandboxBannerEl = document.getElementById("sandbox-banner");

  if (
    !inputEl ||
    !tokenListEl ||
    !countEl ||
    !tokenExampleEl ||
    !tokenExampleListEl ||
    !embeddingTitleEl ||
    !embeddingBarsEl ||
    !attentionListEl ||
    !pipelineStageEl ||
    !pipelineListEl ||
    !contextSizeEl ||
    !contextSizeSliderEl ||
    !contextSizeValueEl ||
    !contextActiveEl ||
    !contextDroppedEl ||
    !samplingSeedEl ||
    !samplingTempEl ||
    !samplingTempSliderEl ||
    !samplingTempValueEl ||
    !samplingRandomEl ||
    !samplingRandomSliderEl ||
    !samplingRandomValueEl ||
    !samplingRunEl ||
    !samplingListEl ||
    !samplingResultEl ||
    !runSaveEl ||
    !runReplayEl ||
    !replayIndicatorEl ||
    !generationPlayEl ||
    !generationPauseEl ||
    !generationStepEl ||
    !generationSpeedEl ||
    !hallucinationToggleEl ||
    !generationOutputEl ||
    !generationStepCountEl ||
    !generationCurrentEl ||
    !generationProbListEl ||
    !generationAttentionListEl ||
    !attentionHeatmapEl ||
    !attentionHeatmapLabelsEl ||
    !explainPanelEl ||
    !explainToggleEl ||
    !explainContentEl ||
    !replayStatusEl ||
    !replayPlayEl ||
    !replayPauseEl ||
    !replayStepEl ||
    !replaySpeedEl ||
    !replayExitEl ||
    !replayOutputEl ||
    !objectivesListEl ||
    !objectivesEvaluateEl ||
    !diagnosticsListEl ||
    !diagnosticsEvaluateEl ||
    !scoresListEl ||
    !scoresEvaluateEl ||
    !savesListEl ||
    !saveRunEl ||
    !savesMessageEl ||
    !onboardingEl ||
    !onboardingStepEl ||
    !onboardingBodyEl ||
    !onboardingSkipEl ||
    !onboardingNextEl ||
    !errorScreenEl ||
    !errorMessageEl ||
    !errorResetEl ||
    !scenarioSelectEl ||
    !scenarioResetEl ||
    !scenarioToggleEl ||
    !promptToggleEl ||
    !scenarioSummaryEl ||
    !scenarioIntroEl ||
    !scenarioObjectiveEl ||
    !scenarioFailureEl ||
    !tutorialPanelEl ||
    !tutorialProgressEl ||
    !tutorialCompleteEl ||
    !presetsListEl ||
    !presetSaveEl ||
    !settingsHintsEl ||
    !settingsAnimEl ||
    !settingsSoundEl ||
    !settingsLogsEl ||
    !logsListEl ||
    !logsClearEl ||
    !promptListEl ||
    !promptTryEl ||
    !ctaButtonEl ||
    !ctaHelperEl ||
    !unlockToastEl ||
    !failureBannerEl ||
    !failureTitleEl ||
    !failureCauseEl ||
    !failureHintEl ||
    !failureRetryEl ||
    !lockContextBadgeEl ||
    !lockTempBadgeEl ||
    !lockRandomBadgeEl ||
    !sandboxToggleEl ||
    !sandboxBannerEl
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
    generationDistributions: [],
    generationAttentionSteps: [],
    generationClock: null,
    generationRunning: false,
    replaySnapshot: null,
    replayIndex: 0,
    replayTimer: null,
    replaySpeed: 1,
    objectives: [],
    diagnostics: [],
    scores: [],
    unlockState: { ...defaultUnlocks },
    sandboxMode: false,
    hallucinationFlags: [],
    hallucinationEnabled: true,
    explainKey: "tokens",
    explainVisible: true,
    saves: [],
    scenarioId: scenarios[0].id,
    presets: [],
    useAltPrompt: false,
    generationSpeed: 1,
    maxTokens: 120,
    maxSteps: 80,
    limitsHit: false,
    onboardingStep: 0,
    advancedUnlocked: false,
    selectedPromptIndex: 0,
    tutorialStep: 0,
    tutorialInspected: false,
    tutorialAdjusted: false,
    tutorialComplete: false,
    settings: {
      hints: true,
      animSpeed: 1,
      sound: false,
      logs: true,
    },
    logs: [],
  };

  const onboardingSteps = [
    {
      title: "Welcome",
      body: "Run small experiments, inspect output, and iterate quickly.",
    },
    {
      title: "Generate",
      body: "Press Play or Step to see tokens appear one at a time.",
    },
    {
      title: "Inspect",
      body: "Use the panels to see attention, probabilities, and context.",
    },
    {
      title: "Adjust",
      body: "Change parameters to make the run more stable or more playful.",
    },
  ];

  const tokenExampleText = "Hello, token world!";

  const tutorialSteps = [
    {
      id: "run",
      title: "Run tokens",
      detail: "Press Play or Step to generate at least one token.",
    },
    {
      id: "inspect",
      title: "Inspect a token",
      detail: "Click a token to view its embedding and attention.",
    },
    {
      id: "adjust",
      title: "Adjust a control",
      detail: "Change context size, temperature, or randomness.",
    },
  ];

  function showErrorScreen(message) {
    console.error("App error:", message);
    errorMessageEl.textContent = message;
    errorScreenEl.hidden = false;
  }

  window.addEventListener("error", (event) => {
    showErrorScreen(event.message || "Unexpected error.");
  });

  window.addEventListener("unhandledrejection", (event) => {
    showErrorScreen(event.reason?.message || "Unexpected error.");
  });

  const unlockRules = {
    "context-safe": "context-size",
    "stable-sampling": "sampling-random",
    "focused-attention": "sampling-temp",
  };

  let unlockToastTimer = null;

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

  function renderTokenExample() {
    tokenExampleEl.innerHTML = "";
    tokenExampleListEl.innerHTML = "";
    let exampleTokens = [];
    try {
      exampleTokens = tokenize(tokenExampleText);
    } catch (err) {
      const fallback = document.createElement("div");
      fallback.textContent = "Token example unavailable.";
      tokenExampleEl.appendChild(fallback);
      return;
    }

    exampleTokens.forEach((token) => {
      const chip = document.createElement("span");
      chip.className = "token-boundary";
      chip.textContent = token.value;
      tokenExampleEl.appendChild(chip);

      const listItem = document.createElement("span");
      listItem.textContent = `${token.type}: "${token.value}"`;
      tokenExampleListEl.appendChild(listItem);
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
    generationProbListEl.innerHTML = "";
    generationAttentionListEl.innerHTML = "";
    attentionHeatmapEl.innerHTML = "";
    attentionHeatmapLabelsEl.innerHTML = "";
    state.generatedTokens.forEach((token) => {
      const chip = document.createElement("div");
      chip.className = "generation-token";
      const flag = state.hallucinationFlags.find((item) => item.index === token.index);
      if (flag && state.hallucinationEnabled) {
        chip.classList.add("hallucination");
        chip.title = flag.reason;
      }
      chip.textContent = token.value;
      generationOutputEl.appendChild(chip);
    });
    generationStepCountEl.textContent = String(state.generatedTokens.length);
    const currentToken =
      state.generatedTokens.length > 0
        ? state.generatedTokens[state.generatedTokens.length - 1].value
        : "-";
    generationCurrentEl.textContent = currentToken;

    if (state.generationDistributions.length === 0) {
      const row = document.createElement("div");
      row.className = "generation-prob-row";
      row.textContent = "No probabilities yet.";
      generationProbListEl.appendChild(row);
    } else {
      const lastDistribution =
        state.generationDistributions[state.generationDistributions.length - 1];
      const chosenIndex = state.generatedTokens.length - 1;
      const ranked = lastDistribution
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      ranked.forEach(({ value, index }) => {
        const row = document.createElement("div");
        row.className = "generation-prob-row";
        if (index === chosenIndex) {
          row.classList.add("selected");
        }

        const label = document.createElement("div");
        label.textContent = state.tokens[index]?.value ?? "-";

        const valueEl = document.createElement("div");
        valueEl.className = "sampling-value";
        valueEl.textContent = value.toFixed(2);

        row.append(label, valueEl);
        generationProbListEl.appendChild(row);
      });
    }

    if (state.generationAttentionSteps.length === 0) {
      const row = document.createElement("div");
      row.className = "generation-prob-row";
      row.textContent = "No attention yet.";
      generationAttentionListEl.appendChild(row);
    } else {
      const lastAttention =
        state.generationAttentionSteps[state.generationAttentionSteps.length - 1];
      lastAttention.forEach((value, index) => {
        const row = document.createElement("div");
        row.className = "generation-prob-row";

        const label = document.createElement("div");
        label.textContent = state.tokens[index]?.value ?? "-";

        const valueEl = document.createElement("div");
        valueEl.className = "sampling-value";
        valueEl.textContent = value.toFixed(2);

        row.append(label, valueEl);
        generationAttentionListEl.appendChild(row);
      });

      lastAttention.forEach((value, index) => {
        const cell = document.createElement("div");
        cell.className = "heatmap-cell";
        cell.title = `${state.tokens[index]?.value ?? "-"}: ${value.toFixed(2)}`;
        const intensity = Math.round(180 + value * 75);
        cell.style.background = `rgb(${intensity}, ${150}, ${220})`;
        attentionHeatmapEl.appendChild(cell);

        const label = document.createElement("div");
        label.className = "heatmap-label";
        label.textContent = state.tokens[index]?.value?.[0] ?? "-";
        attentionHeatmapLabelsEl.appendChild(label);
      });
    }
    advanceTutorialIfReady();
    renderCTA();
  }

  function renderExplanation() {
    const text = explanations[state.explainKey] || explanations.tokens;
    explainContentEl.textContent = text;
    explainPanelEl.classList.toggle("hidden", !state.explainVisible);
    explainToggleEl.textContent = state.explainVisible ? "Hide" : "Show";
  }

  function renderCTA() {
    const hasReplay = Boolean(state.replayMode);
    if (hasReplay) {
      const replayDone =
        !state.replaySnapshot ||
        state.replayIndex >= state.replaySnapshot.generatedTokens.length;
      if (state.replayTimer) {
        ctaButtonEl.dataset.action = "pause-replay";
        ctaButtonEl.textContent = "Pause Replay";
        ctaHelperEl.textContent = "Replay is running.";
        return;
      }
      if (replayDone) {
        ctaButtonEl.dataset.action = "exit-replay";
        ctaButtonEl.textContent = "Exit Replay";
        ctaHelperEl.textContent = "Replay finished.";
        return;
      }
      ctaButtonEl.dataset.action = "play-replay";
      ctaButtonEl.textContent = "Play Replay";
      ctaHelperEl.textContent = "Continue the recorded run.";
      return;
    }

    if (state.generationRunning) {
      ctaButtonEl.dataset.action = "pause-run";
      ctaButtonEl.textContent = "Pause Run";
      ctaHelperEl.textContent = "Token generation is running.";
      return;
    }

    if (state.generatedTokens.length > 0 && state.generationIndex < state.tokens.length) {
      ctaButtonEl.dataset.action = "start-run";
      ctaButtonEl.textContent = "Continue Run";
      ctaHelperEl.textContent = "Resume token generation.";
      return;
    }

    ctaButtonEl.dataset.action = "start-run";
    ctaButtonEl.textContent = "Start Run";
    ctaHelperEl.textContent = "Start a run to see tokens generate.";
  }
  function renderReplay() {
    replayOutputEl.innerHTML = "";
    if (!state.replaySnapshot) {
      replayStatusEl.textContent = "Idle";
      renderCTA();
      return;
    }
    replayStatusEl.textContent = `Replaying step ${state.replayIndex}/${state.replaySnapshot.generatedTokens.length}`;
    const shown = state.replaySnapshot.generatedTokens.slice(0, state.replayIndex);
    shown.forEach((token) => {
      const chip = document.createElement("div");
      chip.className = "generation-token";
      chip.textContent = token.value;
      replayOutputEl.appendChild(chip);
    });
    renderCTA();
  }

  function renderObjectives() {
    objectivesListEl.innerHTML = "";
    if (state.sandboxMode) {
      const row = document.createElement("div");
      row.className = "objective-row";
      row.textContent = "Sandbox mode: objectives disabled.";
      objectivesListEl.appendChild(row);
      return;
    }
    if (state.objectives.length === 0) {
      const row = document.createElement("div");
      row.className = "objective-row";
      row.textContent = "No evaluation yet.";
      objectivesListEl.appendChild(row);
      return;
    }

    state.objectives.forEach((objective) => {
      const row = document.createElement("div");
      row.className = "objective-row";

      const status = document.createElement("div");
      status.className = "objective-status";
      status.textContent = objective.passed ? "Pass" : "Fail";
      if (!objective.passed) {
        status.classList.add("fail");
      }

      const desc = document.createElement("div");
      desc.textContent = objective.description;

      row.append(status, desc);
      objectivesListEl.appendChild(row);
    });
  }

  function renderDiagnostics() {
    diagnosticsListEl.innerHTML = "";
    if (state.diagnostics.length === 0) {
      const row = document.createElement("div");
      row.className = "diagnostic-row";
      row.textContent = "No failures detected.";
      diagnosticsListEl.appendChild(row);
      return;
    }

    state.diagnostics.forEach((failure) => {
      const row = document.createElement("div");
      row.className = "diagnostic-row";

      const title = document.createElement("div");
      title.className = "diagnostic-title";
      title.textContent = failure.id.replace(/-/g, " ").toUpperCase();

      const cause = document.createElement("div");
      cause.className = "diagnostic-line";
      cause.innerHTML = `<span>Cause:</span> ${failure.cause}`;

      const hint = document.createElement("div");
      hint.className = "diagnostic-line";
      hint.innerHTML = `<span>Hint:</span> ${failure.hint}`;

      const takeaway = document.createElement("div");
      takeaway.className = "diagnostic-line";
      takeaway.innerHTML = `<span>Takeaway:</span> ${failure.takeaway}`;

      row.append(title, cause, hint, takeaway);
      diagnosticsListEl.appendChild(row);
    });
  }

  function renderFailureBanner() {
    if (state.diagnostics.length === 0 && !state.limitsHit) {
      failureBannerEl.hidden = true;
      return;
    }
    if (state.limitsHit) {
      failureTitleEl.textContent = "Run capped for performance";
      failureCauseEl.textContent = "Cause: token or step limit reached.";
      failureHintEl.textContent = "Try a shorter prompt or fewer steps.";
      failureBannerEl.hidden = false;
      return;
    }
    const primary = state.diagnostics[0];
    failureTitleEl.textContent = "Run needs adjustment";
    failureCauseEl.textContent = `Cause: ${primary.cause}`;
    failureHintEl.textContent = `Try: ${primary.hint}`;
    failureBannerEl.hidden = false;
  }

  function renderScores() {
    scoresListEl.innerHTML = "";
    if (state.sandboxMode) {
      const row = document.createElement("div");
      row.className = "score-row";
      row.textContent = "Sandbox mode: scoring disabled.";
      scoresListEl.appendChild(row);
      return;
    }
    if (state.scores.length === 0) {
      const row = document.createElement("div");
      row.className = "score-row";
      row.textContent = "No scores yet.";
      scoresListEl.appendChild(row);
      return;
    }

    state.scores.forEach((score) => {
      const row = document.createElement("div");
      row.className = "score-row";

      const label = document.createElement("div");
      label.textContent = score.label;

      const barWrap = document.createElement("div");
      barWrap.className = "score-bar-wrap";

      const bar = document.createElement("div");
      bar.className = "score-bar";
      bar.style.width = `${Math.round(score.value * 100)}%`;

      const valueEl = document.createElement("div");
      valueEl.className = "score-value";
      valueEl.textContent = score.value.toFixed(2);

      barWrap.appendChild(bar);
      row.append(label, barWrap, valueEl);
      scoresListEl.appendChild(row);
    });
  }

  function renderSaves() {
    savesListEl.innerHTML = "";
    if (state.saves.length === 0) {
      const row = document.createElement("div");
      row.className = "score-row";
      row.textContent = "No saved runs yet.";
      savesListEl.appendChild(row);
      return;
    }

    state.saves.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "score-row";

      const label = document.createElement("div");
      label.textContent = entry.name;

      const buttonWrap = document.createElement("div");
      buttonWrap.className = "sampling-actions";

      const loadBtn = document.createElement("button");
      loadBtn.className = "generation-button";
      loadBtn.textContent = "Load";
      loadBtn.addEventListener("click", () => {
        applyRunSnapshot(entry.snapshot);
        state.replaySnapshot = entry.snapshot;
        state.replayIndex = 0;
        renderReplay();
        savesMessageEl.textContent = `Loaded: ${entry.name}`;
      });

      buttonWrap.appendChild(loadBtn);
      row.append(label, buttonWrap, document.createElement("div"));
      row.replaceChild(buttonWrap, row.children[1]);
      savesListEl.appendChild(row);
    });
  }

  function renderScenario() {
    const scenario = findScenario(state.scenarioId);
    scenarioSummaryEl.textContent = scenario.summary;
    scenarioIntroEl.textContent = scenario.intro;
    scenarioFailureEl.textContent = `Likely failure: ${scenario.failureHint}`;
    scenarioToggleEl.hidden = !scenario.promptAlt;
    promptToggleEl.textContent = state.useAltPrompt ? "Use A" : "Use B";
    const objective = state.objectives.find((item) => item.id === scenario.objectiveId);
    if (objective) {
      scenarioObjectiveEl.textContent = `Objective: ${objective.description} (${objective.passed ? "Pass" : "Fail"})`;
    } else {
      scenarioObjectiveEl.textContent = `Objective: ${scenario.objectiveId} (not evaluated)`;
    }
    renderTutorial();
  }

  function resetTutorialState() {
    state.tutorialStep = 0;
    state.tutorialInspected = false;
    state.tutorialAdjusted = false;
    state.tutorialComplete = false;
  }

  function advanceTutorialIfReady() {
    if (state.scenarioId !== "tutorial") {
      return;
    }
    const completions = [
      state.generatedTokens.length > 0,
      state.tutorialInspected && state.generatedTokens.length > 0,
      state.tutorialAdjusted,
    ];

    while (
      state.tutorialStep < completions.length &&
      completions[state.tutorialStep]
    ) {
      state.tutorialStep += 1;
    }

    if (state.tutorialStep >= completions.length) {
      state.tutorialComplete = true;
    }

    renderTutorial();
  }

  function markTutorialAdjusted() {
    if (state.scenarioId !== "tutorial") {
      return;
    }
    state.tutorialAdjusted = true;
    advanceTutorialIfReady();
  }

  function renderTutorial() {
    const isTutorial = state.scenarioId === "tutorial";
    tutorialPanelEl.hidden = !isTutorial;
    if (!isTutorial) {
      return;
    }

    tutorialProgressEl.innerHTML = "";
    tutorialSteps.forEach((step, index) => {
      const row = document.createElement("div");
      row.className = "tutorial-row";

      const status = document.createElement("div");
      status.className = "tutorial-status";
      let statusText = "Locked";
      if (index < state.tutorialStep) {
        statusText = "Done";
        status.classList.add("done");
      } else if (index === state.tutorialStep) {
        statusText = "Next";
      }
      status.textContent = statusText;

      const detail = document.createElement("div");
      detail.textContent = `${step.title}: ${step.detail}`;

      row.append(status, detail);
      tutorialProgressEl.appendChild(row);
    });

    if (state.tutorialComplete) {
      tutorialCompleteEl.textContent =
        "Completed: You ran a deterministic loop, inspected the output, and tuned the controls.";
      tutorialCompleteEl.hidden = false;
    } else {
      tutorialCompleteEl.hidden = true;
    }
  }

  function applyPrompt(index) {
    const prompt = examplePrompts[index];
    if (!prompt) {
      return;
    }
    state.selectedPromptIndex = index;
    inputEl.value = prompt.text;
    inputEl.focus();
    update();
    renderPromptLibrary();
  }

  function renderPromptLibrary() {
    promptListEl.innerHTML = "";
    examplePrompts.forEach((prompt, index) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "prompt-row";
      row.dataset.index = String(index);
      if (index === state.selectedPromptIndex) {
        row.classList.add("selected");
      }

      const label = document.createElement("div");
      label.className = "prompt-label";
      label.textContent = prompt.label;

      const text = document.createElement("div");
      text.className = "prompt-text";
      text.textContent = prompt.text;

      row.append(label, text);
      promptListEl.appendChild(row);
    });
  }

  function setOnboardingVisible(isVisible) {
    onboardingEl.hidden = !isVisible;
    onboardingEl.style.display = isVisible ? "flex" : "none";
  }

  function renderOnboarding() {
    const step = onboardingSteps[state.onboardingStep] || onboardingSteps[0];
    onboardingStepEl.textContent = step.title;
    onboardingBodyEl.textContent = step.body;
    setOnboardingVisible(true);
  }

  function completeOnboarding() {
    localStorage.setItem("llm-edu:onboarding", "done");
    setOnboardingVisible(false);
    unlockAdvancedControls("Advanced controls unlocked");
    state.scenarioId = "intro";
    scenarioSelectEl.value = "intro";
    const scenario = findScenario("intro");
    inputEl.value = scenario.prompt;
    if (scenario.params) {
      state.contextSize = scenario.params.contextSize;
      state.samplingTemp = scenario.params.samplingTemp;
      state.samplingRandom = scenario.params.samplingRandom;
      if (Number.isFinite(scenario.params.samplingSeed)) {
        state.samplingSeed = scenario.params.samplingSeed;
      }
    }
    renderScenario();
    update();
  }

  function renderPresets() {
    presetsListEl.innerHTML = "";
    state.presets.forEach((preset) => {
      const row = document.createElement("div");
      row.className = "score-row";

      const label = document.createElement("div");
      label.textContent = preset.name;

      const actions = document.createElement("div");
      actions.className = "sampling-actions";

      const applyBtn = document.createElement("button");
      applyBtn.className = "generation-button";
      applyBtn.textContent = "Apply";
      applyBtn.addEventListener("click", () => {
        state.contextSize = preset.params.contextSize;
        state.samplingTemp = preset.params.samplingTemp;
        state.samplingRandom = preset.params.samplingRandom;
        contextSizeEl.value = String(state.contextSize);
        contextSizeSliderEl.value = String(state.contextSize);
        contextSizeValueEl.textContent = String(state.contextSize);
        samplingTempEl.value = String(state.samplingTemp);
        samplingTempSliderEl.value = String(state.samplingTemp);
        samplingTempValueEl.textContent = state.samplingTemp.toFixed(1);
        samplingRandomEl.value = String(state.samplingRandom);
        samplingRandomSliderEl.value = String(state.samplingRandom);
        samplingRandomValueEl.textContent = state.samplingRandom.toFixed(2);
        persistParams();
        update();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "generation-button";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        state.presets = state.presets.filter((item) => item.id !== preset.id);
        localStorage.setItem("llm-edu:presets", JSON.stringify(state.presets));
        renderPresets();
      });

      actions.append(applyBtn, deleteBtn);
      row.append(label, actions, document.createElement("div"));
      row.replaceChild(actions, row.children[1]);
      presetsListEl.appendChild(row);
    });
  }

  function renderLogs() {
    logsListEl.innerHTML = "";
    if (!state.settings.logs) {
      const row = document.createElement("div");
      row.className = "score-row";
      row.textContent = "Logging is disabled.";
      logsListEl.appendChild(row);
      return;
    }
    if (state.logs.length === 0) {
      const row = document.createElement("div");
      row.className = "score-row";
      row.textContent = "No events yet.";
      logsListEl.appendChild(row);
      return;
    }
    state.logs.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "score-row";

      const label = document.createElement("div");
      label.textContent = `${entry.type} @ ${entry.time.split("T")[1].slice(0, 8)}`;

      const valueEl = document.createElement("div");
      valueEl.className = "score-value";
      valueEl.textContent = entry.payload?.note || "";

      row.append(label, document.createElement("div"), valueEl);
      logsListEl.appendChild(row);
    });
  }

  function recordEvent(type, payload) {
    if (!state.settings.logs) {
      return;
    }
    state.logs = logEvent(state.logs, type, payload);
    renderLogs();
  }

  function applySettings() {
    state.explainVisible = state.settings.hints;
    renderExplanation();
    state.generationSpeed = state.settings.animSpeed;
    if (state.generationClock) {
      state.generationClock.setSpeed(state.generationSpeed);
    }
    document.querySelectorAll("[data-hint]").forEach((element) => {
      element.style.display = state.settings.hints ? "block" : "none";
    });
  }

  function persistSettings() {
    localStorage.setItem("llm-edu:settings", JSON.stringify(state.settings));
  }

  function showUnlockToast(message) {
    if (unlockToastTimer) {
      clearTimeout(unlockToastTimer);
    }
    unlockToastEl.textContent = message;
    unlockToastEl.hidden = false;
    unlockToastTimer = setTimeout(() => {
      unlockToastEl.hidden = true;
    }, 2200);
  }

  function applyAdvancedVisibility() {
    const shouldShow = state.sandboxMode || state.advancedUnlocked;
    document.querySelectorAll("[data-advanced]").forEach((element) => {
      element.hidden = !shouldShow;
    });
  }

  function unlockAdvancedControls(message) {
    if (state.advancedUnlocked) {
      return;
    }
    state.advancedUnlocked = true;
    localStorage.setItem("llm-edu:advanced", "true");
    applyAdvancedVisibility();
    if (message) {
      showUnlockToast(message);
    }
  }

  function applyLockState() {
    const inputs = {
      "context-size": contextSizeEl,
      "sampling-temp": samplingTempEl,
      "sampling-random": samplingRandomEl,
    };
    const badges = {
      "context-size": lockContextBadgeEl,
      "sampling-temp": lockTempBadgeEl,
      "sampling-random": lockRandomBadgeEl,
    };

    Object.keys(inputs).forEach((key) => {
      const unlocked = state.sandboxMode ? true : state.unlockState[key];
      inputs[key].disabled = !unlocked;
      inputs[key].classList.toggle("locked-input", !unlocked);
      badges[key].style.display = unlocked ? "none" : "inline-block";
    });
    contextSizeSliderEl.disabled = contextSizeEl.disabled;
    samplingTempSliderEl.disabled = samplingTempEl.disabled;
    samplingRandomSliderEl.disabled = samplingRandomEl.disabled;
  }

  function persistUnlocks() {
    localStorage.setItem("llm-edu:unlocks", JSON.stringify(state.unlockState));
  }

  function persistParams() {
    localStorage.setItem(
      "llm-edu:params",
      JSON.stringify({
        contextSize: state.contextSize,
        samplingTemp: state.samplingTemp,
        samplingRandom: state.samplingRandom,
      })
    );
  }

  function applyUnlockResults(results) {
    if (state.sandboxMode) {
      return;
    }
    const { state: nextState, unlocked } = applyUnlocks(
      state.unlockState,
      results,
      unlockRules
    );
    state.unlockState = nextState;
    if (unlocked.length > 0) {
      persistUnlocks();
      unlocked.forEach((key) => {
        showUnlockToast(`Unlocked: ${key.replace(/-/g, " ")}`);
      });
      unlockAdvancedControls("Advanced controls unlocked");
    }
    applyLockState();
  }
  function stopReplay() {
    if (state.replayTimer) {
      clearInterval(state.replayTimer);
      state.replayTimer = null;
    }
    renderCTA();
  }

  function stepReplay() {
    if (!state.replaySnapshot) {
      return;
    }
    if (state.replayIndex >= state.replaySnapshot.generatedTokens.length) {
      stopReplay();
      return;
    }
    state.replayIndex += 1;
    renderReplay();
  }

  function stopGeneration() {
    if (state.generationClock) {
      state.generationClock.stop();
    }
    state.generationRunning = false;
    renderCTA();
  }

  function resetGeneration() {
    stopGeneration();
    state.generationIndex = 0;
    state.generatedTokens = [];
    state.generationDistributions = [];
    state.generationAttentionSteps = [];
    state.hallucinationFlags = [];
    renderGeneration();
  }

  function stepGeneration() {
    if (state.generationIndex >= state.tokens.length) {
      stopGeneration();
      return;
    }
    if (!state.sandboxMode && state.generationIndex >= state.maxSteps) {
      state.limitsHit = true;
      stopGeneration();
      renderFailureBanner();
      return;
    }
    const token = state.tokens[state.generationIndex];
    const tokenWithIndex = { ...token, index: state.generationIndex };
    const distribution = buildStepDistribution(state.tokens, state.generationIndex, {
      seed: state.samplingSeed,
      temperature: state.samplingTemp,
      randomness: state.samplingRandom,
    });
    const attention = computeAttention(state.tokens, state.generationIndex);
    state.generatedTokens.push(tokenWithIndex);
    state.generationDistributions.push(distribution);
    state.generationAttentionSteps.push(attention);
    state.hallucinationFlags = detectHallucinations(
      state.generatedTokens,
      state.generationDistributions,
      0.2
    );
    state.generationIndex += 1;
    renderGeneration();
  }

  function ensureClock() {
    if (!state.generationClock) {
      state.generationClock = createClock({
        onTick: () => {
          stepGeneration();
        },
        intervalMs: 300,
      });
    }
    state.generationClock.setSpeed(state.generationSpeed);
  }

  function startGeneration() {
    ensureClock();
    state.generationRunning = true;
    state.generationClock.start();
    renderCTA();
  }

  function startReplay() {
    if (!state.replaySnapshot || state.replayTimer) {
      return;
    }
    const interval = Math.max(50, 400 / state.replaySpeed);
    state.replayTimer = setInterval(() => {
      stepReplay();
    }, interval);
    renderCTA();
  }

  function exitReplay() {
    stopReplay();
    state.replayMode = false;
    state.replaySnapshot = null;
    state.replayIndex = 0;
    replayOutputEl.innerHTML = "";
    replayStatusEl.textContent = "Idle";
    renderCTA();
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
      console.error("Tokenization error:", err);
      tokenListEl.innerHTML = "";
      countEl.textContent = "0";
      const row = document.createElement("div");
      row.className = "token-row token-error";
      row.textContent = err.message;
      tokenListEl.appendChild(row);
      return;
    }

    if (!state.sandboxMode && tokens.length > state.maxTokens) {
      state.tokens = tokens.slice(0, state.maxTokens);
      state.limitsHit = true;
    } else {
      state.tokens = tokens;
      state.limitsHit = false;
    }
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
    renderReplay();
    renderObjectives();
    renderDiagnostics();
    renderScores();
    renderExplanation();
    renderFailureBanner();
    renderSaves();
    renderPresets();
    renderLogs();
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
      generationIndex: state.generationIndex,
      generatedTokens: state.generatedTokens,
      generationDistributions: state.generationDistributions,
      generationAttentionSteps: state.generationAttentionSteps,
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
    state.generationIndex = snapshot.generationIndex ?? 0;
    state.generatedTokens = snapshot.generatedTokens ?? [];
    state.generationDistributions = snapshot.generationDistributions ?? [];
    state.generationAttentionSteps = snapshot.generationAttentionSteps ?? [];
    state.hallucinationFlags = detectHallucinations(
      state.generatedTokens,
      state.generationDistributions,
      0.2
    );

    if (state.selectedStageId) {
      pipelineStageEl.value = state.selectedStageId;
    }

    renderTokens(state.tokens);
    renderEmbedding();
    renderAttention();
    renderPipeline();
    renderContextWindow();
    renderSampling();
    renderGeneration();
  }

  function saveRun() {
    const snapshot = buildRunSnapshot();
    localStorage.setItem("llm-edu:lastRun", JSON.stringify(snapshot));
    recordEvent("run_complete", { note: "Recorded run" });
    if (!state.sandboxMode) {
      state.objectives = evaluateObjectives(snapshot);
      state.scores = scoreRun(snapshot);
      applyUnlockResults(state.objectives);
    }
    state.diagnostics = detectFailures(snapshot);
    renderObjectives();
    renderDiagnostics();
    renderScores();
    renderFailureBanner();
  }

  function saveRunToList() {
    const snapshot = buildRunSnapshot();
    const entry = {
      id: Date.now().toString(36),
      name: `Run ${new Date().toLocaleTimeString()}`,
      snapshot,
    };
    state.saves = [entry, ...state.saves].slice(0, 10);
    localStorage.setItem("llm-edu:saves", JSON.stringify(state.saves));
    savesMessageEl.textContent = `Saved: ${entry.name}`;
    renderSaves();
    recordEvent("run_complete", { note: entry.name });
  }

  function loadSaves() {
    const raw = localStorage.getItem("llm-edu:saves");
    if (!raw) {
      state.saves = [];
      return;
    }
    try {
      state.saves = JSON.parse(raw);
    } catch (err) {
      state.saves = [];
      savesMessageEl.textContent = "Saved runs are corrupted.";
    }
  }

  function persistScenario() {
    localStorage.setItem("llm-edu:scenario", JSON.stringify({ id: state.scenarioId }));
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
    state.replaySnapshot = snapshot;
    state.replayIndex = 0;
    renderReplay();
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
    state.explainKey = "tokens";
    renderExplanation();
    if (state.scenarioId === "tutorial") {
      state.tutorialInspected = true;
      advanceTutorialIfReady();
    }
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
    state.explainKey = "pipeline";
    renderExplanation();
  });

  contextSizeEl.addEventListener("input", () => {
    const parsed = Number.parseInt(contextSizeEl.value, 10);
    state.contextSize = Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
    contextSizeSliderEl.value = String(state.contextSize);
    contextSizeValueEl.textContent = String(state.contextSize);
    persistParams();
    update();
    state.explainKey = "context";
    renderExplanation();
    markTutorialAdjusted();
  });

  contextSizeSliderEl.addEventListener("input", () => {
    const parsed = Number.parseInt(contextSizeSliderEl.value, 10);
    state.contextSize = Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
    contextSizeEl.value = String(state.contextSize);
    contextSizeValueEl.textContent = String(state.contextSize);
    persistParams();
    update();
    state.explainKey = "context";
    renderExplanation();
    markTutorialAdjusted();
  });

  samplingSeedEl.addEventListener("input", () => {
    const parsed = Number.parseInt(samplingSeedEl.value, 10);
    state.samplingSeed = Number.isNaN(parsed) ? 0 : parsed;
    updateSamplingDistribution();
    renderSampling();
    markTutorialAdjusted();
  });

  samplingTempEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(samplingTempEl.value);
    state.samplingTemp = Number.isNaN(parsed) ? 1 : parsed;
    samplingTempSliderEl.value = String(state.samplingTemp);
    samplingTempValueEl.textContent = state.samplingTemp.toFixed(1);
    persistParams();
    updateSamplingDistribution();
    renderSampling();
    state.explainKey = "sampling";
    renderExplanation();
    markTutorialAdjusted();
  });

  samplingTempSliderEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(samplingTempSliderEl.value);
    state.samplingTemp = Number.isNaN(parsed) ? 1 : parsed;
    samplingTempEl.value = String(state.samplingTemp);
    samplingTempValueEl.textContent = state.samplingTemp.toFixed(1);
    persistParams();
    updateSamplingDistribution();
    renderSampling();
    state.explainKey = "sampling";
    renderExplanation();
    markTutorialAdjusted();
  });

  samplingRandomEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(samplingRandomEl.value);
    state.samplingRandom = Number.isNaN(parsed) ? 0 : parsed;
    samplingRandomSliderEl.value = String(state.samplingRandom);
    samplingRandomValueEl.textContent = state.samplingRandom.toFixed(2);
    persistParams();
    updateSamplingDistribution();
    renderSampling();
    state.explainKey = "sampling";
    renderExplanation();
    markTutorialAdjusted();
  });

  samplingRandomSliderEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(samplingRandomSliderEl.value);
    state.samplingRandom = Number.isNaN(parsed) ? 0 : parsed;
    samplingRandomEl.value = String(state.samplingRandom);
    samplingRandomValueEl.textContent = state.samplingRandom.toFixed(2);
    persistParams();
    updateSamplingDistribution();
    renderSampling();
    state.explainKey = "sampling";
    renderExplanation();
    markTutorialAdjusted();
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
    recordEvent("run_step", { note: "Sample draw" });
  });

  runSaveEl.addEventListener("click", () => {
    state.replayMode = false;
    saveRun();
    renderSampling();
    recordEvent("run_complete", { note: "Recorded run" });
  });

  runReplayEl.addEventListener("click", () => {
    replayRun();
    state.explainKey = "replay";
    renderExplanation();
    recordEvent("replay_start", { note: "Replay load" });
  });

  objectivesEvaluateEl.addEventListener("click", () => {
    const snapshot = buildRunSnapshot();
    state.objectives = evaluateObjectives(snapshot);
    renderObjectives();
    applyUnlockResults(state.objectives);
    state.explainKey = "objectives";
    renderExplanation();
    renderScenario();
    recordEvent("objective_eval", { note: "Objectives evaluated" });
  });

  diagnosticsEvaluateEl.addEventListener("click", () => {
    const snapshot = buildRunSnapshot();
    state.diagnostics = detectFailures(snapshot);
    renderDiagnostics();
    renderFailureBanner();
    recordEvent("failure_detected", { note: `Failures: ${state.diagnostics.length}` });
  });

  scoresEvaluateEl.addEventListener("click", () => {
    const snapshot = buildRunSnapshot();
    state.scores = scoreRun(snapshot);
    renderScores();
    recordEvent("run_complete", { note: "Scored run" });
  });

  scenarioSelectEl.addEventListener("change", () => {
    state.scenarioId = scenarioSelectEl.value;
    if (state.scenarioId === "tutorial") {
      resetTutorialState();
    }
    const scenario = findScenario(state.scenarioId);
    state.useAltPrompt = false;
    inputEl.value = scenario.prompt;
    if (scenario.params) {
      state.contextSize = scenario.params.contextSize;
      state.samplingTemp = scenario.params.samplingTemp;
      state.samplingRandom = scenario.params.samplingRandom;
      if (Number.isFinite(scenario.params.samplingSeed)) {
        state.samplingSeed = scenario.params.samplingSeed;
      }
    }
    persistScenario();
    renderScenario();
    update();
  });

  scenarioResetEl.addEventListener("click", () => {
    state.scenarioId = scenarios[0].id;
    if (state.scenarioId === "tutorial") {
      resetTutorialState();
    }
    const scenario = findScenario(state.scenarioId);
    state.useAltPrompt = false;
    inputEl.value = scenario.prompt;
    if (scenario.params) {
      state.contextSize = scenario.params.contextSize;
      state.samplingTemp = scenario.params.samplingTemp;
      state.samplingRandom = scenario.params.samplingRandom;
      if (Number.isFinite(scenario.params.samplingSeed)) {
        state.samplingSeed = scenario.params.samplingSeed;
      }
    }
    persistScenario();
    renderScenario();
    update();
  });

  onboardingNextEl.addEventListener("click", () => {
    state.onboardingStep += 1;
    if (state.onboardingStep >= onboardingSteps.length) {
      completeOnboarding();
      return;
    }
    renderOnboarding();
  });

  onboardingSkipEl.addEventListener("click", () => {
    completeOnboarding();
  });

  errorResetEl.addEventListener("click", () => {
    errorScreenEl.hidden = true;
    update();
  });

  promptToggleEl.addEventListener("click", () => {
    const scenario = findScenario(state.scenarioId);
    if (!scenario.promptAlt) {
      return;
    }
    state.useAltPrompt = !state.useAltPrompt;
    inputEl.value = state.useAltPrompt ? scenario.promptAlt : scenario.prompt;
    renderScenario();
    update();
  });

  promptListEl.addEventListener("click", (event) => {
    const target = event.target.closest(".prompt-row");
    if (!target) {
      return;
    }
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    applyPrompt(index);
  });

  promptTryEl.addEventListener("click", () => {
    applyPrompt(state.selectedPromptIndex);
  });

  presetSaveEl.addEventListener("click", () => {
    const name = `Preset ${new Date().toLocaleTimeString()}`;
    const entry = {
      id: Date.now().toString(36),
      name,
      params: {
        contextSize: state.contextSize,
        samplingTemp: state.samplingTemp,
        samplingRandom: state.samplingRandom,
      },
    };
    state.presets = [entry, ...state.presets].slice(0, 10);
    localStorage.setItem("llm-edu:presets", JSON.stringify(state.presets));
    renderPresets();
    recordEvent("preset_applied", { note: entry.name });
  });

  settingsHintsEl.addEventListener("change", () => {
    state.settings.hints = settingsHintsEl.checked;
    applySettings();
    persistSettings();
    recordEvent("settings_change", { note: "Hints toggled" });
  });

  settingsAnimEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(settingsAnimEl.value);
    state.settings.animSpeed = Number.isNaN(parsed) ? 1 : Math.max(parsed, 0.2);
    applySettings();
    persistSettings();
    recordEvent("settings_change", { note: "Animation speed" });
  });

  settingsSoundEl.addEventListener("change", () => {
    state.settings.sound = settingsSoundEl.checked;
    persistSettings();
    recordEvent("settings_change", { note: "Sound toggled" });
  });

  settingsLogsEl.addEventListener("change", () => {
    state.settings.logs = settingsLogsEl.checked;
    persistSettings();
    renderLogs();
  });

  saveRunEl.addEventListener("click", () => {
    saveRunToList();
    recordEvent("run_complete", { note: "Saved run" });
  });

  sandboxToggleEl.addEventListener("change", () => {
    state.sandboxMode = sandboxToggleEl.checked;
    sandboxBannerEl.hidden = !state.sandboxMode;
    objectivesEvaluateEl.disabled = state.sandboxMode;
    scoresEvaluateEl.disabled = state.sandboxMode;
    applyLockState();
    applyAdvancedVisibility();
  });

  ctaButtonEl.addEventListener("click", () => {
    const action = ctaButtonEl.dataset.action;
    if (action === "pause-run") {
      stopGeneration();
      recordEvent("run_pause", { note: "CTA pause" });
      return;
    }
    if (action === "start-run") {
      startGeneration();
      recordEvent("run_start", { note: "CTA play" });
      return;
    }
    if (action === "pause-replay") {
      stopReplay();
      recordEvent("replay_pause", { note: "CTA pause" });
      return;
    }
    if (action === "play-replay") {
      startReplay();
      recordEvent("replay_start", { note: "CTA play" });
      return;
    }
    if (action === "exit-replay") {
      exitReplay();
      recordEvent("replay_exit", { note: "CTA exit" });
    }
  });

  replayPlayEl.addEventListener("click", () => {
    startReplay();
    recordEvent("replay_start", { note: "Replay play" });
  });

  replayPauseEl.addEventListener("click", () => {
    stopReplay();
  });

  replayStepEl.addEventListener("click", () => {
    stepReplay();
    recordEvent("replay_step", { note: `Replay step ${state.replayIndex}` });
  });

  replaySpeedEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(replaySpeedEl.value);
    state.replaySpeed = Number.isNaN(parsed) ? 1 : Math.max(parsed, 0.2);
    if (state.replayTimer) {
      stopReplay();
    }
  });

  replayExitEl.addEventListener("click", () => {
    exitReplay();
  });

  failureRetryEl.addEventListener("click", () => {
    resetGeneration();
    state.diagnostics = [];
    renderDiagnostics();
    renderFailureBanner();
  });

  generationPlayEl.addEventListener("click", () => {
    startGeneration();
    recordEvent("run_start", { note: "Generation play" });
  });

  generationPauseEl.addEventListener("click", () => {
    stopGeneration();
    recordEvent("run_pause", { note: "Generation pause" });
  });

  generationStepEl.addEventListener("click", () => {
    ensureClock();
    state.generationClock.step();
    recordEvent("run_step", { note: `Step ${state.generationIndex}` });
  });

  generationSpeedEl.addEventListener("input", () => {
    const parsed = Number.parseFloat(generationSpeedEl.value);
    state.generationSpeed = Number.isNaN(parsed) ? 1 : Math.max(parsed, 0.2);
    if (state.generationClock) {
      state.generationClock.setSpeed(state.generationSpeed);
    }
  });

  hallucinationToggleEl.addEventListener("change", () => {
    state.hallucinationEnabled = hallucinationToggleEl.checked;
    renderGeneration();
  });

  explainToggleEl.addEventListener("click", () => {
    state.explainVisible = !state.explainVisible;
    renderExplanation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "e") {
      state.explainVisible = !state.explainVisible;
      renderExplanation();
    }
  });

  const storedParams = localStorage.getItem("llm-edu:params");
  if (storedParams) {
    try {
      const parsed = JSON.parse(storedParams);
      if (Number.isFinite(parsed.contextSize)) {
        state.contextSize = parsed.contextSize;
      }
      if (Number.isFinite(parsed.samplingTemp)) {
        state.samplingTemp = parsed.samplingTemp;
      }
      if (Number.isFinite(parsed.samplingRandom)) {
        state.samplingRandom = parsed.samplingRandom;
      }
    } catch (err) {
      // Ignore malformed stored params.
    }
  }

  inputEl.value = "Hello, world!\nTokenize this: A_B test.";
  contextSizeEl.value = String(state.contextSize);
  contextSizeSliderEl.value = String(state.contextSize);
  contextSizeValueEl.textContent = String(state.contextSize);
  samplingSeedEl.value = String(state.samplingSeed);
  samplingTempEl.value = String(state.samplingTemp);
  samplingTempSliderEl.value = String(state.samplingTemp);
  samplingTempValueEl.textContent = state.samplingTemp.toFixed(1);
  samplingRandomEl.value = String(state.samplingRandom);
  samplingRandomSliderEl.value = String(state.samplingRandom);
  samplingRandomValueEl.textContent = state.samplingRandom.toFixed(2);
  generationSpeedEl.value = String(state.generationSpeed);
  replaySpeedEl.value = String(state.replaySpeed);
  state.objectives = getObjectives().map((objective) => ({
    id: objective.id,
    description: objective.description,
    passed: false,
  }));
  state.diagnostics = [];
  state.scores = [];
  scenarioSelectEl.innerHTML = "";
  scenarios.forEach((scenario) => {
    const option = document.createElement("option");
    option.value = scenario.id;
    option.textContent = scenario.name;
    scenarioSelectEl.appendChild(option);
  });
  const storedScenario = localStorage.getItem("llm-edu:scenario");
  if (storedScenario) {
    try {
      const parsed = JSON.parse(storedScenario);
      if (parsed?.id) {
        state.scenarioId = parsed.id;
      }
    } catch (err) {
      // Ignore malformed stored scenario.
    }
  }
  scenarioSelectEl.value = state.scenarioId;
  const scenario = findScenario(state.scenarioId);
  if (state.scenarioId === "tutorial") {
    resetTutorialState();
  }
  inputEl.value = scenario.prompt;
  if (scenario.params) {
    state.contextSize = scenario.params.contextSize;
    state.samplingTemp = scenario.params.samplingTemp;
    state.samplingRandom = scenario.params.samplingRandom;
    if (Number.isFinite(scenario.params.samplingSeed)) {
      state.samplingSeed = scenario.params.samplingSeed;
    }
  }
  renderScenario();
  renderTokenExample();
  renderPromptLibrary();
  const storedPresets = localStorage.getItem("llm-edu:presets");
  if (storedPresets) {
    try {
      state.presets = hydratePresets(JSON.parse(storedPresets));
    } catch (err) {
      state.presets = [...defaultPresets];
    }
  } else {
    state.presets = [...defaultPresets];
  }
  renderPresets();
  loadSaves();
  const storedSettings = localStorage.getItem("llm-edu:settings");
  if (storedSettings) {
    try {
      state.settings = { ...state.settings, ...JSON.parse(storedSettings) };
    } catch (err) {
      // Ignore malformed settings.
    }
  }
  settingsHintsEl.checked = state.settings.hints;
  settingsAnimEl.value = String(state.settings.animSpeed);
  settingsSoundEl.checked = state.settings.sound;
  settingsLogsEl.checked = state.settings.logs;
  applySettings();
  const onboardingDone = localStorage.getItem("llm-edu:onboarding") === "done";
  if (!onboardingDone) {
    state.onboardingStep = 0;
    renderOnboarding();
  } else {
    setOnboardingVisible(false);
  }
  hallucinationToggleEl.checked = state.hallucinationEnabled;
  renderExplanation();

  document.querySelectorAll("[data-tooltip]").forEach((element) => {
    element.classList.add("tooltip-target");
    if (!element.hasAttribute("tabindex")) {
      element.setAttribute("tabindex", "0");
    }
  });
  const storedUnlocks = localStorage.getItem("llm-edu:unlocks");
  if (storedUnlocks) {
    try {
      state.unlockState = { ...defaultUnlocks, ...JSON.parse(storedUnlocks) };
    } catch (err) {
      state.unlockState = { ...defaultUnlocks };
    }
  }
  const storedAdvanced = localStorage.getItem("llm-edu:advanced");
  if (storedAdvanced === "true") {
    state.advancedUnlocked = true;
  }
  sandboxToggleEl.checked = state.sandboxMode;
  sandboxBannerEl.hidden = !state.sandboxMode;
  applyLockState();
  applyAdvancedVisibility();
  update();

  if (state.selectedStageId) {
    pipelineStageEl.value = state.selectedStageId;
  }
});
