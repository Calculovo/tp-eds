# UML Diagram
```mermaid
classDiagram
    class ReactApp {
        +tela
        +emailLogado
        +viewerId
        +usuarioSelecionado
        +restauranteSelecionado
        +buscarRestaurante()
        +abrirRestaurante()
        +selecionarUsuario()
        +sair()
    }

    class Login
    class Cadastro
    class ListaRestaurantes
    class PerfilUsuario
    class AvaliarRestaurante
    class TopReviews
    class BotoesVotoReview
    class NavegacaoLogada

    class FastAPIApp {
        +search_restaurants(name)
        +get_restaurant(id)
        +create_review(restaurant_id, review)
        +vote_review(review_id, vote)
        +list_restaurant_reviews(restaurant_id, viewer_id)
        +list_top_reviews(viewer_id)
        +search_users(name, email)
        +create_or_get_user(user)
        +get_user_profile(user_id, viewer_id)
        +follow_user(user_id, follower_id)
        +unfollow_user(user_id, follower_id)
        +reset_password(payload)
        +update_username(user_id, payload)
    }

    class User {
        +int id
        +string email
        +string username
        +string password
        +createOrGetUser()
        +resetPassword()
        +updateUsername()
    }

    class Restaurant {
        +int id
        +string name
        +string category
        +string image_url
    }

    class Review {
        +int id
        +int user_id
        +int restaurant_id
        +float rating
        +string comment
    }

    class ReviewVote {
        +int id
        +int review_id
        +int user_id
        +bool is_helpful
    }

    class Follow {
        +int follower_id
        +int followed_id
    }

    ReactApp --> Login
    ReactApp --> Cadastro
    ReactApp --> ListaRestaurantes
    ReactApp --> PerfilUsuario
    ReactApp --> AvaliarRestaurante
    ReactApp --> TopReviews
    ReactApp --> NavegacaoLogada
    ReactApp --> BotoesVotoReview

    FastAPIApp --> User
    FastAPIApp --> Restaurant
    FastAPIApp --> Review
    FastAPIApp --> ReviewVote
    FastAPIApp --> Follow

    User "1" --> "0..*" Review : writes
    Restaurant "1" --> "0..*" Review : receives
    Review "1" --> "0..*" ReviewVote : has
    User "1" --> "0..*" ReviewVote : votes
    User "1" --> "0..*" Follow : follows
    User "1" --> "0..*" Follow : is followed by
```
