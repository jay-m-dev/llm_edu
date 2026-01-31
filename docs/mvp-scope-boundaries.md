# MVP Scope Boundaries

## In Scope
- Deterministic, fake-but-faithful LLM simulation loop.
- Tokenization, context window, attention, and sampling visualizations.
- Scenario-based objectives and replayable runs.
- Single-player, web-first experience.
- Local save/load and parameter presets.
- Non-punitive failure diagnostics and feedback.
- Lightweight frontend-only architecture.
- Onboarding and in-UI explanations.

## Out of Scope
- Real model training or fine-tuning. Rationale: MVP is educational and deterministic.
- Real inference libraries or GPU usage. Rationale: avoids heavy compute and complexity.
- Multiplayer or social features. Rationale: single-player focus for MVP.
- Accounts, auth, or monetization. Rationale: no backend requirements.
- Backend services or cloud dependencies. Rationale: local-first deployment.
- Real-world data ingestion pipelines. Rationale: scenarios are curated and local.
- Competitive leaderboards. Rationale: avoid online services and scope creep.
- Mobile-native apps. Rationale: web-first delivery for MVP.
