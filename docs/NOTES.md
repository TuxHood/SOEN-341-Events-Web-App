# Notes & Next Steps

This file captures notes, suggestions and possible next steps related to the project and local development.

- Convert the sample-data generator to a Django management command for cleaner integration with `manage.py`.
- Make the generator idempotent by default (skip or update existing users instead of failing).
- Add a `docs/DEV_NOTES.md` describing ways to run both servers together (tmux, VS Code compound launch configurations, or Docker).
- Consider adding a `Makefile` or cross-platform `just`/`taskfile` for common developer tasks to reduce shell differences.
