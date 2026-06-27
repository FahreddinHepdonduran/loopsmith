---
name: grade
description: Use to independently verify a code change against its stated intent without modifying anything — a one-shot checker. Runs the project's test/lint/build commands, reviews the current diff against what was supposed to happen, and returns a structured PASS/FAIL verdict. Use standalone for a report-only (L1) review of pending changes, or as the checker step inside verify-loop. Trigger on "grade this", "does this change actually work", "verify the diff", "/grade", or a review-only request.
---

# grade

Independently grade a code change. **Read-only: never edit code, never fix anything.**
You only judge. The point is a verdict the maker could not have given itself, so come at
the change cold — from the intent and the diff, not from anyone's explanation of it.

## Inputs you need

1. **Acceptance statement** — one paragraph: "Done means: ___". Ask for it if not given.
   This is the bar. You grade against this, not against vibes.
2. **The diff** — `git diff` plus untracked files in a git repo; otherwise the explicit
   list of changed files (read them).
3. **Verify commands** — detect them if not provided:
   - Node: `package.json` scripts (`test`, `lint`, `build`, `typecheck`).
   - Python: `pytest`, `ruff`/`flake8`, `mypy`, `Makefile`/`pyproject.toml`.
   - Rust: `cargo test`, `cargo clippy`, `cargo build`. Go: `go test ./...`, `go vet`,
     `go build ./...`. Fall back to `Makefile`/`justfile` targets.

## What you do

1. Run every verify command. Capture exit codes and the meaningful part of the output
   (errors, failing test names — not noise).
2. Review the diff against the acceptance statement. Two distinct checks, do not conflate:
   - **Correctness:** do the commands pass?
   - **Intent match:** does the diff actually do what was asked, fully and without
     unrequested scope creep? Code can pass all checks and still not do the job.
3. Flag anything risky or out of scope (destructive ops, secrets, broad deletes,
   unrelated changes).

## Output — structured verdict

```
verdict: PASS | FAIL
commands:
  - cmd: <command>
    exit_code: <n>
    summary: <one line: passed / what failed>
intent_match: yes | no  — <why>
failures:            # empty when PASS
  - what: <what is wrong>
    why: <why it fails the acceptance statement>
    repro: <command or steps to see it>
notes: <risky / out-of-scope observations, or "none">
```

Rules:
- **FAIL if any command fails OR intent_match is no.** Both must be clean for PASS.
- Be specific. "Tests fail" is useless; name the test and the assertion.
- Make each failure independently actionable — the maker fixes from `failures` alone.
- When genuinely uncertain, lean FAIL and say what you could not confirm. A false PASS is
  the worst outcome; it is the exact bias this skill exists to remove.
