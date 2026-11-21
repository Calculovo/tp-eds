import os
from pathlib import Path
from typing import LiteralString, cast
from urllib.parse import urlparse

import pytest
from psycopg import sql

from backend import db


TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(
	TEST_DATABASE_URL is None,
	reason="Set TEST_DATABASE_URL to enable the PostgreSQL integration tests",
)


@pytest.fixture
def test_connection(monkeypatch):
	if TEST_DATABASE_URL is None:
		pytest.skip("TEST_DATABASE_URL is not configured")
	database_name = urlparse(TEST_DATABASE_URL).path.rsplit("/", 1)[-1]
	if not database_name.endswith("_test"):
		pytest.fail("TEST_DATABASE_URL must target a database ending in _test")

	monkeypatch.setattr(db, "DATABASE_URL", TEST_DATABASE_URL)
	with db.connect() as connection:
		with connection.cursor() as cursor:
			cursor.execute("SELECT to_regclass('public.restaurants')")
			table_row = cursor.fetchone()
			if table_row is None or table_row[0] is None:
				init_sql = Path(__file__).resolve().parents[1] / "db" / "init.sql"
				init_script = cast(LiteralString, init_sql.read_text(encoding="utf-8"))
				cursor.execute(sql.SQL(init_script))
		db.ensure_schema(connection)
		yield connection


def test_test_database_schema_is_initialized(test_connection):
	with test_connection.cursor() as cursor:
		cursor.execute(
			"""
			SELECT to_regclass('public.restaurants'),
			       to_regclass('public.users'),
			       to_regclass('public.reviews'),
			       to_regclass('public.follows'),
			       to_regclass('public.review_votes')
			"""
		)
		assert all(table is not None for table in cursor.fetchone())