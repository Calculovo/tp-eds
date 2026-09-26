from fastapi import FastAPI, Query

from db import connect

app = FastAPI()


@app.get("/restaurants")
def search_restaurants(name: str = Query(default="", max_length=255)) -> list[dict]:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, name, category, image_url
                FROM restaurants
                WHERE %s = '' OR name ILIKE %s
                ORDER BY name
                """,
                (name, f"%{name}%"),
            )
            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "category": row[2],
                    "image_url": row[3],
                }
                for row in cur.fetchall()
            ]