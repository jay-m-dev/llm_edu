export const explanations = {
  tokens: "Tokens are the small chunks the simulator reads and writes. Inspect them to see how input becomes model state.",
  attention: "Attention shows which tokens influence each step. Strong focus usually means more stable output.",
  context: "The context window is the short-term memory. Older tokens drop off as the window fills.",
  sampling: "Sampling controls variability. Higher randomness increases surprise but can reduce stability.",
  pipeline: "The pipeline simulates depth by transforming tokens in stages. Each stage leaves a trace you can inspect.",
  replay: "Replay lets you step through a completed run without changing the outcome.",
  objectives: "Objectives give a goal for a run and mark success or failure.",
};
