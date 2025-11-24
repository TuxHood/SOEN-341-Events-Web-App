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

## 🔑 Quick Start - Test Credentials
Concise quick commands

PowerShell (repo root):
```powershell
# start backend
.\scripts\start-backend.ps1

# start frontend (new terminal)
.\scripts\start-frontend.ps1

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
chmod +x ./scripts/start-frontend.sh.   #if "permission denied"
./scripts/start-frontend.sh

# generate sample data
source backend/collegeEventsWeb/.venv/bin/activate
python ./scripts/generate_sample_data.py

# run tests
chmod +x ./scripts/run-tests.sh  #if "permission denied"
./scripts/run-tests.sh
```
**For testing and development:**

- **Organizer**: `organizer@example.com` / `testpass123`
- **Attendee**: `attendee1@example.com` / `testpass123`

**Create sample data:**
```bash
cd backend/collegeEventsWeb
python manage.py create_sample_data
```
