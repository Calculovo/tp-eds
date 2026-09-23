from db import connect

RESTAURANTS = [
    (
        "Pizzaria Bella Italia",
        "Italiana",
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300",
    ),
    (
        "Burguer House",
        "Hambúrguer",
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    ),
    (
        "Sushi Garden",
        "Japonesa",
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66d?w=300",
    ),
]


def seed() -> None:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM restaurants")
            if cur.fetchone()[0] == 0:
                cur.executemany(
                    "INSERT INTO restaurants (name, category, image_url) VALUES (%s, %s, %s)",
                    RESTAURANTS,
                )
            cur.execute("SELECT id, name, category FROM restaurants ORDER BY id")
            for row in cur.fetchall():
                print(row)


if __name__ == "__main__":
    seed()
