<p align="center">
  <img src="assets/logo.svg" alt="loopsmith" width="320">
</p>

<p align="center"><strong>Loop engineering for coding agents.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version 0.1.0">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license MIT">
  <img src="https://img.shields.io/badge/Claude%20Code-plugin-8A63D2" alt="Claude Code plugin">
</p>

## What is this?

Prompting a coding agent turn by turn and hoping the result works is a slow way to ship. loopsmith wraps a code task in a loop instead: it writes the change, runs your tests, lint, and build, checks the resulting diff against what you actually asked for, and retries until it passes or the loop decides to stop.

It is a [Claude Code](https://www.anthropic.com/claude-code) plugin made of three skills.

The idea worth remembering: an agent that thinks it is done is not the same as a change that has been independently verified. loopsmith keeps a hard wall between the agent that makes the change (the maker) and the agent that grades it (the checker). The checker never sees the maker's reasoning, only the original intent, the resulting diff, and the command output. That independence removes the self-grading bias where an agent approves its own work.

## The three skills

| Skill | What it does |
|-------|--------------|
| **verify-loop** | The full loop. A maker sub-agent writes the change. A separate checker sub-agent with a clean context runs tests, lint, and build, and reviews the diff against the original intent. Failures feed back and it retries until PASS or a stop condition fires. |
| **grade** | The checker on its own. A one-shot, read-only verdict on a pending diff against its stated intent. Good for a report-only review, and it is the checker step inside verify-loop. |
| **loop-cost** | Estimate the token and iteration budget of a loop before running it, so the loop has a ceiling to stop against. |

## How it works

```
1. Capture the intent and auto-detect the verify commands.
2. Maker sub-agent writes the change.
3. Checker sub-agent runs the commands and reviews the diff against the intent.
4. PASS  -> exit.
   FAIL  -> structured feedback goes back to the maker.
5. Repeat until PASS or a stop condition fires.
```

The maker and the checker run in separate contexts. The checker judges two things independently: do the checks pass, and does the diff actually do what was asked.

## The half that says no

A loop without a stop condition is a token furnace. verify-loop stops on:

- **PASS**: the checks pass and the diff matches the intent.
- **Max iterations**: default 3.
- **No progress**: the same failure appears twice.
- **Budget exceeded**: the loop-cost ceiling is hit.
- **Risk or ambiguity**: it escalates to a human instead of forcing a destructive fix.

## Usage

Invoke the full loop in Claude Code:

```
/verify-loop "add pagination to the users endpoint and make the tests pass"
```

You can also run the checker standalone on a pending diff:

```
/grade
```

And estimate the budget before a big loop:

```
/loop-cost
```

## Status

v0.1.0, early. Scope is **code tasks** and **session-scoped** (one task, one loop). The plugin structure exists (`.claude-plugin/plugin.json` and `skills/`). An npx installer is planned and not wired up yet.

Planned:

- npx installer for one-line setup
- domain-agnostic grading (text, plans, analysis)
- a checker panel with majority vote for higher assurance
- scheduled and unattended loops

## License

MIT.
