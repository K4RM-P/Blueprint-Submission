# Blueprint Submission

Hackathon project, built by two collaborators who both use Claude Code on this repo at the same time. Staying in sync matters more than anything else.

## Project overview
_Fill in as the project takes shape._

- **Stack:** TBD
- **How to run:** TBD
- **Key folders:** TBD

## Sync workflow (required for every task)
1. **Before any edit:** run `git status`. If there are uncommitted local changes, commit or stash them first. Then run `git pull --rebase` to get the teammate's latest work.
2. **Make the requested changes.** Keep them focused on what was asked. Don't reformat or restructure files you didn't need to touch, because that causes merge conflicts with the teammate.
3. **Verify:** make sure the project still builds or runs before committing.
4. **Commit:** stage only the relevant files and write a clear, descriptive commit message (e.g. "Add login form validation", not "updates").
5. **Pull again, then push:** run `git pull --rebase` right before `git push`, since the teammate may have pushed while you were working. Then push.
6. **Report:** tell the user briefly what changed, the commit message, and whether the push succeeded.

## Conflict and safety rules
- Never use `git push --force`, `git reset --hard`, or anything else that could delete the teammate's work.
- If a pull or rebase causes merge conflicts, try to resolve them in a way that keeps both sets of changes. If you aren't sure what the teammate intended, stop and show the user the conflict instead of guessing.
- If a push is rejected, pull with rebase and try again. Never force it.
- Never commit secrets, API keys, or `.env` files.
- Commit and push small, frequent changes instead of large batches, so the two of us stay in sync.
