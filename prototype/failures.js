export function detectFailures(snapshot) {
  if (!snapshot) {
    throw new TypeError("detectFailures: snapshot is required");
  }

  const failures = [];

  if (snapshot.contextDropped.length > 0) {
    failures.push({
      id: "context-drop",
      cause: "Key tokens fell out of the context window.",
      hint: "Increase context size or shorten the prompt.",
      takeaway: "Context limits determine what the model can remember.",
    });
  }

  if (snapshot.samplingRandom > 0.6) {
    failures.push({
      id: "sampling-drift",
      cause: "Randomness is high, causing unstable output.",
      hint: "Lower randomness for more consistent results.",
      takeaway: "Sampling controls stability and creativity.",
    });
  }

  if (snapshot.attentionWeights.length > 0) {
    const maxWeight = Math.max(...snapshot.attentionWeights);
    if (maxWeight < 0.35) {
      failures.push({
        id: "attention-diffuse",
        cause: "Attention is spread too evenly across tokens.",
        hint: "Tighten the prompt or adjust parameters to focus attention.",
        takeaway: "Diffuse attention can blur intent and reduce accuracy.",
      });
    }
  }

  if (snapshot.tokens.length === 0) {
    failures.push({
      id: "empty-input",
      cause: "No tokens were generated from the input.",
      hint: "Enter text to generate tokens.",
      takeaway: "Tokenization is the first step in any run.",
    });
  }

  return failures;
}
