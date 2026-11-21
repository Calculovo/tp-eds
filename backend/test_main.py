from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from backend import main as main_module


def _mock_database(monkeypatch):
	connection = MagicMock()
	connection.__enter__.return_value = connection
	cursor = connection.cursor.return_value.__enter__.return_value
	monkeypatch.setattr(main_module, "connect", MagicMock(return_value=connection))
	return cursor


def test_search_restaurants_maps_results_and_search_pattern(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchall.return_value = [
		(1, "Cafe", "Coffee", "cafe.jpg", 4.5, 2, 0, 0, 0, 1, 1),
		(2, "New Cafe", "Bakery", None, None, 0, 0, 0, 0, 0, 0),
	]

	result = main_module.search_restaurants(name="Cafe")

	assert result == [
		{
			"id": 1,
			"name": "Cafe",
			"category": "Coffee",
			"image_url": "cafe.jpg",
			"average_rating": 4.5,
			"review_count": 2,
			"rating_counts": [0, 0, 0, 1, 1],
		},
		{
			"id": 2,
			"name": "New Cafe",
			"category": "Bakery",
			"image_url": None,
			"average_rating": None,
			"review_count": 0,
			"rating_counts": [0, 0, 0, 0, 0],
		},
	]
	assert cursor.execute.call_args.args[1] == ("Cafe", "%Cafe%")


def test_get_restaurant_returns_summary(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchone.return_value = (4, "Cafe", "Coffee", "cafe.jpg", 4.0, 1, 0, 0, 0, 1, 0)

	result = main_module.get_restaurant(restaurant_id=4)

	assert result == {
		"id": 4,
		"name": "Cafe",
		"category": "Coffee",
		"image_url": "cafe.jpg",
		"average_rating": 4.0,
		"review_count": 1,
		"rating_counts": [0, 0, 0, 1, 0],
	}
	assert cursor.execute.call_args.args[1] == (4,)


def test_get_restaurant_raises_404_when_missing(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchone.return_value = None

	with pytest.raises(HTTPException) as error:
		main_module.get_restaurant(restaurant_id=404)

	assert error.value.status_code == 404
	assert error.value.detail == "Restaurant not found"


def test_create_review_returns_404_for_missing_restaurant(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchone.return_value = None
	get_or_create_user = MagicMock(return_value=9)
	monkeypatch.setattr(main_module, "get_or_create_user", get_or_create_user)
	review = main_module.ReviewIn(
		email="sam@example.com", rating=4.5, comment="Good"
	)

	with pytest.raises(HTTPException) as error:
		main_module.create_review(restaurant_id=3, review=review)

	assert error.value.status_code == 404
	assert error.value.detail == "Restaurant not found"
	get_or_create_user.assert_not_called()


def test_create_review_inserts_review_and_commits(monkeypatch):
	connection = MagicMock()
	connection.__enter__.return_value = connection
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchone.side_effect = [(3,), (21,)]
	monkeypatch.setattr(main_module, "connect", MagicMock(return_value=connection))
	get_or_create_user = MagicMock(return_value=9)
	monkeypatch.setattr(main_module, "get_or_create_user", get_or_create_user)
	review = main_module.ReviewIn(
		email="sam@example.com", rating=4.5, comment="Good"
	)

	result = main_module.create_review(restaurant_id=3, review=review)

	assert result == {"id": 21}
	get_or_create_user.assert_called_once_with(cursor, "sam@example.com")
	assert cursor.execute.call_args.args[1] == (9, 3, 4.5, "Good")
	connection.commit.assert_called_once()


def test_vote_review_returns_404_for_missing_review(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchone.return_value = None
	get_or_create_user = MagicMock(return_value=9)
	monkeypatch.setattr(main_module, "get_or_create_user", get_or_create_user)
	vote = main_module.VoteIn(email="sam@example.com", is_helpful=True)

	with pytest.raises(HTTPException) as error:
		main_module.vote_review(review_id=12, vote=vote)

	assert error.value.status_code == 404
	assert error.value.detail == "Review not found"
	get_or_create_user.assert_not_called()


def test_vote_review_upserts_vote_and_commits(monkeypatch):
	connection = MagicMock()
	connection.__enter__.return_value = connection
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchone.return_value = (12,)
	monkeypatch.setattr(main_module, "connect", MagicMock(return_value=connection))
	get_or_create_user = MagicMock(return_value=9)
	monkeypatch.setattr(main_module, "get_or_create_user", get_or_create_user)
	vote = main_module.VoteIn(email="sam@example.com", is_helpful=False)

	result = main_module.vote_review(review_id=12, vote=vote)

	assert result == {"status": "ok"}
	get_or_create_user.assert_called_once_with(cursor, "sam@example.com")
	assert cursor.execute.call_args.args[1] == (12, 9, False)
	connection.commit.assert_called_once()


def test_list_restaurant_reviews_maps_vote_fields(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchall.return_value = [
		(5, 7, "sam", "sam@example.com", 4.5, "Nice", 3, 1, True)
	]

	result = main_module.list_restaurant_reviews(restaurant_id=3, viewer_id=9)

	assert result == [
		{
			"id": 5,
			"user_id": 7,
			"username": "sam",
			"email": "sam@example.com",
			"rating": 4.5,
			"comment": "Nice",
			"helpful_votes": 3,
			"unhelpful_votes": 1,
			"viewer_vote": True,
		}
	]
	assert cursor.execute.call_args.args[1] == (9, 3, 9)


def test_list_top_reviews_maps_review_and_computes_score(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchall.return_value = [
		(5, 7, "sam", 3, "Cafe", 4.5, "Nice", 4, 1, False)
	]

	result = main_module.list_top_reviews(viewer_id=9)

	assert result == [
		{
			"id": 5,
			"user_id": 7,
			"username": "sam",
			"restaurant_id": 3,
			"restaurant_name": "Cafe",
			"rating": 4.5,
			"comment": "Nice",
			"helpful_votes": 4,
			"unhelpful_votes": 1,
			"viewer_vote": False,
			"score": 3,
		}
	]
	assert cursor.execute.call_args.args[1] == (9,)


def test_list_user_reviews_returns_review_data(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchone.return_value = (1,)
	cursor.fetchall.return_value = [
		(8, 4, "Cafe", "cafe.jpg", 4.5, "Nice", 2, 1, True)
	]

	result = main_module.list_user_reviews(user_id=5, viewer_id=9)

	assert result == [
		{
			"id": 8,
			"restaurant_id": 4,
			"restaurant_name": "Cafe",
			"restaurant_image_url": "cafe.jpg",
			"rating": 4.5,
			"comment": "Nice",
			"helpful_votes": 2,
			"unhelpful_votes": 1,
			"viewer_vote": True,
		}
	]
	cursor.execute.assert_any_call("SELECT 1 FROM users WHERE id = %s", (5,))


def test_list_user_reviews_raises_404_for_missing_user(monkeypatch):
	cursor = _mock_database(monkeypatch)
	cursor.fetchone.return_value = None

	with pytest.raises(HTTPException) as error:
		main_module.list_user_reviews(user_id=404, viewer_id=None)

	assert error.value.status_code == 404
	assert error.value.detail == "Usuário não encontrado."