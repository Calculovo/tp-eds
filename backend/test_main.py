from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from backend import main as main_module


def test_list_user_reviews_returns_review_data(monkeypatch):
	connection = MagicMock()
	connection.__enter__.return_value = connection
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchone.return_value = (1,)
	cursor.fetchall.return_value = [
		(8, 4, "Cafe", "cafe.jpg", 4.5, "Nice", 2, 1, True)
	]
	monkeypatch.setattr(main_module, "connect", MagicMock(return_value=connection))

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
	connection = MagicMock()
	connection.__enter__.return_value = connection
	cursor = connection.cursor.return_value.__enter__.return_value
	cursor.fetchone.return_value = None
	monkeypatch.setattr(main_module, "connect", MagicMock(return_value=connection))

	with pytest.raises(HTTPException) as error:
		main_module.list_user_reviews(user_id=404, viewer_id=None)

	assert error.value.status_code == 404
	assert error.value.detail == "Usuário não encontrado."