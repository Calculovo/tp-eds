import os

import psycopg

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://restaurank:restaurank@localhost:5432/restaurank",
)


def connect() -> psycopg.Connection:
    return psycopg.connect(DATABASE_URL)


def _username_from_email(email: str) -> str:
    return email.split("@", 1)[0][:50]


def ensure_schema(conn: psycopg.Connection) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)"
        )
        cur.execute("SELECT id, email FROM users WHERE username IS NULL")
        for user_id, email in cur.fetchall():
            base = _username_from_email(email)
            username = base
            suffix = 1
            while True:
                cur.execute(
                    "SELECT 1 FROM users WHERE username = %s",
                    (username,),
                )
                if cur.fetchone() is None:
                    break
                suffix += 1
                username = f"{base[:47]}{suffix}"
            cur.execute(
                "UPDATE users SET username = %s WHERE id = %s",
                (username, user_id),
            )
        cur.execute("ALTER TABLE users ALTER COLUMN username SET NOT NULL")
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (username)"
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS follows (
                follower_id INTEGER NOT NULL REFERENCES users(id),
                followed_id INTEGER NOT NULL REFERENCES users(id),
                PRIMARY KEY (follower_id, followed_id),
                CHECK (follower_id <> followed_id)
            )
            """
        )
