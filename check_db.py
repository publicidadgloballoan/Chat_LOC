import sqlite3
conn = sqlite3.connect('backend/prisma/dev.db')
c = conn.cursor()
new_hash = '$2a$10$aPyoQzeVj8gz0jZx4RAlhOyILefis/st/XijOmX0ZoAd8YjNuPuTi'
c.execute("UPDATE agents SET password_hash=? WHERE id=1", (new_hash,))
conn.commit()
print("Password reset to 'admin123' for agent id=1")
c.execute("SELECT id, name, email, role FROM agents")
print(c.fetchall())
conn.close()
