# Agent Skills Usage

This project uses selected workflows from addyosmani/agent-skills.

Installed skills:

- `.agent-skills/using-agent-skills.md`
- `.agent-skills/spec-driven-development.md`
- `.agent-skills/planning-and-task-breakdown.md`
- `.agent-skills/incremental-implementation.md`
- `.agent-skills/code-review-and-quality.md`

Operating rules:

1. Before starting any non-trivial development task, first check which installed skill applies.
2. If the task involves a new feature, major change, or unclear requirement, use `spec-driven-development` first.
3. After a spec exists, use `planning-and-task-breakdown` to break work into small, verifiable tasks.
4. During implementation, use `incremental-implementation`: build one small vertical slice at a time.
5. Before considering a task complete, use `code-review-and-quality` to review the change.
6. Do not skip verification steps.
7. Do not modify unrelated files or perform opportunistic refactors.
8. If requirements are ambiguous, surface assumptions before implementation.
