---
inclusion: always
---

# Repository — Quick Reference

Rules for commits, branching, and productivity measurement. For detailed documentation, activate the `repository` skill.

## Commits

- Format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `chore`, `save`
- `qa()` commits are QA artifacts, not development work
- `save` = WIP, never the last commit of a slice
- `fix` only corrects a previous checkpoint — never use to finalize a `save`
- Fixes of slice N never go in slice M

## Branching

- Hierarchy: `integration` → `initiative/` → `solution/` → `slice/` | `bugfix/`
- All branches follow the same recursive lifecycle
- Merge always flows upward (slice → solution → initiative → integration)
- No cross-merges between branches at the same level
- Branches are deleted after merge (history preserved via merge commit)
- Bugfixes derive from the branch where the problem was detected

## Productivity Metrics

- Measured via `measure-week.sh` (weekly) and `measure-branch.sh` (per branch)
- Core metric: UIP/d = (Gross Insertions − Self-Churn) / Working Days
- Self-churn detected via git blame (parallelized)
- All branches treated equally for measurement
- Metrics auto-registered to `.branches.jsonl`
- Default: filters to current author (`$GIT_AUTHOR_EMAIL`)

## Activate the skill for:

- Detailed branching strategy and lifecycle rules
- Commit conventions with examples and resolution rules
- Metric definitions, formulas, and rating scales
- Running productivity scripts
- Understanding timezone handling (GMT-5 ↔ UTC)
