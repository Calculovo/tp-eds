from unittest.mock import MagicMock

from backend import db


def test_connect_uses_configured_database_url(monkeypatch):
	connect = MagicMock()
	monkeypatch.setattr(db.psycopg, "connect", connect)
	db.connect()
	connect.assert_called_once_with(db.DATABASE_URL)


def test_username_from_email_uses_local_part_and_limits_length():
	assert db._username_from_email("sam@example.com") == "sam"
	assert db._username_from_email(f"{'a' * 60}@example.com") == "a" * 50


def test_unique_username_returns_base_when_available():
	cursor = MagicMock()
	cursor.fetchone.return_value = None
	username = db._unique_username(cursor, "sam")
	assert username == "sam"
	cursor.execute.assert_called_once_with(
		"SELECT 1 FROM users WHERE username = %s", ("sam",)
	)


def test_unique_username_adds_suffix_after_collisions():
	cursor = MagicMock()
	cursor.fetchone.side_effect = [(1,), (1,), None]
	base = "a" * 50
	username = db._unique_username(cursor, base)
	assert username == f"{'a' * 47}3"
	assert cursor.execute.call_count == 3


def test_get_or_create_user_returns_existing_user():
	cursor = MagicMock()
	cursor.fetchone.return_value = (12,)
	user_id = db.get_or_create_user(cursor, "sam@example.com")
	assert user_id == 12
	cursor.execute.assert_called_once_with(
		"SELECT id FROM users WHERE email = %s", ("sam@example.com",)
	)


def test_get_or_create_user_inserts_user_when_missing():
	cursor = MagicMock()
	cursor.fetchone.side_effect = [None, None, (23,)]
	user_id = db.get_or_create_user(cursor, "sam@example.com")
	assert user_id == 23
	cursor.execute.assert_any_call(
		"INSERT INTO users (email, username) VALUES (%s, %s)",
		("sam@example.com", "sam"),
	)


def test_get_or_create_user_uses_unique_username():
	cursor = MagicMock()
	cursor.fetchone.side_effect = [None, (1,), None, (24,)]
	user_id = db.get_or_create_user(cursor, "sam@example.com")
	assert user_id == 24
	cursor.execute.assert_any_call(
		"INSERT INTO users (email, username) VALUES (%s, %s)",
		("sam@example.com", "sam2"),
	)


def test_ensure_schema_backfills_users_and_adds_missing_constraint():
	connection = MagicMock()
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchall.return_value = [(7, "sam@example.com")]
	cursor.fetchone.side_effect = [None, None]
	db.ensure_schema(connection)
	cursor.execute.assert_any_call(
		"UPDATE users SET username = %s WHERE id = %s", ("sam", 7)
	)
	assert any(
		"ADD CONSTRAINT reviews_user_restaurant_unique" in call.args[0]
		for call in cursor.execute.call_args_list
	)
	assert any(
		"CREATE TABLE IF NOT EXISTS review_votes" in call.args[0]
		for call in cursor.execute.call_args_list
	)


def test_ensure_schema_skips_existing_constraint():
	connection = MagicMock()
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchall.return_value = []
	cursor.fetchone.return_value = (1,)
	db.ensure_schema(connection)
	assert not any(
		"ADD CONSTRAINT reviews_user_restaurant_unique" in call.args[0]
		for call in cursor.execute.call_args_list
	)
