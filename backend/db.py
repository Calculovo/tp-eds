import os

import psycopg

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://restaurank:restaurank@localhost:5432/restaurank",
)


def connect() -> psycopg.Connection:
    return psycopg.connect(DATABASE_URL)
