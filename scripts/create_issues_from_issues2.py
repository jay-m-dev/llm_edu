#!/usr/bin/env python3
import csv
import os
import subprocess
import sys

BODIES = {
    "Add guided first-run experience": """### Goal
Give new players a guided first-run flow so they immediately understand what to do and why.

### Subtasks
- Draft a 4-step onboarding script (welcome, run, inspect, adjust) with 1-2 sentences each.
- Implement a modal/overlay that advances through the steps and can be skipped.
- Trigger the flow only on first visit using localStorage.
- On completion, route the player to the Intro scenario and start with its prompt.

### Acceptance Criteria
- The flow appears only on first visit and can be skipped at any time.
- Each step shows a clear instruction and next action.
- Completing the flow lands the player on the Intro scenario with its prompt loaded.
- Completion state persists across refresh.
""",
    "Add contextual inline hints": """### Goal
Show short, inline hints near controls so players understand what each control affects.

### Subtasks
- Identify 8-12 key controls that need hints (sampling, context, replay, etc.).
- Create a reusable inline hint component (short text under label).
- Add one-sentence hint copy for each selected control.
- Add a settings toggle to show/hide inline hints.

### Acceptance Criteria
- Inline hints appear next to the selected controls.
- Hints can be hidden and shown without a reload.
- Hint copy is one sentence and educational.
- Hints do not overlap or push controls off-screen on mobile widths.
""",
    "Add progressive disclosure of controls": """### Goal
Reveal advanced controls gradually to reduce cognitive load for new players.

### Subtasks
- Define which controls are "advanced" in a short list.
- Hide advanced controls by default with a locked/disabled state.
- Unlock advanced controls after completing a specific objective or onboarding step.
- Persist unlock state in localStorage.

### Acceptance Criteria
- Advanced controls are hidden or disabled on first visit.
- Completing the chosen trigger reveals the controls immediately.
- Unlocks persist across refresh.
- A brief unlock message is displayed once per control group.
""",
    "Add clear primary call-to-action": """### Goal
Make the next best action obvious at all times.

### Subtasks
- Define the primary action states (ready, running, paused, replaying).
- Add a dedicated CTA area near the top of the UI.
- Update CTA label and helper text based on the current state.
- Ensure the CTA triggers the correct action (run/play/continue).

### Acceptance Criteria
- A single primary action is visible and labeled at all times.
- CTA label changes appropriately with state.
- Clicking the CTA performs the intended action.
- CTA is visible without scrolling on common screen sizes.
""",
    "Add example prompts library": """### Goal
Provide curated prompts to help players quickly explore behaviors.

### Subtasks
- Create a data file with at least 6 example prompts and a short label each.
- Add a prompt library panel with a list of examples.
- Implement click-to-insert into the input box.
- Add a "Try this" button that inserts and focuses the input.

### Acceptance Criteria
- At least 6 example prompts are available.
- Clicking an example replaces the input text and focuses the input.
- Prompt library is visible and scrollable on smaller screens.
- No network calls are used to load prompts.
""",
    "Add interactive tutorial scenario": """### Goal
Teach the core loop through a hands-on, step-by-step scenario.

### Subtasks
- Define a tutorial scenario with a short prompt and fixed parameters.
- Add 3 guided steps (run, inspect, adjust) with required actions.
- Track step completion and advance automatically on success.
- Display progress and a completion message at the end.

### Acceptance Criteria
- Tutorial appears in the scenario list and is selectable.
- Steps require specific actions and cannot be skipped accidentally.
- Completion shows a brief learning summary.
- Scenario progress is deterministic with a fixed seed.
""",
    "Add visual explanation of tokenization": """### Goal
Visually explain how input text becomes tokens in a simple, inspectable way.

### Subtasks
- Add a small explainer panel near the token list.
- Show a sample input string and highlight token boundaries.
- Display the resulting token list under the sample.
- Add a one-sentence caption explaining tokenization.

### Acceptance Criteria
- The explainer panel is visible and readable on desktop and mobile.
- Token boundaries are clearly highlighted in the sample.
- The token list matches the highlighted sample.
- Caption is one sentence and non-technical.
""",
    "Add attention visualization explanation": """### Goal
Explain the attention visualization in plain language.

### Subtasks
- Add a short paragraph next to the attention heatmap.
- Include a legend describing color intensity or weight meaning.
- Add a one-sentence example describing what a strong focus means.

### Acceptance Criteria
- Explanation and legend are visible near the attention view.
- Copy is under 3 sentences total.
- Users can understand what high vs low attention means.
""",
    "Add context window explanation": """### Goal
Explain what the context window is and how it affects generation.

### Subtasks
- Add a small explanation block above the context window panel.
- Include a before/after example of truncation in one line.
- Add a one-sentence tip about increasing context size.

### Acceptance Criteria
- Explanation is visible near the context window view.
- Example shows tokens dropping off clearly.
- Tip is one sentence and actionable.
""",
    "Add sampling controls explanation": """### Goal
Explain temperature and randomness using simple language and examples.

### Subtasks
- Add a short explanation block near sampling controls.
- Include two short examples: low randomness vs high randomness.
- Add one sentence describing temperature in plain language.

### Acceptance Criteria
- Explanation is visible near sampling controls.
- Examples are concise and understandable.
- Copy avoids math-heavy language.
""",
    "Add failure explanation overlay": """### Goal
Provide a clear, non-punitive overlay when output is bad or unexpected.

### Subtasks
- Create a dismissible overlay that appears on failure.
- Show failure name, cause, and a next-step hint.
- Ensure overlay does not block critical controls permanently.
- Add a "Try Again" action to reset the run.

### Acceptance Criteria
- Overlay appears on failure events and can be dismissed.
- Cause and hint are visible without scrolling.
- Try Again resets the run state.
- Tone is encouraging and non-blaming.
""",
    "Add \"Why did this happen?\" breakdown": """### Goal
Let players inspect a quick breakdown of the last output.

### Subtasks
- Capture a summary of the last run (tokens, attention, sampling, context).
- Add a collapsible panel titled "Why did this happen?".
- Populate the panel with 3-4 bullet explanations tied to the run.
- Persist the last breakdown so it survives a refresh.

### Acceptance Criteria
- Panel opens and closes reliably.
- Breakdown updates after each run.
- Bullets reference actual run data (tokens, attention, sampling).
- Data persists across refresh.
""",
    "Add glossary of key concepts": """### Goal
Provide a lightweight glossary for key terms used in the UI.

### Subtasks
- Create a glossary data file with 10-15 terms and one-sentence definitions.
- Build a glossary panel with search/filter.
- Link glossary entries from related UI sections.

### Acceptance Criteria
- Glossary panel lists all terms and definitions.
- Search filters terms as the user types.
- Clicking a term jumps to its definition.
- No external dependencies are required.
""",
    "Add hover-based micro-explanations": """### Goal
Show short explanations on hover for technical terms.

### Subtasks
- Identify 10-15 technical terms in the UI.
- Add hover/focus tooltips with one-sentence explanations.
- Ensure tooltips are keyboard-accessible.

### Acceptance Criteria
- Tooltips appear on hover and focus.
- At least 10 terms have micro-explanations.
- Tooltips do not obstruct primary actions.
- Copy is one sentence per term.
""",
    "Add clear reset and undo actions": """### Goal
Let players reset or undo experiments safely.

### Subtasks
- Add a Reset button that clears the current run state.
- Add an Undo button that restores the previous run snapshot.
- Store the previous run snapshot on each run completion.
- Add a short confirmation text for Reset.

### Acceptance Criteria
- Reset clears the run and generated output.
- Undo restores the immediately previous run.
- Buttons are visible and labeled clearly.
- No data loss beyond the current run.
""",
    "Add visual progression indicators": """### Goal
Show progress in learning outcomes, not just game progress.

### Subtasks
- Define 3-5 learning milestones tied to objectives or scenarios.
- Add a progress panel with a simple visual indicator (bars or checklist).
- Update progress when objectives are completed.
- Persist progress in localStorage.

### Acceptance Criteria
- Progress panel is visible and updates in real time.
- Indicators reflect objective completion accurately.
- Progress persists across refresh.
- No network calls are used.
""",
    "Add plain-language labels for controls": """### Goal
Make controls understandable without technical jargon.

### Subtasks
- Create a mapping of technical labels to plain-language labels.
- Update UI labels for key controls (sampling, context, replay).
- Add a short sublabel where a label alone isn’t enough.

### Acceptance Criteria
- Updated labels are visible across the UI.
- Labels are understandable to non-technical users.
- No loss of meaning compared to original terms.
""",
    "Add onboarding checklist": """### Goal
Give players a short checklist of things to try.

### Subtasks
- Define a checklist with 5-7 items tied to core concepts.
- Add a checklist panel with completion checkboxes.
- Mark items complete when the relevant action occurs.
- Persist checklist state in localStorage.

### Acceptance Criteria
- Checklist is visible and readable.
- Items check off when actions are performed.
- Checklist state persists across refresh.
- Checklist can be reset.
""",
    "Add end-of-scenario learning summary": """### Goal
Summarize what the player learned after completing a scenario.

### Subtasks
- Create a summary template with 2-3 bullet points.
- Trigger the summary when a scenario objective is completed.
- Show the summary in a modal or panel with a close action.
- Store the last summary for replay viewing.

### Acceptance Criteria
- Summary appears after scenario completion.
- Summary text references the scenario’s key lesson.
- Summary can be dismissed.
- Summary is stored for later viewing.
""",
    "Add accessibility and readability pass": """### Goal
Improve readability and accessibility for long sessions.

### Subtasks
- Audit contrast for text, buttons, and highlights.
- Increase base font sizes where needed.
- Add visible focus styles for keyboard navigation.
- Adjust spacing for dense panels.

### Acceptance Criteria
- Text contrast meets basic readability expectations.
- Focus outlines are visible for interactive elements.
- Long sessions feel less visually fatiguing.
- No layout breakage on mobile widths.
""",
}


def main():
    csv_path = os.path.join("prototype", "issues2.csv")
    if not os.path.exists(csv_path):
        print(f"Missing CSV: {csv_path}", file=sys.stderr)
        return 1

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        titles = []
        for row in reader:
            if not row.get("title"):
                continue
            title = row["title"].strip().replace(r'\"', '"')
            titles.append(title)

    missing = [title for title in titles if title not in BODIES]
    if missing:
        print("Missing bodies for titles:", ", ".join(missing), file=sys.stderr)
        return 1

    for title in titles:
        body = BODIES[title]
        cmd = ["gh", "issue", "create", "--title", title, "--body", body]
        result = subprocess.run(cmd, check=False, capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stderr.strip(), file=sys.stderr)
            return result.returncode
        print(result.stdout.strip())

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
