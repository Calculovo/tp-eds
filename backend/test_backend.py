from unittest.mock import MagicMock

from backend import db
from backend import seed as seed_module


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


def test_seed_reviews_inserts_missing_review(monkeypatch):
	monkeypatch.setattr(
		seed_module,
		"SAMPLE_REVIEWS",
		[("sam@example.com", "Cafe", 4.5, "Nice")],
	)
	get_or_create_user = MagicMock(return_value=7)
	monkeypatch.setattr(seed_module, "get_or_create_user", get_or_create_user)
	cursor = MagicMock()
	cursor.fetchone.side_effect = [(3,), None]
	seed_module.seed_reviews(cursor)
	get_or_create_user.assert_called_once_with(cursor, "sam@example.com")
	insert_calls = [
		call
		for call in cursor.execute.call_args_list
		if "INSERT INTO reviews" in call.args[0]
	]
	assert len(insert_calls) == 1
	assert insert_calls[0].args[1] == (7, 3, 4.5, "Nice")


def test_seed_reviews_skips_existing_review(monkeypatch):
	monkeypatch.setattr(
		seed_module,
		"SAMPLE_REVIEWS",
		[("sam@example.com", "Cafe", 4.5, "Nice")],
	)
	monkeypatch.setattr(seed_module, "get_or_create_user", MagicMock(return_value=7))
	cursor = MagicMock()
	cursor.fetchone.side_effect = [(3,), (12,)]
	seed_module.seed_reviews(cursor)
	assert not any("INSERT INTO reviews" in call.args[0] for call in cursor.execute.call_args_list)


def test_seed_reviews_raises_for_missing_restaurant(monkeypatch):
	monkeypatch.setattr(
		seed_module,
		"SAMPLE_REVIEWS",
		[("sam@example.com", "Missing", 4.5, "Nice")],
	)
	cursor = MagicMock()
	cursor.fetchone.return_value = None
	try:
		seed_module.seed_reviews(cursor)
	except ValueError as error:
		assert str(error) == "Restaurant not found: Missing"
	else:
		assert False, "Expected a missing restaurant to raise ValueError"


def test_seed_votes_skips_missing_records_and_inserts_valid_vote(monkeypatch):
	monkeypatch.setattr(
		seed_module,
		"SAMPLE_VOTES",
		[
			("missing@example.com", "author@example.com", "Cafe", True),
			("voter@example.com", "author@example.com", "Cafe", False),
			("voter@example.com", "author@example.com", "Cafe", True),
		],
	)
	cursor = MagicMock()
	cursor.fetchone.side_effect = [None, (8,), (4,), None, (4,), (8,)]
	seed_module.seed_votes(cursor)
	insert_calls = [
		call
		for call in cursor.execute.call_args_list
		if "INSERT INTO review_votes" in call.args[0]
	]
	assert len(insert_calls) == 1
	assert insert_calls[0].args[1] == (8, 4, True)


def test_seed_follows_skips_missing_users_and_inserts_valid_follow(monkeypatch):
	monkeypatch.setattr(
		seed_module,
		"SAMPLE_FOLLOWS",
		[
			("missing@example.com", "followed@example.com"),
			("follower@example.com", "missing@example.com"),
			("follower@example.com", "followed@example.com"),
		],
	)
	cursor = MagicMock()
	cursor.fetchone.side_effect = [None, (2,), (1,), None, (1,), (2,)]
	seed_module.seed_follows(cursor)
	insert_calls = [
		call
		for call in cursor.execute.call_args_list
		if "INSERT INTO follows" in call.args[0]
	]
	assert len(insert_calls) == 1
	assert insert_calls[0].args[1] == (1, 2)


def test_seed_inserts_restaurants_when_database_is_empty(monkeypatch, capsys):
	connection = MagicMock()
	connection.__enter__.return_value = connection
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchone.return_value = (0,)
	cursor.fetchall.return_value = [("Cafe", 4.5, 1)]
	ensure_schema = MagicMock()
	seed_reviews = MagicMock()
	seed_follows = MagicMock()
	seed_votes = MagicMock()
	monkeypatch.setattr(seed_module, "connect", MagicMock(return_value=connection))
	monkeypatch.setattr(seed_module, "ensure_schema", ensure_schema)
	monkeypatch.setattr(seed_module, "seed_reviews", seed_reviews)
	monkeypatch.setattr(seed_module, "seed_follows", seed_follows)
	monkeypatch.setattr(seed_module, "seed_votes", seed_votes)
	seed_module.seed()
	ensure_schema.assert_called_once_with(connection)
	cursor.executemany.assert_called_once_with(
		"INSERT INTO restaurants (name, category, image_url) VALUES (%s, %s, %s)",
		seed_module.RESTAURANTS,
	)
	seed_reviews.assert_called_once_with(cursor)
	seed_follows.assert_called_once_with(cursor)
	seed_votes.assert_called_once_with(cursor)
	assert "('Cafe', 4.5, 1)" in capsys.readouterr().out
	

def test_seed_skips_restaurants_when_database_has_data(monkeypatch):
	connection = MagicMock()
	connection.__enter__.return_value = connection
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchone.return_value = (2,)
	monkeypatch.setattr(seed_module, "connect", MagicMock(return_value=connection))
	monkeypatch.setattr(seed_module, "ensure_schema", MagicMock())
	monkeypatch.setattr(seed_module, "seed_reviews", MagicMock())
	monkeypatch.setattr(seed_module, "seed_follows", MagicMock())
	monkeypatch.setattr(seed_module, "seed_votes", MagicMock())
	seed_module.seed()
	cursor.executemany.assert_not_called()
