import os

import pytest

from backend import db


TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(
	TEST_DATABASE_URL is None,
	reason="Set TEST_DATABASE_URL to enable the PostgreSQL integration tests",
)


@pytest.fixture
def test_connection(monkeypatch):
	monkeypatch.setattr(db, "DATABASE_URL", TEST_DATABASE_URL)
	with db.connect() as connection:
		yield connection


def test_test_database_is_reachable(test_connection):
	with test_connection.cursor() as cursor:
		cursor.execute("SELECT 1")
		assert cursor.fetchone() == (1,)