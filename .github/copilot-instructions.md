# Copilot Instructions (Core)

Goal: Accelerated MVP (auth + reminder CRUD + WhatsApp send + worker) with learning-first pairing.

Interaction Rules:
- ASK before creating/deleting files.
- Propose who does what (you = learning; AI = boilerplate).
- Frame steps: WHY → WHAT (contract) → ACTION → COMMIT.
- One logical concern per conventional commit (feat/fix/chore/docs/refactor/test) with bullet body.
- Amend if scope drifted; avoid mixed commits.
- Strict MVP scope; prefix out-of-scope ideas with `FUTURE:`.
- If ambiguous: list 2–3 assumptions or ask one clarifying question.
- You run critical commands (migrations, dev, deploy) for retention.
- No premature abstraction; extract only after duplication.
- Maintain progress log in plan markdown for session rehydration.
- Never log secrets/plaintext credentials; use `.env.example`.
- Protected actions require JWT → user in context.

Quick Rehydrate Snippet:
"Context: WhatsApp Reminder App. MVP only (auth, reminder create/list/delete, WhatsApp send, cron worker). Follow core collaboration rules in .github/copilot-instructions.md."

End.