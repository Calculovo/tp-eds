import os
from pathlib import Path
from typing import LiteralString, cast
from urllib.parse import urlparse

import pytest
from fastapi.testclient import TestClient
from psycopg import sql

from backend import db
from backend import main as main_module


TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(
	TEST_DATABASE_URL is None,
	reason="Set TEST_DATABASE_URL to enable the PostgreSQL integration tests",
)


@pytest.fixture
def initialized_test_database(monkeypatch):
	if TEST_DATABASE_URL is None:
		pytest.skip("TEST_DATABASE_URL is not configured")
	database_name = urlparse(TEST_DATABASE_URL).path.rsplit("/", 1)[-1]
	if not database_name.endswith("_test"):
		pytest.fail("TEST_DATABASE_URL must target a database ending in _test")

	monkeypatch.setattr(db, "DATABASE_URL", TEST_DATABASE_URL)
	monkeypatch.setattr(main_module, "connect", db.connect)
	with db.connect() as connection:
		with connection.cursor() as cursor:
			cursor.execute("SELECT to_regclass('public.restaurants')")
			table_row = cursor.fetchone()
			if table_row is None or table_row[0] is None:
				init_sql = Path(__file__).resolve().parents[1] / "db" / "init.sql"
				init_script = cast(LiteralString, init_sql.read_text(encoding="utf-8"))
				cursor.execute(sql.SQL(init_script))
		db.ensure_schema(connection)
	with db.connect() as connection:
		with connection.cursor() as cursor:
			cursor.execute(
				"TRUNCATE TABLE review_votes, follows, reviews, users, restaurants "
				"RESTART IDENTITY CASCADE"
			)
	yield


def _insert_restaurant(name="Integration Cafe"):
	with db.connect() as connection:
		with connection.cursor() as cursor:
			cursor.execute(
				"INSERT INTO restaurants (name, category) VALUES (%s, %s) RETURNING id",
				(name, "Cafe"),
			)
			restaurant = cursor.fetchone()
			assert restaurant is not None
			return restaurant[0]


def test_test_database_schema_is_initialized(initialized_test_database):
	with db.connect() as connection:
		with connection.cursor() as cursor:
			cursor.execute(
				"""
				SELECT to_regclass('public.restaurants'),
				       to_regclass('public.users'),
				       to_regclass('public.reviews'),
				       to_regclass('public.follows'),
				       to_regclass('public.review_votes')
				"""
			)
			tables = cursor.fetchone()
			assert tables is not None
			assert all(table is not None for table in tables)


def test_application_connects_to_test_database(initialized_test_database):
	with TestClient(main_module.app) as client:
		response = client.get("/restaurants")

	assert response.status_code == 200
	assert isinstance(response.json(), list)


def test_review_creation_updates_restaurant_summary(initialized_test_database):
	restaurant_id = _insert_restaurant()
	with TestClient(main_module.app) as client:
		create_response = client.post(
			f"/restaurants/{restaurant_id}/reviews",
			json={
				"email": "reviewer@example.com",
				"rating": 4,
				"comment": "A good cafe",
			},
		)
		summary_response = client.get(f"/restaurants/{restaurant_id}")

	assert create_response.status_code == 201
	assert summary_response.status_code == 200
	assert summary_response.json()["average_rating"] == 4.0
	assert summary_response.json()["review_count"] == 1
	assert summary_response.json()["rating_counts"] == [0, 0, 0, 1, 0]


def test_changing_vote_updates_review_aggregates(initialized_test_database):
	restaurant_id = _insert_restaurant()
	with TestClient(main_module.app) as client:
		review_response = client.post(
			f"/restaurants/{restaurant_id}/reviews",
			json={
				"email": "author@example.com",
				"rating": 5,
				"comment": "Excellent",
			},
		)
		review_id = review_response.json()["id"]
		voter_response = client.post(
			"/users", json={"email": "voter@example.com"}
		)
		voter_id = voter_response.json()["id"]
		first_vote = client.post(
			f"/reviews/{review_id}/votes",
			json={"email": "voter@example.com", "is_helpful": True},
		)
		updated_vote = client.post(
			f"/reviews/{review_id}/votes",
			json={"email": "voter@example.com", "is_helpful": False},
		)
		reviews_response = client.get(
			f"/restaurants/{restaurant_id}/reviews",
			params={"viewer_id": voter_id},
		)

	assert review_response.status_code == 201
	assert voter_response.status_code == 201
	assert first_vote.status_code == 201
	assert updated_vote.status_code == 201
	assert reviews_response.status_code == 200
	assert reviews_response.json()[0]["helpful_votes"] == 0
	assert reviews_response.json()[0]["unhelpful_votes"] == 1
	assert reviews_response.json()[0]["viewer_vote"] is False


def test_follow_and_unfollow_updates_user_profiles(initialized_test_database):
	with TestClient(main_module.app) as client:
		followed_response = client.post(
			"/users", json={"email": "followed@example.com"}
		)
		follower_response = client.post(
			"/users", json={"email": "follower@example.com"}
		)
		followed_id = followed_response.json()["id"]
		follower_id = follower_response.json()["id"]
		follow_response = client.post(
			f"/users/{followed_id}/follow", params={"follower_id": follower_id}
		)
		followed_profile = client.get(
			f"/users/{followed_id}", params={"viewer_id": follower_id}
		)
		unfollow_response = client.delete(
			f"/users/{followed_id}/follow", params={"follower_id": follower_id}
		)
		updated_profile = client.get(
			f"/users/{followed_id}", params={"viewer_id": follower_id}
		)

	assert followed_response.status_code == 201
	assert follower_response.status_code == 201
	assert follow_response.status_code == 200
	assert followed_profile.json()["followers_count"] == 1
	assert followed_profile.json()["is_following"] is True
	assert unfollow_response.status_code == 200
	assert updated_profile.json()["followers_count"] == 0
	assert updated_profile.json()["is_following"] is False