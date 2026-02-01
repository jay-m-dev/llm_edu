# Frontend Architecture

## Framework and State
- Framework: Plain HTML/CSS/JS prototype today, migrate to a lightweight frontend framework later (e.g., React or Svelte).
- State: Single in-memory state object with explicit render functions (no backend state).

## Folder Structure (Proposed)
- `src/`: app entry and top-level layout
- `src/ui/`: reusable UI components (panels, lists, tooltips)
- `src/sim/`: simulation modules (tokenization, attention, sampling)
- `src/state/`: state store and persistence utilities
- `src/scenarios/`: scenario definitions and helpers
- `assets/`: fonts, icons, images

## Component Boundaries
- UI components render data and emit events only.
- Simulation modules are pure and deterministic.
- State layer coordinates UI and sim outputs.

## Data Flow
1. User updates inputs (prompt, parameters).
2. State updates and triggers sim modules.
3. Sim outputs are stored in state.
4. UI re-renders from state.

## Non-Goals
- No backend services or server-rendered UI.
- No real ML libraries or GPU dependencies.
