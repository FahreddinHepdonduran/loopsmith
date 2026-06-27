---
name: verify-loop
description: Use when a code task needs to actually work, not just look done — wraps any coding task in a maker/checker verification loop. A maker sub-agent writes the change, a separate checker sub-agent (clean context) runs tests/lint/build and reviews the diff against the original intent, then feeds failures back and retries until it passes or a stop condition fires. Trigger on "verify loop", "make it pass", "loop until tests pass", "/verify-loop", or any "do X and make sure it actually works" request.
---

# verify-loop

Run a coding task inside a **maker → checker → retry** loop. You (the main session)
are the **orchestrator**. You do NOT write the code yourself and you do NOT grade it
yourself — you dispatch two separate sub-agents so the grader is independent of the maker.

The whole value of this skill is **independence**: the checker never sees the maker's
reasoning, only the original intent + the resulting diff + command output. A maker that
"thinks it's done" is not the same as a checker that confirms it. Keep that wall intact.

## Roles

- **Orchestrator (you):** capture intent, detect verify commands, run the loop, hold
  state (iteration count, past verdicts, spend), decide when to stop, report. Never edit
  code, never declare pass on your own judgment.
- **Maker sub-agent:** makes the code change. On iteration 1 it gets the task; on later
  iterations it gets the checker's structured feedback. It does not run the verification.
- **Checker sub-agent:** clean context. Gets ONLY the original intent + the current diff +
  the verify commands. Runs the commands, reviews the diff against intent, returns a
  structured PASS/FAIL verdict. It does not edit code. (This is the `grade` skill's job —
  reuse that contract.)

## Step 0 — Setup (once)

1. **Capture intent.** Restate the task as a one-paragraph acceptance statement:
   "Done means: ___". This exact text is what the checker grades against. Get it right.
2. **Auto-detect verify commands.** Inspect the project and pick the real commands:
   - Node: `package.json` scripts → `test`, `lint`, `build`, `typecheck`.
   - Python: `pytest`, `ruff`/`flake8`, `mypy`; `Makefile` targets; `pyproject.toml`.
   - Rust: `cargo test`, `cargo clippy`, `cargo build`.
   - Go: `go test ./...`, `go vet`, `go build ./...`.
   - Fall back to `Makefile` / `justfile` targets when present.
3. **Confirm with the user.** Show the detected commands and the acceptance statement.
   Let them edit or add. Do this ONCE, then run unattended.
4. **Diff source.** If the repo is a git repo, the diff is `git diff` (plus untracked
   files). If not, the maker must report every file it touched and the checker reads
   those before/after.
5. **Budget.** Default **max 3 iterations**. Read `loop-cost` for a token estimate if the
   task is large. Let the user override the cap.

## The loop

Repeat until a STOP condition fires:

1. **Maker turn.** Dispatch a maker sub-agent (Agent / Task tool).
   - Iteration 1 prompt: the task + acceptance statement + "make the change, keep it
     minimal and focused, report exactly which files you touched."
   - Iteration 2+ prompt: same task + acceptance statement + the checker's last verdict
     verbatim ("here is what failed and why — fix it").
2. **Checker turn.** Dispatch a checker sub-agent with a CLEAN context:
   - Inputs: acceptance statement + the current diff + the verify commands. NOT the
     maker's prompt or reasoning.
   - It runs every command, captures output, reviews the diff against intent, and returns:
     ```
     verdict: PASS | FAIL
     commands: [{cmd, exit_code, summary}]
     intent_match: does the diff actually do what was asked? (yes/no + why)
     failures: [{what, why, repro}]   # empty on PASS
     notes: anything risky/out-of-scope
     ```
3. **Decide.**
   - `PASS` → stop, report success.
   - `FAIL` → check STOP conditions. If clear to continue, feed `failures` back to a new
     maker turn. Increment iteration.

## STOP conditions — the half that says no

Stop and hand back to the human when ANY of these hit:

- **PASS** — checker verdict is PASS. ✓
- **Max iterations** — default 3 reached without PASS.
- **No progress** — checker returns the same or a worse failure set two turns running.
  Looping further just burns tokens; bail and explain.
- **Budget exceeded** — spend passes the `loop-cost` estimate.
- **Risk / ambiguity** — maker is unsure, or a fix would be destructive (data loss, broad
  deletes, irreversible ops). Do not let the loop push through these. Escalate.

Never silently give up and never fake a pass. If you stop without PASS, say so plainly,
show the last verdict, and state exactly what is still failing.

## Report

End with: outcome (PASS / stopped + reason), iterations used, commands run with their
exit codes, the final diff summary, and — if not passed — the precise remaining failures
and a suggested next step for the human.

## Notes

- Keep the maker's changes minimal each turn; large rewrites make the checker's intent
  match unreliable and waste budget.
- For higher assurance, the checker can be run as a panel of independent graders with a
  majority vote — out of scope for v1, add later.
- This skill is session-scoped: one task, one loop. For scheduled/unattended loops, that
  is a separate concern.
