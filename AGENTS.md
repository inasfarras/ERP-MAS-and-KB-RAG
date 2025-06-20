# Contribution Guidelines

## Commit Message Style
Use conventional commits. Start each commit message with a prefix such as:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance tasks

Example: `feat: add user login api`.

## Checks Before Committing
Run the following commands from the project root and ensure they pass:

```bash
flake8
black --check .
isort --check-only .
pytest
pnpm test
```

For frontend contributions, also run:

```bash
pnpm lint
```

## Prohibited Files
Do **not** commit `backend/erp.db` or any other files ignored by `.gitignore`.
