import sqlite3
import pyotp

conn = sqlite3.connect(r'c:\RouthLocal\Plataforma_SaaS_IA\license_server\licenses.db')
c = conn.cursor()
c.execute("SELECT company_name, token, totp_secret FROM licenses")
for row in c.fetchall():
    totp = pyotp.TOTP(row[2])
    print(f"Empresa: {row[0]}")
    print(f"Token: {row[1]}")
    print(f"Secret: {row[2]}")
    print(f"Codigo Actual: {totp.now()}\n")
