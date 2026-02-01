# Simulation Engine Boundaries

## Engine API (Proposed)
- `tokenize(input: string) -> Token[]`
- `embed(tokens: Token[]) -> Embedding[]`
- `computeAttention(tokens: Token[], focusIndex: number) -> number[]`
- `applyContextWindow(tokens: Token[], maxSize: number) -> { active, dropped }`
- `buildDistribution(tokens: Token[], params) -> number[]`
- `stepGeneration(state, params) -> StepResult`

## Inputs and Outputs
| Input | Description | Output | Description |
| --- | --- | --- | --- |
| Prompt text | Raw user input | Tokens | Deterministic token list |
| Parameters | Context size, temperature, randomness | Distributions | Per-step probabilities |
| Step state | Current index, seed | Outputs | Generated token + metadata |

## UI Responsibilities
- Rendering panels, lists, and visualizations
- Handling user input and controls
- Persisting settings and saves in localStorage
- Displaying diagnostics, objectives, and tooltips

## Determinism
- Engine functions must be pure and deterministic.
- Randomness is driven by explicit seeds only.
