CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE follows (
    follower_id INTEGER NOT NULL REFERENCES users(id),
    followed_id INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (follower_id, followed_id),
    CHECK (follower_id <> followed_id)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT
);
