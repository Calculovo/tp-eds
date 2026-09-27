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

SAMPLE_REVIEWS = [
    (
        "ana@example.com",
        "Pizzaria Bella Italia",
        5.0,
        "Massa excelente e atendimento atencioso.",
    ),
    (
        "bruno@example.com",
        "Pizzaria Bella Italia",
        4.0,
        "Boa pizza, mas o tempo de espera foi longo.",
    ),
    (
        "carla@example.com",
        "Burguer House",
        4.0,
        "Hamburguer saboroso e bem servido.",
    ),
    (
        "diego@example.com",
        "Burguer House",
        5.0,
        "Um dos melhores hamburgueres da cidade.",
    ),
    (
        "elisa@example.com",
        "Sushi Garden",
        5.0,
        "Peixe fresco e pratos muito bem apresentados.",
    ),
]


def seed_reviews(cur) -> None:
    for email, restaurant_name, rating, comment in SAMPLE_REVIEWS:
        cur.execute(
            "SELECT id FROM restaurants WHERE name = %s",
            (restaurant_name,),
        )
        restaurant = cur.fetchone()
        if restaurant is None:
            raise ValueError(f"Restaurant not found: {restaurant_name}")
        restaurant_id = restaurant[0]

        cur.execute(
            "INSERT INTO users (email) VALUES (%s) ON CONFLICT (email) DO NOTHING",
            (email,),
        )
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        user_id = cur.fetchone()[0]

        cur.execute(
            "SELECT 1 FROM reviews WHERE user_id = %s AND restaurant_id = %s",
            (user_id, restaurant_id),
        )
        if cur.fetchone() is None:
            cur.execute(
                """
                INSERT INTO reviews (user_id, restaurant_id, rating, comment)
                VALUES (%s, %s, %s, %s)
                """,
                (user_id, restaurant_id, rating, comment),
            )


def seed() -> None:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM restaurants")
            if cur.fetchone()[0] == 0:
                cur.executemany(
                    "INSERT INTO restaurants (name, category, image_url) VALUES (%s, %s, %s)",
                    RESTAURANTS,
                )
            seed_reviews(cur)
            cur.execute(
                """
                SELECT r.name, AVG(rv.rating), COUNT(rv.id)
                FROM restaurants AS r
                LEFT JOIN reviews AS rv ON rv.restaurant_id = r.id
                GROUP BY r.id
                ORDER BY r.id
                """
            )
            for row in cur.fetchall():
                print(row)


if __name__ == "__main__":
    seed()
