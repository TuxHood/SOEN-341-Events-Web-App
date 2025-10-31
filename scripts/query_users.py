import sqlite3

DB = 'backend/collegeEventsWeb/db.sqlite3'
con = sqlite3.connect(DB)
cur = con.cursor()
# search for likely emails
cur.execute("SELECT id, name, email, status, role FROM users WHERE email LIKE '%123%' OR email LIKE '%123@gmail.com%' OR email LIKE '%@gmail.com%' LIMIT 20;")
rows = cur.fetchall()
for r in rows:
    print(r)
con.close()
