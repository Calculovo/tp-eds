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