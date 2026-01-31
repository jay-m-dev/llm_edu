# Success and Failure Philosophy

## Philosophy Statement
Success means building intuition through clear experiments, not producing perfect text. Failure is expected and useful; it points to a specific mechanic to inspect and adjust.

## Failure Types and Learning Takeaways
- Context Drop: Missing output because earlier tokens were truncated. Takeaway: context limits shape what the model can remember.
- Sampling Drift: Output changes too much between runs. Takeaway: randomness settings control stability and creativity.
- Attention Misfocus: The model attends to the wrong tokens. Takeaway: attention bias can derail outcomes even with good prompts.

## Example Failure Messages
- "Context Drop: key tokens fell out of the window. Try shortening the prompt or increasing context size."
- "Sampling Drift: randomness is too high to stay consistent. Lower temperature and rerun."

## Example Success Messages
- "Stable run: your settings produced consistent output across steps."
- "Clear focus: attention stayed on the right tokens for this task."
