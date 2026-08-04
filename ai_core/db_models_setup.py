import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'config', 'brain_sessions.db')
print(f'Using DB: {DB_PATH}')
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS ai_models_stats (
    model_name TEXT PRIMARY KEY,
    tokens_used INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0
)
''')
conn.commit()
conn.close()
print('Table ai_models_stats created successfully.')