from fastapi import FastAPI, Query

from db import connect

app = FastAPI()


@app.get("/restaurants")
def search_restaurants(name: str = Query(default="", max_length=255)) -> list[dict]:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.id, r.name, r.category, r.image_url,
                       AVG(rv.rating) AS average_rating,
                       COUNT(rv.id) AS review_count
                FROM restaurants AS r
                LEFT JOIN reviews AS rv ON rv.restaurant_id = r.id
                WHERE %s = '' OR r.name ILIKE %s
                GROUP BY r.id
                ORDER BY r.name
                """,
                (name, f"%{name}%"),
            )
            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "category": row[2],
                    "image_url": row[3],
                    "average_rating": (
                        float(row[4]) if row[4] is not None else None
                    ),
                    "review_count": row[5],
                }
                for row in cur.fetchall()
            ]