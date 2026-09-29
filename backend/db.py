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

def _unique_username(cur, base: str) -> str:
    username = base
    suffix = 1
    while True:
        cur.execute("SELECT 1 FROM users WHERE username = %s", (username,))
        if cur.fetchone() is None:
            return username
        suffix += 1
        username = f"{base[:47]}{suffix}"

def get_or_create_user(cur, email: str) -> int:
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    existing = cur.fetchone()
    if existing is not None:
        return existing[0]

    username = _unique_username(cur, _username_from_email(email))
    cur.execute(
        "INSERT INTO users (email, username) VALUES (%s, %s)",
        (email, username),
    )
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    return cur.fetchone()[0]

def ensure_schema(conn: psycopg.Connection) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)"
        )

        cur.execute(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)"
        )
        cur.execute("SELECT id, email FROM users WHERE username IS NULL")
        for user_id, email in cur.fetchall():
            username = _unique_username(cur, _username_from_email(email))
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
        cur.execute(
            "SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_restaurant_unique'"
        )
        if cur.fetchone() is None:
            cur.execute(
                """
                ALTER TABLE reviews
                ADD CONSTRAINT reviews_user_restaurant_unique UNIQUE (user_id, restaurant_id)
                """
            )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS review_votes (
                id SERIAL PRIMARY KEY,
                review_id INTEGER NOT NULL REFERENCES reviews(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                is_helpful BOOLEAN NOT NULL,
                UNIQUE (review_id, user_id)
            )
            """
        )