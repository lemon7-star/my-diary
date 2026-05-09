---
name: fix-and-verify
description: Reproduce bugs, make the smallest safe fix, and verify the result locally. Use this skill whenever the user asks to fix a bug, debug auth, UI, or config issues, trace regressions, or wants a strict reproduce → patch → verify loop, especially in TypeScript web apps.
---

# Fix and Verify

Use this skill when the task is a bug fix or regression repair and the value comes from an evidence-driven loop rather than broad refactors.

## Goals

- Confirm the problem before editing
- Prefer root-cause fixes over speculative changes
- Keep the patch as small as possible
- Verify with concrete commands or browser checks before claiming success

## Workflow

1. Read the repo rules first, especially `CLAUDE.md`.
2. Reproduce the issue.
   - If the user already gave exact repro steps, follow them.
   - Otherwise inspect the codebase and infer the shortest reliable repro.
   - Record the failing behavior in one sentence before editing.
3. Identify the likely root cause.
   - Trace the problem to the narrowest file, function, or component range you can support with evidence.
   - Do not stack multiple unrelated fixes just because they look suspicious.
4. Make the smallest safe fix.
   - Change only the files needed to resolve the root cause.
   - Avoid opportunistic refactors.
5. Verify immediately after the edit.
   - UI, JSX, styles, or routing changes: run build, typecheck, or equivalent checks right away.
   - Auth changes: verify the affected login, signup, forgot-password, reset-password, or sign-out flow locally before concluding.
   - If a targeted test exists, run the narrowest relevant test first, then broader checks if needed.
6. Report with evidence.
   - Root cause
   - Files changed
   - Commands run
   - What passed or failed
   - Any remaining risk or external blocker

## Checkpoint mode for larger fixes

If the work spans multiple modules or risk areas:

- finish one slice at a time
- stop after each slice
- report changed files, verification results, and open risks
- wait for user approval before continuing

## Structured output rule

If the task also asks for structured deliverables such as test cases, tables, or bulk-formatted content:

- show a 3-5 row sample in the final format first
- expand only after the user confirms the template

## Environment precheck

For long or dependency-heavy tasks, verify early:

- dependencies are available
- dev server can start
- build or typecheck commands are available
- ports and services are reachable
- required auth, API, or external-service access is available

## Good default response shape

Use short status updates while working, then end with:

- root cause
- fix
- verification
- next step, if any

## Example triggers

- “帮我修这个登录报错，并确认本地流程走通”
- “这个按钮点了白屏，按最小修改修掉并验证”
- “密码重置流程又坏了，按复现到验证的闭环来”
