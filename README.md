# SOEN-341-Events-Web-App
A platform for students to discover, organize, and attend campus events. It's built to streamline event management with the purpose of enhancing student engagement on campus. 

## Core Features 
- Event discovery: Browse and filter events by category, date, or popularity.
- Ticket Management: Simple ticket claiming for both free and paid events.
- QR code Check-in: Efficient QR code system for event organizers to manage attendees.
- Organizer Dashboard: View event analytics, manage listings, and track attendance.
- Admin Tools: Moderation tools to ensure event quality and safety.

## Team Members
- Yan Znaty - 40284722 - GitHub Username: yznaty
- Katerina D'Ambrosio - 40281139 - GitHub Username: kdambrosio5
- Rafik Shenouda - 40207802 - GitHub Username: Rafshenou
- Ayaan Vashistha - 40269814 - GitHub Username: ayaanvashistha17
- Joseph Daoud - 40210485 - GitHub Username: dahood434
- Aris Moldovan - 40290947 - GitHub Username: TuxHood
- Ryan Malaeb - 40238894 - GitHub Username: RyanMalaeb

## Languages & Techniques
- Frontend: React.js
- Backend: Python with Django
- Database: PostgreSQL

## Quick Start
See [`docs/INSTALLATION.md`](docs/INSTALLATION.md) for full installation and launch instructions.

### 🔑 Quick Start - Test Credentials
Concise quick commands. For more details consult:
- [`docs/HELPER_SCRIPTS.md`](docs/HELPER_SCRIPTS.md) for launching the website
- [`docs/GENERATE_SAMPLE_DATA.md`](docs/GENERATE_SAMPLE_DATA.md) for generating sample data
- [`docs/RUN_TESTS.md`](docs/RUN_TESTS.md) for running the tests

PowerShell (repo root):
```powershell
# start backend
.\scripts\start-backend.cmd

# start frontend (new terminal)
# Make sure you have the correct version of Node.js installed: Vite requires Node.js 20.19+ or 22.12+. Please upgrade if necessary.
.\scripts\start-frontend.cmd

# generate sample data
python .\scripts\generate_sample_data.py

# run tests
.\scripts\run-tests.ps1
```

Bash (repo root):
```bash
# start backend
chmod +x ./scripts/start-backend.sh    #if "permission denied"
./scripts/start-backend.sh

# start frontend (new terminal)
# Make sure you have the correct version of Node.js installed: Vite requires Node.js 20.19+ or 22.12+. Please upgrade if necessary.
chmod +x ./scripts/start-frontend.sh    #if "permission denied"
./scripts/start-frontend.sh

# generate sample data
source backend/collegeEventsWeb/.venv/bin/activate
python ./scripts/generate_sample_data.py

# run tests
chmod +x ./scripts/run-tests.sh  #if "permission denied"
./scripts/run-tests.sh
```
**For testing and development.**
After generating sample data from [`docs/GENERATE_SAMPLE_DATA.md`](docs/GENERATE_SAMPLE_DATA.md) :
- **Organizer**: `organizer1@example.com` / `password`
- **Attendee**: `student1@example.com` / `password`

## Documentations
The repository's developer and usage guides are consolidated under the `docs/` folder. Refer to these files for detailed, canonical instructions:

- [`docs/INSTALLATION.md`](docs/INSTALLATION.md) — install, setup and launch the dev environment (backend + frontend).
- [`docs/GENERATE_SAMPLE_DATA.md`](docs/GENERATE_SAMPLE_DATA.md) — how to generate or refresh sample data safely.
- [`docs/HELPER_SCRIPTS.md`](docs/HELPER_SCRIPTS.md) — description and usage of the `scripts/` helper scripts.
- [`docs/RUN_TESTS.md`](docs/RUN_TESTS.md) — test-running instructions and CI notes.
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) — common problems and fixes (migrations, venv, Node issues).

## System architecture
System architecture of this repo's system [`wiki/System-Architecture`](https://github.com/TuxHood/SOEN-341-Events-Web-App/wiki/System-Architecture)
