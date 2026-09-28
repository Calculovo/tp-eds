from db import connect, ensure_schema, get_or_create_user

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

SAMPLE_FOLLOWS = [
    ("ana@example.com", "bruno@example.com"),
    ("ana@example.com", "carla@example.com"),
    ("bruno@example.com", "ana@example.com"),
    ("carla@example.com", "diego@example.com"),
    ("diego@example.com", "ana@example.com"),
    ("diego@example.com", "elisa@example.com"),
    ("elisa@example.com", "ana@example.com"),
    ("elisa@example.com", "bruno@example.com"),
    ("elisa@example.com", "carla@example.com"),
]

SAMPLE_VOTES = [
    ("bruno@example.com", "ana@example.com", "Pizzaria Bella Italia", True),
    ("carla@example.com", "ana@example.com", "Pizzaria Bella Italia", True),
    ("diego@example.com", "ana@example.com", "Pizzaria Bella Italia", True),
    ("ana@example.com", "bruno@example.com", "Pizzaria Bella Italia", False),
    ("elisa@example.com", "bruno@example.com", "Pizzaria Bella Italia", True),
    ("ana@example.com", "carla@example.com", "Burguer House", True),
    ("elisa@example.com", "diego@example.com", "Burguer House", True),
    ("bruno@example.com", "diego@example.com", "Burguer House", False),
    ("ana@example.com", "elisa@example.com", "Sushi Garden", True),
    ("carla@example.com", "elisa@example.com", "Sushi Garden", True),
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

        user_id = get_or_create_user(cur, email)

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

def seed_votes(cur) -> None:
    for voter_email, author_email, restaurant_name, is_like in SAMPLE_VOTES:
        cur.execute("SELECT id FROM users WHERE email = %s", (voter_email,))
        voter = cur.fetchone()

        cur.execute(
            """
            SELECT rv.id
            FROM reviews AS rv
            JOIN users AS u ON u.id = rv.user_id
            JOIN restaurants AS r ON r.id = rv.restaurant_id
            WHERE u.email = %s AND r.name = %s
            """,
            (author_email, restaurant_name),
        )
        review = cur.fetchone()

        if voter is None or review is None:
            continue

        cur.execute(
            """
            INSERT INTO review_votes (review_id, user_id, is_helpful)
            VALUES (%s, %s, %s)
            ON CONFLICT (review_id, user_id) DO NOTHING
            """,
            (review[0], voter[0], is_like),
        )

def seed_follows(cur) -> None:
    for follower_email, followed_email in SAMPLE_FOLLOWS:
        cur.execute("SELECT id FROM users WHERE email = %s", (follower_email,))
        follower = cur.fetchone()
        cur.execute("SELECT id FROM users WHERE email = %s", (followed_email,))
        followed = cur.fetchone()
        if follower is None or followed is None:
            continue
        cur.execute(
            """
            INSERT INTO follows (follower_id, followed_id)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            """,
            (follower[0], followed[0]),
        )


def seed() -> None:
    with connect() as conn:
        ensure_schema(conn)
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM restaurants")
            if cur.fetchone()[0] == 0:
                cur.executemany(
                    "INSERT INTO restaurants (name, category, image_url) VALUES (%s, %s, %s)",
                    RESTAURANTS,
                )
            seed_reviews(cur)
            seed_follows(cur)
            seed_votes(cur)
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
