from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query

from db import connect, ensure_schema


@asynccontextmanager
async def lifespan(_app: FastAPI):
    with connect() as conn:
        ensure_schema(conn)
    yield


app = FastAPI(lifespan=lifespan)


def _list_user_reviews(cur, user_id: int) -> list[dict]:
    cur.execute(
        """
        SELECT rv.id, r.id, r.name, r.image_url, rv.rating, rv.comment
        FROM reviews AS rv
        JOIN restaurants AS r ON r.id = rv.restaurant_id
        WHERE rv.user_id = %s
        ORDER BY rv.id DESC
        """,
        (user_id,),
    )
    return [
        {
            "id": row[0],
            "restaurant_id": row[1],
            "restaurant_name": row[2],
            "restaurant_image_url": row[3],
            "rating": float(row[4]),
            "comment": row[5],
        }
        for row in cur.fetchall()
    ]


@app.get("/restaurants")
def search_restaurants(name: str = Query(default="", max_length=255)) -> list[dict]:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.id, r.name, r.category, r.image_url,
                       AVG(rv.rating) AS average_rating,
                      COUNT(rv.id) AS review_count,
                      COUNT(rv.id) FILTER (WHERE ROUND(rv.rating) = 1),
                      COUNT(rv.id) FILTER (WHERE ROUND(rv.rating) = 2),
                      COUNT(rv.id) FILTER (WHERE ROUND(rv.rating) = 3),
                      COUNT(rv.id) FILTER (WHERE ROUND(rv.rating) = 4),
                      COUNT(rv.id) FILTER (WHERE ROUND(rv.rating) = 5)
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
                    "rating_counts": list(row[6:11]),
                }
                for row in cur.fetchall()
            ]


@app.get("/restaurants/{restaurant_id}/reviews")
def list_restaurant_reviews(restaurant_id: int) -> list[dict]:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT rv.id, u.email, rv.rating, rv.comment
                FROM reviews AS rv
                JOIN users AS u ON u.id = rv.user_id
                WHERE rv.restaurant_id = %s
                  AND rv.comment IS NOT NULL
                  AND BTRIM(rv.comment) <> ''
                ORDER BY rv.id DESC
                """,
                (restaurant_id,),
            )
            return [
                {
                    "id": row[0],
                    "email": row[1],
                    "rating": float(row[2]),
                    "comment": row[3],
                }
                for row in cur.fetchall()
            ]


@app.get("/users")
def search_users(name: str = Query(default="", max_length=50)) -> list[dict]:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.username, COUNT(rv.id) AS review_count
                FROM users AS u
                LEFT JOIN reviews AS rv ON rv.user_id = u.id
                WHERE %s = '' OR u.username ILIKE %s
                GROUP BY u.id
                ORDER BY u.username
                """,
                (name, f"%{name}%"),
            )
            return [
                {
                    "id": row[0],
                    "username": row[1],
                    "review_count": row[2],
                }
                for row in cur.fetchall()
            ]


@app.get("/users/{user_id}")
def get_user_profile(
    user_id: int,
    viewer_id: int | None = Query(default=None),
) -> dict:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.username,
                       (SELECT COUNT(*) FROM follows WHERE followed_id = u.id),
                       (SELECT COUNT(*) FROM follows WHERE follower_id = u.id)
                FROM users AS u
                WHERE u.id = %s
                """,
                (user_id,),
            )
            row = cur.fetchone()
            if row is None:
                raise HTTPException(
                    status_code=404, detail="Usuário não encontrado."
                )
            is_following = False
            if viewer_id is not None:
                cur.execute(
                    """
                    SELECT 1 FROM follows
                    WHERE follower_id = %s AND followed_id = %s
                    """,
                    (viewer_id, user_id),
                )
                is_following = cur.fetchone() is not None
            return {
                "id": row[0],
                "username": row[1],
                "followers_count": row[2],
                "following_count": row[3],
                "is_following": is_following,
                "reviews": _list_user_reviews(cur, user_id),
            }


@app.get("/users/{user_id}/reviews")
def list_user_reviews(user_id: int) -> list[dict]:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM users WHERE id = %s", (user_id,))
            if cur.fetchone() is None:
                raise HTTPException(
                    status_code=404, detail="Usuário não encontrado."
                )
            return _list_user_reviews(cur, user_id)