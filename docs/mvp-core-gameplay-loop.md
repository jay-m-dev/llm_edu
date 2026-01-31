# MVP Core Gameplay Loop

## Loop Steps
1. Set up an experiment.
   - Player input: prompt, parameters, scenario selection.
   - Simulation output: seeded run configuration and initial state.
2. Run the simulation.
   - Player input: press Run (or Step).
   - Simulation output: token-by-token generation and visuals.
3. Inspect the results.
   - Player input: pause, step, and hover to inspect visuals.
   - Simulation output: attention, probabilities, and context window data.
4. Learn from failure (or success).
   - Player input: review diagnostics and objective status.
   - Simulation output: failure cause and hint (or success summary).
5. Adjust and rerun.
   - Player input: tweak parameters or prompt.
   - Simulation output: updated run state, ready to replay.

## Failure Note
Failure typically happens in step 4 when a run violates an objective or triggers a failure condition; diagnostics explain why and how to improve.

## Onboarding Summary
Set up, run, inspect, learn, and iterate.
